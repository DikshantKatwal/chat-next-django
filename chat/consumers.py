# chat/consumers.py
import json
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()


def generate_room_name(user1_id, user2_id):
    ids = sorted([int(user1_id), int(user2_id)])
    return f"dm_{ids[0]}_{ids[1]}"


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        params = dict(q.split("=") for q in query_string.split("&") if "=" in q)
        recipient_id = params.get("recipient_id")

        if not self.scope["user"].is_authenticated or not recipient_id:
            await self.close()
            return

        self.user = self.scope["user"]
        self.recipient = await self.get_user(recipient_id)
        if not self.recipient:
            await self.close()
            return

        self.room_name = generate_room_name(self.user.id, self.recipient.id)
        self.room_group_name = f"chat_{self.room_name}"

        # Create or fetch the room
        self.room = await self.add_users_to_room(self.user, self.recipient)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # 1️⃣ Send previous messages to the client
        history = await self.get_chat_history(self.room)
        await self.send(text_data=json.dumps({"type": "history", "messages": history}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")
        if not message:
            return

        await self.save_message(self.user, message)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": self.user.username,
                "user_id": self.user.id,
                "timestamp": datetime.now().isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # === DB helpers ===
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.filter(id=user_id).first()

    @database_sync_to_async
    def add_users_to_room(self, user1, user2):
        room_name = generate_room_name(user1.id, user2.id)
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        room.participants.add(user1, user2)
        return room

    @database_sync_to_async
    def save_message(self, sender, text):
        Message.objects.create(room=self.room, sender=sender, text=text)

    @database_sync_to_async
    def get_chat_history(self, room):
        """Fetch last 50 messages and serialize them"""
        messages = Message.objects.filter(room=room).order_by("timestamp")[:50]
        return [
            {
                "message": m.text,
                "username": m.sender.username,
                "user_id": m.sender.id,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in messages
        ]

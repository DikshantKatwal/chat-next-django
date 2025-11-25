# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()


def generate_room_name(user1_id, user2_id):
    ids = sorted([str(user1_id), str(user2_id)])
    return f"dm_{ids[0]}_{ids[1]}"


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Single WebSocket for the whole user session"""
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
        self.user = self.scope["user"]

        self.user_group = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        rooms = await self.get_user_rooms(self.user)
        for room in rooms:
            await self.channel_layer.group_add(f"chat_{room.name}", self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "load_chat":
            username = data["username"]
            recipient = await self.get_user(username)
            print("Recipient:", recipient)
            print("self.user:", self.user)
            room = await self.add_users_to_room(self.user, recipient)
            history = await self.get_chat_history(room)

            await self.send(
                json.dumps(
                    {"type": "history", "username": username, "messages": history}
                )
            )
            return

        if action == "typing":
            recipient = await self.get_user(data["username"])
            await self.channel_layer.group_send(
                f"user_{recipient.id}",
                {
                    "type": "typing",
                    "from_user": self.user.username,
                    "room": generate_room_name(self.user.id, recipient.id),
                },
            )
            return

        if action == "stop_typing":
            recipient = await self.get_user(data["username"])
            await self.channel_layer.group_send(
                f"user_{recipient.id}",
                {
                    "type": "stop_typing",
                    "from_user": self.user.username,
                    "room": generate_room_name(self.user.id, recipient.id),
                },
            )
            return

        if action == "send_message":
            text = data["message"]
            username = data["username"]

            recipient = await self.get_user(username)
            room = await self.add_users_to_room(self.user, recipient)

            await self.save_message(room, self.user, text)

            event = {
                "type": "chat_message",
                "room": room.name,
                "username": self.user.username,
                "message": text,
            }

            # Broadcast to the room
            await self.channel_layer.group_send(f"chat_{room.name}", event)

            # Also notify the recipient
            await self.channel_layer.group_send(
                f"user_{recipient.id}",
                {
                    "type": "notify",
                    "from_user": self.user.username,
                    "message": text,
                    "room": room.name,
                },
            )
            return

    # === Event Handlers ===
    async def chat_message(self, event):
        await self.send(json.dumps(event))

    async def notify(self, event):
        await self.send(json.dumps(event))

    async def typing(self, event):
        await self.send(json.dumps(event))

    async def stop_typing(self, event):
        await self.send(json.dumps(event))

    # === DB Helpers ===
    @database_sync_to_async
    def get_user(self, username):
        return User.objects.filter(username__iexact=username).first()

    @database_sync_to_async
    def add_users_to_room(self, user1, user2):
        room_name = generate_room_name(user1.id, user2.id)
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        room.participants.add(user1, user2)
        return room

    @database_sync_to_async
    def save_message(self, room, sender, text):
        Message.objects.create(room=room, sender=sender, text=text)

    @database_sync_to_async
    def get_chat_history(self, room):
        messages = Message.objects.filter(room=room).order_by("timestamp")
        return [
            {
                "message": m.text,
                "username": m.sender.username,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in messages
        ]

    @database_sync_to_async
    def get_user_rooms(self, user):
        return list(ChatRoom.objects.filter(participants=user))

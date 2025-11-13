from rest_framework import serializers
from django.contrib.auth import get_user_model

from chat.models import ChatRoom
from users.models import User


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "username"]


class ChatRoomSerializer(serializers.ModelSerializer):
    connected_with = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ["id", "name", "connected_with", "created_at"]

    def get_connected_with(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        user = request.user
        # Exclude self from participant list
        others = obj.participants.exclude(id=user.id).first()
        return ParticipantSerializer(others, many=False).data

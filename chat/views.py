from rest_framework import viewsets, permissions

from chat.serializers import ChatRoomSerializer
from users.serializers import UserSerializer
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model


class AllUserViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        return get_user_model().objects.exclude(id=user.id)


class ConnectedUsers(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(participants=user).prefetch_related(
            "participants"
        )

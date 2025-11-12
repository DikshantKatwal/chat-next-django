from rest_framework import viewsets, permissions
from .models import ChatRoom, Message
from .serializers import UserSerializer
from django.contrib.auth import get_user_model


class AllUserViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

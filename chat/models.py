# chat/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatRoom(models.Model):
    participants = models.ManyToManyField(User, related_name="chat_rooms", blank=False)
    name = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom, related_name="messages", on_delete=models.CASCADE
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    file = models.FileField(upload_to="chat_files/", null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    reply_to = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="replies",
    )

    class Meta:
        ordering = ["timestamp"]
        indexes = [models.Index(fields=["room", "timestamp"])]

    def __str__(self):
        return f"{self.sender.username}: {self.text[:20]}"

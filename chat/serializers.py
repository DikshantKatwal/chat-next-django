from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = "__all__"
        exclude = [
            "password",
            "first_name",
            "last_name",
            "is_staff",
            "last_login",
            "is_active",
            "date_joined",
            "groups",
            "user_permissions",
        ]

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from users.models import User
from rest_framework.permissions import IsAuthenticated

from users.serializers import UserSerializer


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(email=email, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                }
            )
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


class ProfileView(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        data = request.data.copy()
        if "first_name" in data and isinstance(data["first_name"], str):
            data["first_name"] = data["first_name"].title()
        if "last_name" in data and isinstance(data["last_name"], str):
            data["last_name"] = data["last_name"].title()
        request._full_data = data  # ensures serializer sees updated data

        return super().partial_update(request, *args, **kwargs)


class RegisterUser(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "first_name" in data and isinstance(data["first_name"], str):
            data["first_name"] = data["first_name"].title()
        if "last_name" in data and isinstance(data["last_name"], str):
            data["last_name"] = data["last_name"].title()
        request._full_data = data  # ensures serializer sees updated data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        )

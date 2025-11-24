import time
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


def make_title_case(name):
    if isinstance(name, str):
        return name.title()
    return name


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
        data["first_name"] = make_title_case(data.get("first_name", ""))
        data["last_name"] = make_title_case(data.get("last_name", ""))
        request._full_data = data  # ensures serializer sees updated data

        return super().partial_update(request, *args, **kwargs)


class ProfileView(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username")
        print(username)
        time.sleep(1)
        if username:
            self.queryset = self.queryset.filter(username__icontains=username).exclude(
                id=request.user.id
            )
        print(self.queryset)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        data = request.data.copy()
        data["first_name"] = make_title_case(data.get("first_name", ""))
        data["last_name"] = make_title_case(data.get("last_name", ""))
        request._full_data = data  # ensures serializer sees updated data

        return super().partial_update(request, *args, **kwargs)


class RegisterUser(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["first_name"] = make_title_case(data.get("first_name", ""))
        data["last_name"] = make_title_case(data.get("last_name", ""))
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


# from rest_framework.decorators import api_view
# from django.core.cache import cache
# @api_view(["GET"])
# def caching_tester(request):
#     cache_key = f"last_value"
#     cached_data = cache.get(cache_key)
#     if cached_data:
#         return Response(cached_data, status=status.HTTP_200_OK)
#     for i in range(100000000):
#         last_value = i
#     cache.set(cache_key, {"last_value": last_value}, timeout=3600)
#     return Response({"last_value": last_value})

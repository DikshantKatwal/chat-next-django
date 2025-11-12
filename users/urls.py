from django.urls import path
from .views import LoginView, ProfileView, RegisterUser

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("me/", ProfileView.as_view({"get": "retrieve"}), name="me"),
    path(
        "me/edit/", ProfileView.as_view({"patch": "partial_update"}), name="update_me"
    ),
    path("register/", RegisterUser.as_view({"post": "create"}), name="register"),
    path("all/", ProfileView.as_view({"get": "list"}), name="all"),
]

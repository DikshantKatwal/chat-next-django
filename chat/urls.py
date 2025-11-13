from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path, include

router = DefaultRouter()
router.register("all-users", views.AllUserViewSet, basename="all-users")
router.register("connections", views.ConnectedUsers, basename="connection-users")

urlpatterns = [
    path("", include(router.urls)),
]

from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async


class TokenAuthMiddleware:
    """
    Custom token authentication middleware for Django Channels.
    Supports ?token=<key> or Authorization header.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        user = await self.get_user(scope)
        scope["user"] = user
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, scope):
        query_string = parse_qs(scope.get("query_string", b"").decode())
        token_key = query_string.get("token", [None])[0]
        headers = dict(scope.get("headers", []))
        auth_header = headers.get(b"authorization")

        # Default anonymous
        user = AnonymousUser()

        if auth_header:
            # Example: b"authorization": b"Token 12345" or b"Bearer <token>"
            auth_header = auth_header.decode()
            if auth_header.startswith("Token "):
                token_key = auth_header.split("Token ")[1]
            elif auth_header.startswith("Bearer "):
                token_key = auth_header.split("Bearer ")[1]

        if token_key:
            try:
                token = Token.objects.select_related("user").get(key=token_key)
                print(f"✅ Authenticated via token: {token.user}")
                return token.user
            except Token.DoesNotExist:
                print("⚠️ Invalid token")

        print("⚠️ No token provided or invalid.")
        return user


def TokenAuthMiddlewareStack(inner):
    """Wrapper identical to AuthMiddlewareStack but using token-param auth."""
    from channels.auth import AuthMiddlewareStack

    return TokenAuthMiddleware(AuthMiddlewareStack(inner))

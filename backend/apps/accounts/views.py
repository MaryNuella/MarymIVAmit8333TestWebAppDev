from django.contrib.auth.hashers import make_password
from rest_framework import generics, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        if not password:
            raise serializers.ValidationError({'password': 'Password is required'})
        serializer.save(password=make_password(password))


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.select_related('role').all()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role and user.role.name == 'admin':
            queryset = self.queryset
            role = self.request.query_params.get('role')
            if role:
                queryset = queryset.filter(role__name=role)
            return queryset
        return self.queryset.filter(id=user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

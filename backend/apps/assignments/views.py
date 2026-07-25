from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Assignment
from .serializers import AssignmentSerializer


@extend_schema_view(
    list=extend_schema(operation_id='MaryWebAppAPI', tags=['MaryWebAppAPI']),
)
class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Assignment.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_assignments(self, request):
        user = request.user
        queryset = self.get_queryset().filter(assigned_to=user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role and user.role.name == 'admin':
            return Assignment.objects.all()
        if user.is_authenticated and user.role and user.role.name == 'officer':
            return Assignment.objects.filter(assigned_to=user)
        return Assignment.objects.filter(request__requester=user)

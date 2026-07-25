import csv

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from rest_framework import status as drf_status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, ServiceRequest, StatusUpdate
from .serializers import CategorySerializer, ServiceRequestSerializer

User = get_user_model()


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = ServiceRequest.objects.select_related('requester', 'assigned_to', 'category').prefetch_related('status_updates')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to']
    search_fields = ['title', 'description', 'building', 'room_number', 'requester__username', 'assigned_to__username']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ServiceRequest.objects.none()

        base_queryset = super().get_queryset()
        role_name = user.role.name if user.role else None
        if role_name == 'admin':
            return base_queryset
        if role_name == 'officer':
            from django.db.models import Q
            return base_queryset.filter(Q(assigned_to=user) | Q(status='pending'))
        return base_queryset.filter(requester=user)

    def perform_create(self, serializer):
        try:
            request_obj = serializer.save(requester=self.request.user)
            StatusUpdate.objects.create(
                request=request_obj,
                status=request_obj.status,
                notes='Request submitted',
                updated_by=self.request.user,
            )
        except Exception as exc:
            raise ValidationError({'error': str(exc)}) from exc

    def perform_update(self, serializer):
        user = self.request.user
        role_name = user.role.name if user.role else None
        request_obj = self.get_object()
        if role_name not in ['admin', 'officer'] and request_obj.requester_id != user.id:
            raise PermissionDenied('You cannot update this request')

        old_status = request_obj.status
        updated = serializer.save()
        if old_status != updated.status:
            StatusUpdate.objects.create(
                request=updated,
                status=updated.status,
                notes=self.request.data.get('notes', ''),
                updated_by=user,
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        request_obj = self.get_object()
        if request.user.role is None:
            return Response({'error': 'User has no role assigned'}, status=400)
        if request.user.role.name != 'admin':
            return Response({'error': 'Only admins can assign'}, status=403)

        officer_id = request.data.get('officer_id')
        if not officer_id:
            return Response({'error': 'officer_id is required'}, status=400)

        try:
            officer = User.objects.get(id=officer_id, role__name='officer')
        except User.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=404)

        notes = request.data.get('notes', '')
        request_obj.assigned_to = officer
        request_obj.status = 'assigned'
        request_obj.save()

        from apps.assignments.models import Assignment
        Assignment.objects.create(
            request=request_obj,
            assigned_by=request.user,
            assigned_to=officer,
            notes=notes,
        )
        StatusUpdate.objects.create(
            request=request_obj,
            status='assigned',
            notes=notes or f'Assigned to {officer.username}',
            updated_by=request.user,
        )

        from apps.notifications.models import Notification
        Notification.objects.create(
            recipient=officer,
            title='Request Assigned',
            message=f'Request #{request_obj.id}: {request_obj.title} has been assigned to you.',
        )
        return Response({'message': 'Request assigned successfully'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        request_obj = self.get_object()
        role_name = request.user.role.name if request.user.role else None
        if role_name == 'officer' and request_obj.assigned_to_id != request.user.id:
            return Response({'error': 'Only the assigned officer can update this request'}, status=403)
        if role_name not in ['admin', 'officer']:
            return Response({'error': 'Only admins and officers can update status'}, status=403)

        new_status = request.data.get('status')
        if new_status not in dict(ServiceRequest.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=drf_status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('notes', '')
        request_obj.status = new_status
        if new_status == 'completed':
            request_obj.completed_at = timezone.now()
            request_obj.completion_notes = notes
        request_obj.save()
        StatusUpdate.objects.create(
            request=request_obj,
            status=new_status,
            notes=notes,
            updated_by=request.user,
        )
        return Response(self.get_serializer(request_obj).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        request_obj = self.get_object()
        role_name = request.user.role.name if request.user.role else None
        if request_obj.assigned_to_id != request.user.id and role_name != 'admin':
            return Response({'error': 'Only assigned officer or admin can complete'}, status=403)

        notes = request.data.get('notes', '')
        request_obj.status = 'completed'
        request_obj.completed_at = timezone.now()
        request_obj.completion_notes = notes
        request_obj.save()
        StatusUpdate.objects.create(
            request=request_obj,
            status='completed',
            notes=notes,
            updated_by=request.user,
        )

        from apps.notifications.models import Notification
        Notification.objects.create(
            recipient=request_obj.requester,
            title='Request Completed',
            message=f'Your request #{request_obj.id}: {request_obj.title} has been completed.',
        )
        return Response({'message': 'Request completed successfully'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="requests.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Category', 'Status', 'Priority', 'Requester', 'Assigned To', 'Building', 'Room', 'Created At', 'Completed At'])
        for req in queryset:
            writer.writerow([
                req.id,
                req.title,
                req.category.name if req.category else '',
                req.status,
                req.priority,
                req.requester.username,
                req.assigned_to.username if req.assigned_to else '',
                req.building,
                req.room_number,
                req.created_at,
                req.completed_at or '',
            ])
        return response

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def export_pdf(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="requests.pdf"'
        doc = SimpleDocTemplate(response, pagesize=letter)
        data = [['ID', 'Title', 'Status', 'Priority', 'Requester', 'Created']]
        for req in queryset[:50]:
            data.append([str(req.id), req.title[:40], req.status, req.priority, req.requester.username, str(req.created_at.date())])
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4c1d95')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f3ff')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd6fe')),
        ]))
        doc.build([table])
        return response


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all().order_by('name')

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ServiceRequest
from apps.notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=ServiceRequest)
def handle_request_notifications(sender, instance, created, **kwargs):
    if created:
        admins = User.objects.filter(role__name='admin')
        for admin in admins:
            Notification.objects.create(
                recipient=admin,
                title='New Service Request',
                message=f'{instance.requester.username} created request: {instance.title}'
            )
        return

    if instance.status == 'assigned' and instance.assigned_to:
        Notification.objects.create(
            recipient=instance.assigned_to,
            title='Request Assigned',
            message=f'Request #{instance.id}: {instance.title} has been assigned to you.'
        )
    elif instance.status == 'completed':
        Notification.objects.create(
            recipient=instance.requester,
            title='Request Completed',
            message=f'Your request #{instance.id}: {instance.title} has been completed.'
        )

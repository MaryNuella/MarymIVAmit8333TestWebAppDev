from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('request_created', 'Request Created'),
        ('request_assigned', 'Request Assigned'),
        ('request_completed', 'Request Completed'),
        ('assignment_pending', 'Assignment Pending'),
        ('assignment_accepted', 'Assignment Accepted'),
        ('assignment_rejected', 'Assignment Rejected'),
        ('assignment_expired', 'Assignment Expired'),
        ('reminder', 'Reminder'),
        ('alert', 'Alert'),
        ('system', 'System Message'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


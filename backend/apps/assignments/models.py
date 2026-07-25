from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Assignment(models.Model):
    request = models.ForeignKey('requests.ServiceRequest', on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments_made')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments_received')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Assignment #{self.id}"

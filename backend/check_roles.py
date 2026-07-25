import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_api.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
for u in User.objects.all():
    role_name = u.role.name if u.role else 'No role'
    print(f'{u.username}: {role_name}')

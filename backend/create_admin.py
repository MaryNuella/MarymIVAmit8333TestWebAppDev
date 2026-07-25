import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_api.settings')

import django

django.setup()

from django.contrib.auth import get_user_model

from apps.accounts.models import Role


def main():
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@mary.com')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

    if not password:
        raise RuntimeError('Set DJANGO_SUPERUSER_PASSWORD before creating the admin user.')

    admin_role, _ = Role.objects.get_or_create(name='admin')
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_staff': True,
            'is_superuser': True,
            'role': admin_role,
        },
    )
    if not created:
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.role = admin_role
    user.set_password(password)
    user.save()
    print(f'Admin user ready: {username}')


if __name__ == '__main__':
    main()

from django.db import migrations


def seed_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    for name in ['admin', 'officer', 'student', 'staff']:
        Role.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_roles, migrations.RunPython.noop),
    ]

from django.db import migrations


def seed_categories(apps, schema_editor):
    Category = apps.get_model('requests', 'Category')
    for name in [
        'Electricity',
        'Plumbing',
        'Furniture',
        'Internet',
        'Classroom Equipment',
        'Hostel Maintenance',
        'Cleaning',
        'HVAC',
        'Building',
    ]:
        Category.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0002_request_status_workflow_and_logs'),
    ]

    operations = [
        migrations.RunPython(seed_categories, migrations.RunPython.noop),
    ]

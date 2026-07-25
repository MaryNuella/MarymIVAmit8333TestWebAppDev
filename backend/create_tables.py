import os
import subprocess
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_api.settings')
    subprocess.check_call([sys.executable, 'manage.py', 'migrate'])


if __name__ == '__main__':
    main()

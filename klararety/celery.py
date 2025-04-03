import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'klararety.settings')

app = Celery('klararety')

# Using a string means the worker doesn't have to serialize the configuration
# object to child processes
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Configure Celery beat schedule for periodic tasks
app.conf.beat_schedule = {
    'sync-wearable-data-every-hour': {
        'task': 'wearables.tasks.sync_wearable_data_for_all_users',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-old-wearable-data-weekly': {
        'task': 'wearables.tasks.cleanup_old_wearable_data',
        'schedule': 604800.0,  # Every week
        'kwargs': {'days_to_keep': 90},
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

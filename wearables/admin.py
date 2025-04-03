from django.utils import timezone
from django.contrib import admin
from .models import (
    WearableIntegration, WearableMeasurement, 
    WithingsProfile, WithingsMeasurement, SyncLog
)

class WearableMeasurementInline(admin.TabularInline):
    model = WearableMeasurement
    extra = 0
    fields = ('measurement_type', 'value', 'unit', 'measured_at')
    readonly_fields = ('measurement_type', 'value', 'unit', 'measured_at')
    max_num = 10
    can_delete = False
    verbose_name_plural = "Recent Measurements"

    def get_queryset(self, request):
        """Limit to the 10 most recent measurements"""
        qs = super().get_queryset(request)
        return qs.order_by('-measured_at')[:10]

@admin.register(WearableIntegration)
class WearableIntegrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'integration_type', 'connection_status', 'consent_granted', 'last_sync')
    list_filter = ('integration_type', 'status', 'consent_granted', 'created_at')
    search_fields = ('user__username', 'user__email', 'platform_user_id')
    readonly_fields = ('created_at', 'updated_at', 'token_expiry')
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'integration_type', 'status', 'platform_user_id')
        }),
        ('Authentication', {
            'fields': ('token_expiry',),
            'classes': ('collapse',),
        }),
        ('Consent', {
            'fields': ('consent_granted', 'consent_date')
        }),
        ('Data Collection', {
            'fields': (
                'collect_steps', 'collect_heart_rate', 'collect_weight', 
                'collect_sleep', 'collect_blood_pressure', 'collect_oxygen', 
                'collect_blood_glucose', 'collect_activity', 'collect_temperature'
            )
        }),
        ('Sync Information', {
            'fields': ('last_sync', 'sync_frequency')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'settings'),
            'classes': ('collapse',),
        }),
    )
    inlines = [WearableMeasurementInline]

    def connection_status(self, obj):
        """Display connection status with color indicators"""
        status_map = {
            'connected': '<span style="color:green;">●</span> Connected',
            'disconnected': '<span style="color:red;">●</span> Disconnected',
            'expired': '<span style="color:orange;">●</span> Token Expired',
            'error': '<span style="color:red;">●</span> Connection Error',
            'pending': '<span style="color:blue;">●</span> Pending',
        }
        return status_map.get(obj.status, obj.get_status_display())
    connection_status.short_description = "Status"
    connection_status.allow_tags = True

@admin.register(WearableMeasurement)
class WearableMeasurementAdmin(admin.ModelAdmin):
    list_display = ('user', 'measurement_type', 'value', 'unit', 'measured_at', 'integration_type')
    list_filter = ('measurement_type', 'integration_type', 'measured_at')
    search_fields = ('user__username', 'user__email', 'device_id')
    readonly_fields = ('created_at',)
    date_hierarchy = 'measured_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'measurement_type', 'value', 'unit', 'measured_at')
        }),
        ('Integration', {
            'fields': ('integration_type', 'external_measurement_id')
        }),
        ('Device Information', {
            'fields': ('device_id', 'device_model')
        }),
        ('Additional Data', {
            'fields': ('additional_data',)
        }),
        ('Blood Pressure', {
            'fields': ('systolic', 'diastolic'),
            'classes': ('collapse',),
        }),
        ('Healthcare Integration', {
            'fields': ('synced_to_healthcare', 'healthcare_record_id'),
            'classes': ('collapse',),
        }),
    )

@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'integration_type', 'status', 'start_time', 'end_time', 'duration_seconds', 'measurements_synced')
    list_filter = ('status', 'integration_type', 'start_time')
    search_fields = ('user__username', 'user__email', 'error_message')
    readonly_fields = ('duration_seconds',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'integration_type', 'status')
        }),
        ('Timing', {
            'fields': ('start_time', 'end_time', 'duration_seconds')
        }),
        ('Data Range', {
            'fields': ('data_start_date', 'data_end_date', 'measurements_synced')
        }),
        ('Results', {
            'fields': ('error_message', 'details')
        }),
    )
    
    def duration_seconds(self, obj):
        """Display the duration of the sync operation"""
        if obj.start_time and obj.end_time:
            return (obj.end_time - obj.start_time).total_seconds()
        return None
    duration_seconds.short_description = "Duration (seconds)"


# Also register the legacy Withings models
@admin.register(WithingsProfile)
class WithingsProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'connection_status', 'last_updated')
    search_fields = ('user__username', 'user__email', 'withings_user_id')
    readonly_fields = ('created_at', 'updated_at', 'token_expiry')
    list_filter = ('created_at', 'updated_at')
    inlines = [WearableMeasurementInline]

    def connection_status(self, obj):
        """Display connection status based on token validity"""
        if not obj.access_token:
            return "Not Connected"
        if obj.token_expiry and obj.token_expiry < timezone.now():
            return "Token Expired"
        return "Connected"
    connection_status.short_description = "Status"

    def last_updated(self, obj):
        return obj.updated_at
    last_updated.short_description = "Last Updated"

    def has_delete_permission(self, request, obj=None):
        """Prevent accidental deletion of profiles"""
        return False


@admin.register(WithingsMeasurement)
class WithingsMeasurementAdmin(admin.ModelAdmin):
    list_display = ('user', 'measurement_type', 'value', 'unit', 'measured_at')
    list_filter = ('measurement_type', 'measured_at')
    search_fields = ('user__username', 'withings_device_id')
    readonly_fields = ('created_at',)
    date_hierarchy = 'measured_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

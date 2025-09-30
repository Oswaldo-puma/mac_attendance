from django.contrib import admin
from .models import Event, ExternalUser

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'speaker', 'date', 'start_time', 'modality', 'location', 'is_active']
    list_filter = ['event_type', 'modality', 'date', 'is_active']
    search_fields = ['title', 'speaker', 'location']
    date_hierarchy = 'date'
    ordering = ['date', 'start_time']

@admin.register(ExternalUser)
class ExternalUserAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'institution', 'status', 'created_at']
    list_filter = ['status', 'institution', 'created_at']
    search_fields = ['full_name', 'email', 'institution']
    ordering = ['-created_at']
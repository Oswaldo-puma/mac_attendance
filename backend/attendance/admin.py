from django.contrib import admin
from .models import Attendance, AttendanceStats

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['attendee_name', 'attendee_identifier', 'event', 'timestamp', 'registration_method', 'registered_by']
    list_filter = ['registration_method', 'event__date', 'is_valid']
    search_fields = ['student__full_name', 'external_user__full_name', 'event__title']
    ordering = ['-timestamp']

@admin.register(AttendanceStats)
class AttendanceStatsAdmin(admin.ModelAdmin):
    list_display = ['student', 'attended_events', 'total_events', 'attendance_percentage']
    ordering = ['-attendance_percentage']
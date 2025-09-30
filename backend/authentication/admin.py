from django.contrib import admin
from .models import UserProfile, Teacher

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['account_number', 'full_name', 'user_type', 'career', 'semester']
    search_fields = ['account_number', 'full_name']
    list_filter = ['user_type']

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'minimum_attendance_percentage', 'can_manage_events']
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from authentication.models import UserProfile
from events.models import Event
from .models import Attendance, AttendanceStats

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def register_attendance(request):
    if request.method == 'GET':
        return Response({
            'message': 'API de registro de asistencia activa',
            'methods': ['POST'],
            'required_fields': ['event_id', 'account_number']
        })
    
    event_id = request.data.get('event_id')
    account_number = request.data.get('account_number')
    
    if not event_id or not account_number:
        return Response({
            'error': 'Se requiere event_id y account_number'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Buscar evento
    try:
        event = Event.objects.get(id=event_id, is_active=True)
    except Event.DoesNotExist:
        return Response({
            'error': 'Evento no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Buscar estudiante
    try:
        student_profile = UserProfile.objects.get(
            account_number=account_number,
            user_type='student'
        )
    except UserProfile.DoesNotExist:
        return Response({
            'error': f'Estudiante con número de cuenta {account_number} no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Buscar el maestro (quien registra) - usar el primer maestro disponible temporalmente
    try:
        teacher_profile = UserProfile.objects.filter(user_type='teacher').first()
        if not teacher_profile:
            return Response({
                'error': 'No hay maestros registrados en el sistema'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': 'Error al buscar maestro registrador'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Verificar si ya tiene asistencia
    if Attendance.objects.filter(student=student_profile, event=event, is_valid=True).exists():
        return Response({
            'error': 'El estudiante ya tiene asistencia registrada para este evento'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Crear asistencia
    try:
        attendance = Attendance.objects.create(
            student=student_profile,
            event=event,
            registered_by=teacher_profile,
            registration_method='manual'
        )
        
        return Response({
            'message': f'Asistencia registrada para {student_profile.full_name}',
            'attendance_id': attendance.id,
            'event': event.title,
            'registered_by': teacher_profile.full_name
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Error al crear asistencia: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_student_stats(request):
    account_number = request.GET.get('account_number')
    
    if not account_number:
        return Response({'error': 'Se requiere account_number'}, status=400)
    
    try:
        student_profile = UserProfile.objects.get(
            account_number=account_number,
            user_type='student'
        )
        stats, created = AttendanceStats.objects.get_or_create(
            student=student_profile
        )
        stats.update_stats()
        
        return Response({
            'total_events': stats.total_events,
            'attended_events': stats.attended_events,
            'attendance_percentage': stats.attendance_percentage
        })
    except UserProfile.DoesNotExist:
        return Response({'error': 'Estudiante no encontrado'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_recent_attendances(request):
    recent = Attendance.objects.select_related('student', 'event').order_by('-timestamp')[:5]
    
    data = []
    for attendance in recent:
        data.append({
            'attendee_name': attendance.attendee_name,
            'event_title': attendance.event.title,
            'timestamp': attendance.timestamp.strftime('%H:%M')
        })
    
    return Response(data)
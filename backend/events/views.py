from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Event, ExternalUser
from .serializers import EventSerializer, ExternalUserSerializer
import random
import string

class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Event.objects.filter(is_active=True).order_by('date', 'start_time')

@api_view(['POST'])
@permission_classes([AllowAny])
def register_external_user(request):
    """Registrar un usuario externo para asistir a ponencias"""
    data = request.data
    
    # Generar ID temporal único
    temp_id = 'EXT' + ''.join(random.choices(string.digits, k=7))
    
    # Verificar que no exista
    while ExternalUser.objects.filter(temporary_id=temp_id).exists():
        temp_id = 'EXT' + ''.join(random.choices(string.digits, k=7))
    
    try:
        external_user = ExternalUser.objects.create(
            full_name=data.get('full_name'),
            email=data.get('email'),
            phone=data.get('phone', ''),
            institution=data.get('institution'),
            position=data.get('position', ''),
            reason=data.get('reason'),
            temporary_id=temp_id,
            status='pending'
        )
        
        return Response({
            'message': 'Solicitud enviada exitosamente. Tu ID temporal es: ' + temp_id,
            'temporary_id': temp_id,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Error al registrar: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def approve_external_user(request, user_id):
    """Aprobar o rechazar un usuario externo"""
    try:
        external_user = ExternalUser.objects.get(id=user_id)
        action = request.data.get('action')  # 'approve' o 'reject'
        
        if action == 'approve':
            external_user.status = 'approved'
            external_user.processed_at = timezone.now()
            external_user.save()
            return Response({'message': 'Usuario aprobado'})
        elif action == 'reject':
            reason = request.data.get('reason', '')
            external_user.status = 'rejected'
            external_user.rejection_reason = reason
            external_user.processed_at = timezone.now()
            external_user.save()
            return Response({'message': 'Usuario rechazado'})
        else:
            return Response({'error': 'Acción inválida'}, status=400)
            
    except ExternalUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
import React, { useState, useEffect, createContext, useContext } from 'react'
import './App.css'

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api'

const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }
    
    const config = { ...defaultOptions, ...options }
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body)
    }
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw { response: { status: response.status, data: error } }
    }
    
    return response.json()
}

// Auth Context
const AuthContext = createContext()

const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Login Component
const Login = () => {
    const [credentials, setCredentials] = useState({
        account_number: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showExternalForm, setShowExternalForm] = useState(false)
    
    const { login } = useAuth()

    // Si muestra formulario externo, renderizar ese componente
    if (showExternalForm) {
        return <ExternalRegistration onBack={() => setShowExternalForm(false)} />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validar número de cuenta (7 dígitos)
        if (!/^\d{7}$/.test(credentials.account_number)) {
            setError('El número de cuenta debe tener exactamente 7 dígitos')
            setLoading(false)
            return
        }

        try {
            const response = await apiRequest('/auth/login/', {
                method: 'POST',
                body: credentials
            })
            login(response.user)
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        MAC FES Acatlán
                    </h1>
                    <h2 style={{ color: '#bfdbfe', fontSize: '1.2rem' }}>
                        Sistema de Asistencia a Ponencias
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Número de Cuenta
                        </label>
                        <input
                            type="text"
                            value={credentials.account_number}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                                setCredentials({
                                    ...credentials,
                                    account_number: value
                                })
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="1234567"
                            required
                            disabled={loading}
                            maxLength="7"
                        />
                        <small style={{ color: '#bfdbfe', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                            Ingresa tu número de cuenta de 7 dígitos
                        </small>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({
                                ...credentials,
                                password: e.target.value
                            })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="Ingresa tu contraseña"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgb(239, 68, 68)',
                            color: '#fecaca',
                            padding: '0.75rem',
                            borderRadius: '0.5rem'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                            color: 'white',
                            fontWeight: '600',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            fontSize: '1rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar al Sistema MAC'}
                    </button>
                </form>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Estudiantes: Consulta tus asistencias<br/>
                        Maestros: Administra y registra asistencias
                    </p>
                    <button
                        onClick={() => setShowExternalForm(true)}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        ¿Eres externo? Regístrate aquí
                    </button>
                </div>
            </div>
        </div>
    )
}

// Panel de Administración para Maestros
const AdminPanel = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await apiRequest('/events/')
            setEvents(response.results || response)
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando eventos...</div>

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e3a8a' }}>
                Panel de Administración
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ color: '#374151' }}>Estadísticas</h3>
                    <p style={{ color: '#1e3a8a' }}>Total eventos: {events.length}</p>
                    <p style={{ color: '#1e3a8a' }}>Eventos activos: {events.filter(e => e.is_active).length}</p>
                </div>
                <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ color: '#374151' }}>Acciones rápidas</h3>
                    <button style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                        Importar datos
                    </button>
                    <button style={{ display: 'block', padding: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                        Exportar reportes
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', margin: 0 }}>Eventos registrados</h3>
                {events.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Título</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Ponente</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Fecha</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Modalidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#1e3a8a' }}>{event.title}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>{event.speaker}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{event.date}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: event.modality === 'presencial' ? '#dcfdf7' : '#dbeafe', color: event.modality === 'presencial' ? '#065f46' : '#1e40af' }}>
                                            {event.modality}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay eventos registrados</p>
                )}
            </div>
        </div>
    )
}

// Panel de Registro de Asistencia para Maestros
const AttendancePanel = () => {
    const [selectedEvent, setSelectedEvent] = useState('')
    const [studentAccount, setStudentAccount] = useState('')
    const [events, setEvents] = useState([])
    const [recentAttendances, setRecentAttendances] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    useEffect(() => {
        fetchEvents()
        fetchRecentAttendances()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await apiRequest('/events/')
            setEvents(response.results || response)
        } catch (error) {
            console.error('Error fetching events:', error)
        }
    }

    const fetchRecentAttendances = async () => {
        try {
            const response = await apiRequest('/attendance/recent/')
            setRecentAttendances(response)
        } catch (error) {
            console.error('Error fetching recent attendances:', error)
        }
    }

    const registerAttendance = async () => {
        if (!selectedEvent || !studentAccount) {
            setMessage('Selecciona un evento e ingresa el número de cuenta')
            setMessageType('error')
            return
        }

        try {
            const response = await apiRequest('/attendance/', {
                method: 'POST',
                body: {
                    event_id: selectedEvent,
                    account_number: studentAccount,
                    registration_method: 'manual'
                }
            })
            
            setMessage(response.message)
            setMessageType('success')
            setStudentAccount('')
            
            // Recargar registros recientes desde la base de datos
            fetchRecentAttendances()
            
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error de conexión'
            setMessage(`Error: ${errorMessage}`)
            setMessageType('error')
        }
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e3a8a' }}>
                Registro de Asistencia
            </h2>

            {/* Mostrar mensaje */}
            {message && (
                <div style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    borderRadius: '0.5rem',
                    backgroundColor: messageType === 'success' ? '#dcfdf7' : '#fef2f2',
                    color: messageType === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${messageType === 'success' ? '#10b981' : '#ef4444'}`,
                    position: 'relative'
                }}>
                    {message}
                    <button 
                        onClick={() => setMessage('')}
                        style={{ 
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Registrar Asistencia Manual</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e3a8a' }}>
                            Seleccionar Evento
                        </label>
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        >
                            <option value="">Selecciona un evento...</option>
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title} - {event.date}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e3a8a' }}>
                            Número de Cuenta (7 dígitos)
                        </label>
                        <input
                            type="text"
                            value={studentAccount}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                                setStudentAccount(value)
                            }}
                            placeholder="1234567"
                            maxLength="7"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                    </div>
                    
                    <button
                        onClick={registerAttendance}
                        style={{ width: '100%', backgroundColor: '#059669', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Registrar Asistencia
                    </button>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Asistencias Recientes</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {recentAttendances.length > 0 ? (
                            recentAttendances.map((attendance, index) => (
                                <div key={index} style={{ padding: '0.5rem', borderBottom: '1px solid #535252ff', fontSize: '0.875rem', color: '#1e3a8a' }}>
                                    {attendance.attendee_name} - {attendance.event_title}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay registros recientes</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Panel de Consulta para Estudiantes
const StudentPanel = () => {
    const { user } = useAuth()
    const [attendanceStats, setAttendanceStats] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStudentData()
    }, [])

    const fetchStudentData = async () => {
    try {
        const [eventsRes, statsRes] = await Promise.all([
            apiRequest('/events/'),
            apiRequest(`/attendance/stats/?account_number=${user.profile?.account_number}`)
        ])
        
        setEvents(eventsRes.results || eventsRes)
        setAttendanceStats(statsRes)
    } catch (error) {
        console.error('Error fetching student data:', error)
    } finally {
        setLoading(false)
    }
}

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando información...</div>
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e3a8a' }}>
                Registro de Asistencia
            </h2>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Estadísticas de Asistencia</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                            {attendanceStats?.attended_events || 0}
                        </div>
                        <div style={{ color: '#1e40af', fontSize: '0.875rem' }}>Eventos Asistidos</div>
                    </div>
                    <div style={{ backgroundColor: '#dcfdf7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>
                            {attendanceStats?.total_events || 0}
                        </div>
                        <div style={{ color: '#065f46', fontSize: '0.875rem' }}>Total de Eventos</div>
                    </div>
                    <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                            {attendanceStats?.attendance_percentage?.toFixed(1) || 0}%
                        </div>
                        <div style={{ color: '#92400e', fontSize: '0.875rem' }}>Porcentaje</div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                {events.length > 0 ? (
                    <div>
                        {events.map((event) => (
                            <div key={event.id} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e3a8a' }}>
                                            {event.title}
                                        </h4>
                                        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{event.description}</p>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                            <span>📅 {event.date}</span>
                                            <span>🕒 {event.start_time} - {event.end_time}</span>
                                            <span>📍 {event.location}</span>
                                            <span>👨‍🏫 {event.speaker}</span>
                                        </div>
                                    </div>
                                    <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: event.modality === 'presencial' ? '#dcfdf7' : '#dbeafe', color: event.modality === 'presencial' ? '#065f46' : '#1e40af' }}>
                                        {event.modality}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay eventos disponibles</p>
                )}
            </div>
        </div>
    )
}

// Panel de Gestión de Usuarios Externos para Maestros
const ExternalUsersPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([])
    const [approvedUsers, setApprovedUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')

    useEffect(() => {
        fetchExternalUsers()
    }, [])

    const fetchExternalUsers = async () => {
        try {
            // Por ahora vamos a obtener todos y filtrar en el frontend
            // Más adelante puedes crear endpoints específicos
            const response = await apiRequest('/events/external/list/')
            const users = response || []
            
            setPendingUsers(users.filter(u => u.status === 'pending'))
            setApprovedUsers(users.filter(u => u.status === 'approved'))
        } catch (error) {
            console.error('Error fetching external users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (userId) => {
        try {
            await apiRequest(`/events/external/${userId}/approve/`, {
                method: 'POST',
                body: { action: 'approve' }
            })
            alert('Usuario aprobado exitosamente')
            fetchExternalUsers()
        } catch (error) {
            alert('Error al aprobar usuario')
        }
    }

    const handleReject = async (userId) => {
        const reason = prompt('Motivo del rechazo (opcional):')
        try {
            await apiRequest(`/events/external/${userId}/approve/`, {
                method: 'POST',
                body: { action: 'reject', reason: reason || '' }
            })
            alert('Usuario rechazado')
            fetchExternalUsers()
        } catch (error) {
            alert('Error al rechazar usuario')
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Gestión de Usuarios Externos
            </h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        backgroundColor: activeTab === 'pending' ? '#2563eb' : '#e5e7eb',
                        color: activeTab === 'pending' ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Pendientes ({pendingUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        backgroundColor: activeTab === 'approved' ? '#2563eb' : '#e5e7eb',
                        color: activeTab === 'approved' ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Aprobados ({approvedUsers.length})
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                {activeTab === 'pending' && (
                    pendingUsers.length > 0 ? (
                        pendingUsers.map((user) => (
                            <div key={user.id} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{user.full_name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            <strong>Email:</strong> {user.email}
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            <strong>Institución:</strong> {user.institution}
                                        </p>
                                        {user.position && (
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                                <strong>Cargo:</strong> {user.position}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                            <strong>Motivo:</strong> {user.reason}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                            ID Temporal: {user.temporary_id}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#059669',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.375rem',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.375rem',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                            No hay solicitudes pendientes
                        </p>
                    )
                )}

                {activeTab === 'approved' && (
                    approvedUsers.length > 0 ? (
                        approvedUsers.map((user) => (
                            <div key={user.id} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{user.full_name}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    <strong>Email:</strong> {user.email}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    <strong>Institución:</strong> {user.institution}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem', fontWeight: '600' }}>
                                    ID: {user.temporary_id}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                            No hay usuarios aprobados
                        </p>
                    )
                )}
            </div>
        </div>
    )
}

// Componente de Registro para Externos
const ExternalRegistration = ({ onBack }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        institution: '',
        position: '',
        reason: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [temporaryId, setTemporaryId] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await apiRequest('/events/external/register/', {
                method: 'POST',
                body: formData
            })
            
            setMessage(response.message)
            setTemporaryId(response.temporary_id)
            setMessageType('success')
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                institution: '',
                position: '',
                reason: ''
            })
        } catch (error) {
            setMessage('Error al enviar solicitud: ' + (error.response?.data?.error || 'Error desconocido'))
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button
                    onClick={onBack}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    ← Volver al Login
                </button>

                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                        Registro de Usuario Externo
                    </h1>
                    <p style={{ color: '#bfdbfe', textAlign: 'center', marginBottom: '2rem' }}>
                        Solicita acceso para asistir a las ponencias de MAC
                    </p>

                    {message && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: messageType === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: 'white',
                            border: `1px solid ${messageType === 'success' ? '#22c55e' : '#ef4444'}`
                        }}>
                            {message}
                            {temporaryId && (
                                <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    Guarda este ID: {temporaryId}
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Institución de Procedencia *
                            </label>
                            <input
                                type="text"
                                name="institution"
                                value={formData.institution}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Cargo/Posición
                            </label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Motivo de Asistencia *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                                color: 'white',
                                fontWeight: '600',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Dashboard Principal con Paneles Diferenciados
const Dashboard = () => {
    const { user, logout } = useAuth()
    const [activePanel, setActivePanel] = useState('admin')
    
    const isTeacher = user.profile?.user_type === 'teacher'

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <nav style={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '4rem'
                }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                        Sistema MAC - {isTeacher ? 'Maestro' : 'Estudiante'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#374151' }}>Hola, {user.profile?.full_name || user.first_name}</span>
                        <button
                            onClick={logout}
                            style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            {isTeacher ? (
                <div style={{ display: 'flex' }}>
                    <div style={{ width: '250px', backgroundColor: 'white', minHeight: 'calc(100vh - 4rem)', boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <nav style={{ padding: '1rem 0' }}>
                            <button
                                onClick={() => setActivePanel('admin')}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    backgroundColor: activePanel === 'admin' ? '#dbeafe' : 'transparent',
                                    color: activePanel === 'admin' ? '#1e40af' : '#6b7280',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                📊 Administración
                            </button>
                            <button
                                onClick={() => setActivePanel('attendance')}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    backgroundColor: activePanel === 'attendance' ? '#dbeafe' : 'transparent',
                                    color: activePanel === 'attendance' ? '#1e40af' : '#6b7280',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                📝 Registro de Asistencia
                            </button>
                        </nav>
                    </div>
                    
                    <div style={{ flex: 1, padding: '2rem' }}>
                        {activePanel === 'admin' && <AdminPanel />}
                        {activePanel === 'attendance' && <AttendancePanel />}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <StudentPanel />
                </div>
            )}
        </div>
    )
}

// Auth Provider
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(false)
    }, [])

    const login = (userData) => {
        setUser(userData)
    }

    const logout = () => {
        setUser(null)
    }

    const value = {
        user,
        login,
        logout,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Main App
const MacAttendanceApp = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e3a8a'
            }}>
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Cargando sistema...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Login />
    }

    return <Dashboard />
}

// Main App Export
function App() {
    return (
        <AuthProvider>
            <MacAttendanceApp />
        </AuthProvider>
    )
}

export default App
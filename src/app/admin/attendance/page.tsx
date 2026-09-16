'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Award,
  Users,
  Check,
  UserX,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  date: string;
  classSession: string;
  status: 'present' | 'absent' | 'justified';
  markedAt?: string;
}

export default function AdminAttendancePage() {
  const { user } = useAuth();

  // Estados de Asistencia
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedSession, setSelectedSession] = useState<string>('general');
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, 'present' | 'absent' | 'justified'>
  >({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceBeltFilter, setAttendanceBeltFilter] =
    useState<string>('all');
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Cargar usuarios
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error de red al cargar usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Cargar registros de asistencia
  const fetchAttendance = useCallback(
    async (date: string, classSession: string) => {
      setLoadingAttendance(true);
      try {
        const res = await fetch(
          `/api/admin/attendance?date=${encodeURIComponent(
            date
          )}&classSession=${encodeURIComponent(classSession)}`
        );
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, 'present' | 'absent' | 'justified'> = {};
          (data.records || []).forEach((r: AttendanceRecord) => {
            map[r.userEmail.toLowerCase()] = r.status;
          });
          setAttendanceRecords(map);
        }
      } catch (err) {
        console.error('Error cargando asistencia:', err);
      } finally {
        setLoadingAttendance(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user && user.role === 'administrator') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    if (user && user.role === 'administrator') {
      fetchAttendance(selectedDate, selectedSession);
    }
  }, [user, selectedDate, selectedSession, fetchAttendance]);

  // Marcar asistencia de un estudiante
  const handleMarkAttendance = async (
    student: User,
    status: 'present' | 'absent' | 'justified'
  ) => {
    const emailKey = student.email.toLowerCase();
    // Actualización optimista en UI
    setAttendanceRecords((prev) => ({ ...prev, [emailKey]: status }));

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: student.id,
          userEmail: student.email,
          userName: student.name,
          date: selectedDate,
          classSession: selectedSession,
          status,
        }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        console.error('Error al guardar asistencia');
      }
    } catch (err) {
      console.error('Error de red al marcar asistencia:', err);
    }
  };

  // Marcar todos presentes
  const handleMarkAllPresent = async () => {
    const activeStudents = users.filter((u) => u.status === 'active');
    for (const student of activeStudents) {
      await handleMarkAttendance(student, 'present');
    }
    setActionMessage({
      type: 'success',
      text: 'Todos los alumnos marcados como Presentes',
    });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Cambiar fecha
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filtrado de alumnos para asistencia
  const attendanceStudents = users.filter((u) => {
    const isStudentOrActive = u.status === 'active';
    const matchesBelt =
      attendanceBeltFilter === 'all' || u.belt === attendanceBeltFilter;
    return isStudentOrActive && matchesBelt;
  });

  // Conteo de asistencia del día
  const presentCountToday = Object.values(attendanceRecords).filter(
    (s) => s === 'present'
  ).length;
  const absentCountToday = Object.values(attendanceRecords).filter(
    (s) => s === 'absent'
  ).length;
  const justifiedCountToday = Object.values(attendanceRecords).filter(
    (s) => s === 'justified'
  ).length;

  return (
    <div>
      {/* Toast Notificación */}
      {actionMessage && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            right: '20px',
            zIndex: 100,
            padding: '1rem 1.4rem',
            borderRadius: '8px',
            backgroundColor:
              actionMessage.type === 'success' ? '#143823' : '#3F1212',
            border: `1px solid ${
              actionMessage.type === 'success' ? '#22C55E' : '#EF4444'
            }`,
            color: '#F7F8FA',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle size={18} color="#22C55E" />
          ) : (
            <XCircle size={18} color="#EF4444" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Encabezado Superior de Asistencia */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '0.4rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '20px',
                color: '#F5D77F',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <CalendarCheck size={14} /> Control de Asistencia
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8' }}>
              Colección: <strong>Attendance</strong>
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#F7F8FA',
              lineHeight: 1.15,
            }}
          >
            Registro de Asistencia de Alumnos
          </h1>
          <p
            style={{
              color: '#9FA6B8',
              fontSize: '0.92rem',
              marginTop: '0.35rem',
            }}
          >
            Marca la presencia diaria de los estudiantes para actualizar
            automáticamente sus horas y récord de clases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => {
              fetchUsers();
              fetchAttendance(selectedDate, selectedSession);
            }}
            disabled={loadingAttendance}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw
              size={15}
              className={loadingAttendance ? 'spin-animation' : ''}
            />
            Actualizar
          </button>

          <button
            onClick={handleMarkAllPresent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '6px',
              color: '#4ADE80',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Check size={16} /> Marcar Todos Presentes
          </button>
        </div>
      </div>

      {/* Selector de Fecha y Clase */}
      <div
        className="card-sumi"
        style={{
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        {/* Controles de Fecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{ fontSize: '0.85rem', color: '#9FA6B8', fontWeight: 600 }}
          >
            Fecha:
          </span>
          <button
            onClick={() => changeDateByDays(-1)}
            style={{
              padding: '0.45rem',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: '#F7F8FA',
              cursor: 'pointer',
            }}
            title="Día anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          />

          <button
            onClick={() => changeDateByDays(1)}
            style={{
              padding: '0.45rem',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: '#F7F8FA',
              cursor: 'pointer',
            }}
            title="Día siguiente"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() =>
              setSelectedDate(new Date().toISOString().split('T')[0])
            }
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor:
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'rgba(212, 175, 55, 0.25)'
                  : '#0E0F14',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: '#F7F8FA',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hoy
          </button>
        </div>

        {/* Sesión de Clase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{ fontSize: '0.85rem', color: '#9FA6B8', fontWeight: 600 }}
          >
            Sesión / Horario:
          </span>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="general">Clase General (Todos)</option>
            <option value="infantil_4pm">
              Karate Infantil (4:00 PM - 5:00 PM)
            </option>
            <option value="principiantes_5pm">
              Principiantes & Intermedios (5:30 PM - 6:45 PM)
            </option>
            <option value="avanzados_7pm">
              Avanzados / Cintas Negras (7:00 PM - 8:30 PM)
            </option>
            <option value="kumite_sabado">
              Kumite Deportivo / Kata (Sábado)
            </option>
          </select>
        </div>

        {/* Filtro por cinturón */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#9FA6B8" />
          <select
            value={attendanceBeltFilter}
            onChange={(e) => setAttendanceBeltFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos los cinturones</option>
            <option value="Cinturón Blanco">Cinturón Blanco</option>
            <option value="Cinturón Amarillo">Cinturón Amarillo</option>
            <option value="Cinturón Naranja">Cinturón Naranja</option>
            <option value="Cinturón Verde">Cinturón Verde</option>
            <option value="Cinturón Azul">Cinturón Azul</option>
            <option value="Cinturón Marrón">Cinturón Marrón</option>
            <option value="Cinturón Negro">Cinturón Negro</option>
          </select>
        </div>
      </div>

      {/* KPIs de Asistencia del Día */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div
          className="card-sumi"
          style={{
            padding: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={22} color="#4ADE80" />
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#4ADE80',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Presentes
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#F7F8FA',
              }}
            >
              {presentCountToday}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserX size={22} color="#F87171" />
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#F87171',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Ausentes
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#F7F8FA',
              }}
            >
              {absentCountToday}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} color="#FACC15" />
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#FACC15',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Justificados
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#F7F8FA',
              }}
            >
              {justifiedCountToday}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} color="#F5D77F" />
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9FA6B8',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Alumnos en Lista
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#F7F8FA',
              }}
            >
              {attendanceStudents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Asistencia de Estudiantes */}
      <div className="card-sumi" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.88rem',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#141722',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    color: '#9FA6B8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Estudiante
                </th>
                <th
                  style={{
                    padding: '0.9rem 1rem',
                    color: '#9FA6B8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Grado / Cinturón
                </th>
                <th
                  style={{
                    padding: '0.9rem 1rem',
                    color: '#9FA6B8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Clases Totales
                </th>
                <th
                  style={{
                    padding: '0.9rem 1.25rem',
                    color: '#9FA6B8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  Estado de Asistencia
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '3rem 1rem',
                      textAlign: 'center',
                      color: '#9FA6B8',
                    }}
                  >
                    No hay alumnos activos registrados en el dojo para esta
                    selección.
                  </td>
                </tr>
              ) : (
                attendanceStudents.map((student) => {
                  const emailKey = student.email.toLowerCase();
                  const currentStatus = attendanceRecords[emailKey];

                  return (
                    <tr
                      key={student.id || student.email}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor:
                          currentStatus === 'present'
                            ? 'rgba(34, 197, 94, 0.03)'
                            : currentStatus === 'absent'
                            ? 'rgba(239, 68, 68, 0.03)'
                            : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: '#23346B',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {student.avatar ? (
                              <Image
                                src={student.avatar}
                                alt={student.name}
                                width={36}
                                height={36}
                                unoptimized
                                referrerPolicy="no-referrer"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              student.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                color: '#F7F8FA',
                                margin: 0,
                              }}
                            >
                              {student.name}
                            </p>
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: '#9FA6B8',
                                margin: 0,
                              }}
                            >
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#F7F8FA',
                            display: 'block',
                          }}
                        >
                          {student.belt}
                        </span>
                        <span
                          style={{ fontSize: '0.72rem', color: '#9FA6B8' }}
                        >
                          {student.kyuDan}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#F5D77F',
                          }}
                        >
                          <Award size={14} color="#ECC94B" />
                          {student.classesAttended} clases
                        </span>
                      </td>

                      <td
                        style={{
                          padding: '0.85rem 1.25rem',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          {/* Presente */}
                          <button
                            onClick={() =>
                              handleMarkAttendance(student, 'present')
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor:
                                currentStatus === 'present'
                                  ? '#22C55E'
                                  : 'rgba(255, 255, 255, 0.12)',
                              backgroundColor:
                                currentStatus === 'present'
                                  ? '#15803D'
                                  : '#141722',
                              color:
                                currentStatus === 'present'
                                  ? '#FFF'
                                  : '#9FA6B8',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Check size={14} /> Presente
                          </button>

                          {/* Ausente */}
                          <button
                            onClick={() =>
                              handleMarkAttendance(student, 'absent')
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor:
                                currentStatus === 'absent'
                                  ? '#EF4444'
                                  : 'rgba(255, 255, 255, 0.12)',
                              backgroundColor:
                                currentStatus === 'absent'
                                  ? '#991B1B'
                                  : '#141722',
                              color:
                                currentStatus === 'absent' ? '#FFF' : '#9FA6B8',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <UserX size={14} /> Ausente
                          </button>

                          {/* Justificado */}
                          <button
                            onClick={() =>
                              handleMarkAttendance(student, 'justified')
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor:
                                currentStatus === 'justified'
                                  ? '#EAB308'
                                  : 'rgba(255, 255, 255, 0.12)',
                              backgroundColor:
                                currentStatus === 'justified'
                                  ? '#854D0E'
                                  : '#141722',
                              color:
                                currentStatus === 'justified'
                                  ? '#FFF'
                                  : '#9FA6B8',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <FileText size={14} /> Justificado
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

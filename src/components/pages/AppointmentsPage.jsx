import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { AppointmentFormModal } from '../appointments/AppointmentFormModal'
import { AppointmentDetailsModal } from '../appointments/AppointmentDetailsModal'
import { AssignLawyerModal } from '../appointments/AssignLawyerModal'
import { ConfirmAppointmentModal } from '../appointments/ConfirmAppointmentModal'
import { RescheduleAppointmentModal } from '../appointments/RescheduleAppointmentModal'
import { useAuth } from '../../context/AuthContext'
import { isSamePerson } from '../../data/roles'
import { getLawyerAppointments } from '../../data/lawyerDashboard'
import { getClientAppointments, getClientCases } from '../../data/clientDashboard'
import {
  appointmentCases,
  appointmentClients,
  appointmentLawyers,
  appointmentStatusOptions,
  appointmentTypeOptions,
  createAppointment,
  formatAppointmentDate,
  initialAppointments,
} from '../../data/appointments'

export default function AppointmentsPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const isClient = user?.roleId === 'client'
  const isAdmin = !isLawyer && !isClient
  const [appointments, setAppointments] = useState(initialAppointments)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [lawyerId, setLawyerId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [assignId, setAssignId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [rescheduleId, setRescheduleId] = useState(null)

  const clientRecord = useMemo(
    () =>
      appointmentClients.find((item) => isSamePerson(item.name, user?.name)) ||
      null,
    [user?.name],
  )

  const clientCaseOptions = useMemo(() => {
    if (!isClient) return appointmentCases
    return getClientCases(user?.name).map(({ id, title, number }) => ({
      id,
      title,
      number,
    }))
  }, [isClient, user?.name])

  const scoped = useMemo(() => {
    if (isLawyer) return getLawyerAppointments(user?.name, appointments)
    if (isClient) return getClientAppointments(user?.name, appointments)
    return appointments
  }, [appointments, isLawyer, isClient, user?.name])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return scoped.filter((item) => {
      if (type && item.type !== type) return false
      if (status && item.status !== status) return false
      if (isAdmin) {
        if (lawyerId === 'none' && item.lawyerId) return false
        if (lawyerId && lawyerId !== 'none' && item.lawyerId !== lawyerId) {
          return false
        }
      }
      if (dateFrom && item.date < dateFrom) return false
      if (dateTo && item.date > dateTo) return false
      if (!normalized) return true
      return [
        item.clientName,
        item.clientPhone,
        item.lawyerName,
        item.caseTitle,
        item.notes,
        item.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    })
  }, [scoped, query, type, status, lawyerId, dateFrom, dateTo, isAdmin])

  const editingAppointment =
    appointments.find((item) => item.id === editingId) || null
  const detailsAppointment =
    appointments.find((item) => item.id === detailsId) || null
  const assignAppointment =
    appointments.find((item) => item.id === assignId) || null
  const confirmAppointment =
    appointments.find((item) => item.id === confirmId) || null
  const rescheduleAppointment =
    appointments.find((item) => item.id === rescheduleId) || null

  const openNew = () => {
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (id) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleSave = (form) => {
    const selfLawyer = appointmentLawyers.find((item) =>
      isSamePerson(item.name, user?.name),
    )
    let formWithDefaults = form
    if (isLawyer && selfLawyer) {
      formWithDefaults = { ...form, lawyerId: selfLawyer.id }
    }
    if (isClient && clientRecord) {
      formWithDefaults = { ...formWithDefaults, clientId: clientRecord.id }
    }
    const next = createAppointment(formWithDefaults)
    if (!editingId) {
      setAppointments((current) => [next, ...current])
      return
    }
    setAppointments((current) =>
      current.map((item) =>
        item.id === editingId
          ? { ...next, id: item.id, status: item.status }
          : item,
      ),
    )
  }

  const handleAssign = (id, selectedLawyerId) => {
    const lawyer = appointmentLawyers.find((item) => item.id === selectedLawyerId)
    setAppointments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              lawyerId: lawyer?.id || '',
              lawyerName: lawyer?.name || '',
            }
          : item,
      ),
    )
  }

  const handleReschedule = (id, { date, time, reason }) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              date,
              time,
              status: 'قيد الانتظار',
              notes: reason
                ? `طلب تغيير: ${reason}${item.notes ? ` | ${item.notes}` : ''}`
                : item.notes,
            }
          : item,
      ),
    )
  }

  const clearFilters = () => {
    setQuery('')
    setType('')
    setStatus('')
    setLawyerId('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="appointments-page">
      <div className="cases-toolbar appointments-titlebar">
        <h2 className="cases-toolbar__title">المواعيد</h2>
        <button type="button" className="btn btn--primary" onClick={openNew}>
          <Icon name="plus" size={18} />
          حجز موعد
        </button>
      </div>

      <section className="appointments-filters">
        <div className="appointments-filters__grid">
          <label>
            <span>من تاريخ</span>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
          <label>
            <span>إلى تاريخ</span>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>
          <label>
            <span>النوع</span>
            <select className="input" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">كل الأنواع</option>
              {appointmentTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span>الحالة</span>
            <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">كل الحالات</option>
              {appointmentStatusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          {isAdmin && (
            <label>
              <span>المحامي</span>
              <select
                className="input"
                value={lawyerId}
                onChange={(event) => setLawyerId(event.target.value)}
              >
                <option value="">كل المحامين</option>
                <option value="none">بدون محامي</option>
                {appointmentLawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
                ))}
              </select>
            </label>
          )}
          <label className="appointments-filters__search">
            <span>بحث</span>
            <div className="search-field">
              <Icon name="search" className="search-field__icon" />
              <input
                className="search-field__input"
                type="search"
                placeholder={
                  isClient
                    ? 'بحث في المواعيد...'
                    : 'اسم الموكل، الهاتف، القضية...'
                }
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>
        </div>
        <button type="button" className="btn btn--ghost" onClick={clearFilters}>
          مسح الفلاتر
        </button>
      </section>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table appointments-table">
            <thead>
              <tr>
                <th>النوع</th>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>{isClient ? 'المحامي' : 'الموكل'}</th>
                <th>الملاحظات</th>
                <th>القضية</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__empty">
                    لا توجد مواعيد مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="appointment-type">
                        <Icon name="calendar" size={15} />
                        {item.type}
                      </span>
                    </td>
                    <td>{formatAppointmentDate(item.date)}</td>
                    <td>
                      <span className="appointment-time">
                        <Icon name="clock" size={14} />
                        {item.time}
                      </span>
                    </td>
                    <td>
                      <div className="appointment-client">
                        <strong>
                          {isClient
                            ? item.lawyerName || 'بانتظار التعيين'
                            : item.clientName}
                        </strong>
                        {!isClient ? (
                          <small>{item.clientPhone || '—'}</small>
                        ) : null}
                      </div>
                    </td>
                    <td>{item.notes || 'لا توجد ملاحظات'}</td>
                    <td>{item.caseTitle || 'بدون قضية'}</td>
                    <td>
                      <span className={`appointment-status appointment-status--${statusKey(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {!isClient && (
                          <button
                            type="button"
                            className="action-btn action-btn--confirm"
                            title="تأكيد الموعد"
                            aria-label={`تأكيد موعد ${item.clientName}`}
                            onClick={() => setConfirmId(item.id)}
                          >
                            <Icon name="check" size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="عرض التفاصيل"
                          onClick={() => setDetailsId(item.id)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        {isClient ? (
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            title="طلب تغيير موعد"
                            onClick={() => setRescheduleId(item.id)}
                          >
                            <Icon name="refresh" size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            title="تعديل الموعد"
                            onClick={() => openEdit(item.id)}
                          >
                            <Icon name="edit" size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="action-btn action-btn--assign"
                            title="تعيين محامي"
                            onClick={() => setAssignId(item.id)}
                          >
                            <Icon name="lawyers" size={16} />
                          </button>
                        )}
                        {!isClient && (
                          <button
                            type="button"
                            className="action-btn action-btn--delete"
                            title="حذف الموعد"
                            onClick={() =>
                              setAppointments((current) =>
                                current.filter(
                                  (appointment) => appointment.id !== item.id,
                                ),
                              )
                            }
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentFormModal
        open={formOpen}
        appointment={editingAppointment}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
        mode={isClient ? 'client' : 'admin'}
        lockedClientId={clientRecord?.id || ''}
        caseOptions={clientCaseOptions}
      />
      <AppointmentDetailsModal
        open={Boolean(detailsAppointment)}
        appointment={detailsAppointment}
        onClose={() => setDetailsId(null)}
      />
      <AssignLawyerModal
        open={Boolean(assignAppointment)}
        appointment={assignAppointment}
        onClose={() => setAssignId(null)}
        onAssign={handleAssign}
      />
      <ConfirmAppointmentModal
        open={Boolean(confirmAppointment)}
        appointment={confirmAppointment}
        onClose={() => setConfirmId(null)}
        onConfirm={(id) =>
          setAppointments((current) =>
            current.map((item) =>
              item.id === id ? { ...item, status: 'مؤكد' } : item,
            ),
          )
        }
      />
      <RescheduleAppointmentModal
        open={Boolean(rescheduleAppointment)}
        appointment={rescheduleAppointment}
        onClose={() => setRescheduleId(null)}
        onSubmit={handleReschedule}
      />
    </div>
  )
}

function statusKey(status) {
  if (status === 'مؤكد') return 'confirmed'
  if (status === 'ملغي') return 'cancelled'
  if (status === 'قيد الانتظار') return 'waiting'
  return 'pending'
}

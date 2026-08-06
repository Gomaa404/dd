import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import {
  appointmentCases,
  appointmentClients,
  appointmentLawyers,
  appointmentTypeOptions,
  emptyAppointmentForm,
} from '../../data/appointments'

export function AppointmentFormModal({
  open,
  appointment,
  onClose,
  onSave,
  mode = 'admin',
  lockedClientId = '',
  caseOptions,
}) {
  const [form, setForm] = useState(emptyAppointmentForm)
  const isClient = mode === 'client'
  const casesList = caseOptions || appointmentCases

  useEffect(() => {
    if (!open) return
    if (appointment) {
      setForm({
        date: appointment.date,
        time: appointment.time,
        lawyerId: appointment.lawyerId,
        clientId: appointment.clientId,
        caseId: appointment.caseId,
        type: appointment.type,
        notes: appointment.notes === 'لا توجد ملاحظات' ? '' : appointment.notes,
      })
      return
    }
    setForm({
      ...emptyAppointmentForm,
      clientId: isClient ? lockedClientId : '',
    })
  }, [open, appointment, isClient, lockedClientId])

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const clientId = isClient ? lockedClientId || form.clientId : form.clientId
    if (!form.date || !form.time || !clientId) return
    onSave({ ...form, clientId })
    onClose()
  }

  return (
    <Modal
      open={open}
      title={appointment ? 'تعديل الموعد' : 'حجز موعد جديد'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="submit" form="appointment-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="appointment-form" className="appointment-form" onSubmit={handleSubmit}>
        <FieldGrid cols={2}>
          <Field label="التاريخ" required>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={set('date')}
              required
            />
          </Field>
          <Field label="الوقت" required>
            <input
              type="time"
              className="input"
              value={form.time}
              onChange={set('time')}
              required
            />
          </Field>
        </FieldGrid>

        <Field
          label={isClient ? 'المحامي (اختياري)' : 'المحامي'}
          full
          hint={
            isClient
              ? 'يمكنك ترك هذا الحقل فارغاً وسيتم تعيين محامي من قبل الإدارة'
              : undefined
          }
        >
          <select className="input" value={form.lawyerId} onChange={set('lawyerId')}>
            <option value="">
              {isClient ? '-- سيتم التعيين لاحقاً --' : '-- اختر محامي --'}
            </option>
            {appointmentLawyers.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </option>
            ))}
          </select>
        </Field>

        {!isClient ? (
          <Field label="الموكل" required full>
            <select
              className="input"
              value={form.clientId}
              onChange={set('clientId')}
              required
            >
              <option value="">-- اختر الموكل --</option>
              {appointmentClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field label="القضية المرتبطة (اختياري)" full>
          <select className="input" value={form.caseId} onChange={set('caseId')}>
            <option value="">-- بدون قضية (اختياري) --</option>
            {casesList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} (#{item.number})
              </option>
            ))}
          </select>
        </Field>

        <Field label="نوع الموعد" full>
          <select className="input" value={form.type} onChange={set('type')}>
            {appointmentTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="ملاحظات" full>
          <textarea
            className="input input--area"
            rows={4}
            value={form.notes}
            onChange={set('notes')}
            placeholder="اكتب أي ملاحظات عن الموعد..."
          />
        </Field>

        {isClient ? (
          <div className="info-banner appointment-info-banner">
            <Icon name="info" size={18} />
            <p>
              يمكنك حجز موعد بدون تحديد محامي وسيتم تعيين محامي مناسب من قبل الإدارة
            </p>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}

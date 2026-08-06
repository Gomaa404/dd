import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import { formatAppointmentDate } from '../../data/appointments'

const emptyForm = {
  date: '',
  time: '',
  reason: '',
}

export function RescheduleAppointmentModal({
  open,
  appointment,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
  }, [open, appointment])

  if (!appointment) return null

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.date || !form.time) return
    onSubmit(appointment.id, {
      date: form.date,
      time: form.time,
      reason: form.reason.trim(),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="طلب تغيير موعد"
      onClose={onClose}
      footer={
        <>
          <button type="submit" form="reschedule-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="reschedule-form" className="appointment-form" onSubmit={handleSubmit}>
        <section className="appointment-details__section">
          <h3>
            <Icon name="calendar" size={18} />
            الموعد الحالي
          </h3>
          <div className="appointment-details__grid">
            <div>
              <span>التاريخ:</span>
              <strong>{formatAppointmentDate(appointment.date)}</strong>
            </div>
            <div>
              <span>الوقت:</span>
              <strong>{appointment.time}</strong>
            </div>
            <div>
              <span>المحامي:</span>
              <strong>{appointment.lawyerName || 'بانتظار التعيين'}</strong>
            </div>
            <div>
              <span>النوع:</span>
              <strong>{appointment.type}</strong>
            </div>
          </div>
        </section>

        <FieldGrid cols={2}>
          <Field label="التاريخ الجديد المقترح" required>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={set('date')}
              required
            />
          </Field>
          <Field label="الوقت الجديد المقترح" required>
            <input
              type="time"
              className="input"
              value={form.time}
              onChange={set('time')}
              required
            />
          </Field>
        </FieldGrid>

        <Field label="سبب التغيير" full>
          <textarea
            className="input input--area"
            rows={4}
            value={form.reason}
            onChange={set('reason')}
            placeholder="اكتب سبب طلب تغيير الموعد..."
          />
        </Field>
      </form>
    </Modal>
  )
}

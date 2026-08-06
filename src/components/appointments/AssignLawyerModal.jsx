import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Icon } from '../ui/Icon'
import { appointmentLawyers, formatAppointmentDate } from '../../data/appointments'

export function AssignLawyerModal({ open, appointment, onClose, onAssign }) {
  const [lawyerId, setLawyerId] = useState('')

  useEffect(() => {
    if (open) setLawyerId(appointment?.lawyerId || '')
  }, [open, appointment])

  if (!appointment) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!lawyerId) return
    onAssign(appointment.id, lawyerId)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="تعيين محامي للموعد"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="submit" form="assign-lawyer-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="assign-lawyer-form" onSubmit={handleSubmit}>
        <section className="appointment-summary">
          <h3>
            <Icon name="calendar" size={19} />
            تفاصيل الموعد
          </h3>
          <p><b>الموكل:</b> {appointment.clientName}</p>
          <p><b>التاريخ:</b> {formatAppointmentDate(appointment.date)}</p>
          <p><b>الوقت:</b> {appointment.time}</p>
          <p><b>النوع:</b> {appointment.type}</p>
        </section>

        <label className="field field--full appointment-lawyer-field">
          <span className="field__label">
            اختر المحامي <span className="field__req">*</span>
          </span>
          <select
            className="input"
            value={lawyerId}
            onChange={(event) => setLawyerId(event.target.value)}
            required
          >
            <option value="">-- اختر محامي --</option>
            {appointmentLawyers.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </option>
            ))}
          </select>
        </label>

        <div className="info-banner appointment-info-banner">
          <Icon name="info" size={20} />
          <strong>سيتم إشعار المحامي والموكل بعد التعيين.</strong>
        </div>
      </form>
    </Modal>
  )
}

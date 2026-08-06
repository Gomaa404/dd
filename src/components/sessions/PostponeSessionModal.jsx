import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Icon } from '../ui/Icon'
import { Field } from '../ui/Form'
import { formatSessionDate } from '../../data/sessions'

export function PostponeSessionModal({ open, session, onClose, onPostpone }) {
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open || !session) return
    setDate(session.date || '')
    setReason('')
  }, [open, session])

  if (!session) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!date.trim() || !reason.trim()) return
    onPostpone(session.id, { date: date.trim(), reason: reason.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="تأجيل الجلسة"
      onClose={onClose}
      footer={
        <>
          <button type="submit" form="postpone-session-form" className="btn btn--primary">
            تأكيد التأجيل
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="postpone-session-form" className="postpone-form" onSubmit={handleSubmit}>
        <div className="postpone-form__summary">
          <Icon name="calendar" size={18} />
          <div>
            <strong>جلسة #{session.sessionNumber}</strong>
            <span>
              {session.caseTitle} — التاريخ الحالي: {formatSessionDate(session.date)}
            </span>
          </div>
        </div>

        <Field label="التاريخ الجديد" required full>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <p className="field__hint">أدخل التاريخ الجديد للجلسة</p>
        </Field>

        <Field label="سبب التأجيل" required full>
          <textarea
            className="input input--area"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب تأجيل الجلسة..."
            required
          />
        </Field>
      </form>
    </Modal>
  )
}

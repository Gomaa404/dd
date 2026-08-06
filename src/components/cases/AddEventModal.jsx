import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Field, FieldGrid } from '../ui/Form'
import { eventTypeOptions, eventImportanceOptions } from '../../data/cases'

const emptyEvent = {
  title: '',
  type: 'جلسة محكمة',
  date: '',
  importance: 'عادي',
  details: '',
  reminder: false,
}

export function AddEventModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(emptyEvent)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    setForm(emptyEvent)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    onSave({
      id: String(Date.now()),
      ...form,
    })
    setForm(emptyEvent)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="إضافة حدث جديد"
      onClose={handleClose}
      footer={
        <>
          <button type="submit" form="add-event-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="add-event-form" className="case-form" onSubmit={handleSubmit}>
        <FieldGrid cols={1}>
          <Field label="عنوان الحدث" required>
            <input
              className="input"
              value={form.title}
              onChange={set('title')}
              placeholder="مثال: جلسة استماع"
              required
            />
          </Field>
          <Field label="نوع الحدث">
            <select className="input" value={form.type} onChange={set('type')}>
              {eventTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تاريخ الحدث" required>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={set('date')}
              required
            />
          </Field>
          <Field label="الأهمية">
            <select
              className="input"
              value={form.importance}
              onChange={set('importance')}
            >
              {eventImportanceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تفاصيل الحدث">
            <textarea
              className="input input--area"
              rows={4}
              value={form.details}
              onChange={set('details')}
              placeholder="اكتب تفاصيل ما حدث في هذا التاريخ..."
            />
          </Field>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.reminder}
              onChange={set('reminder')}
            />
            <span>إضافة تنبيه — تذكير قبل الموعد</span>
          </label>
        </FieldGrid>
      </form>
    </Modal>
  )
}

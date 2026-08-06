import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Field, FieldGrid } from '../ui/Form'
import { clientStatusOptions, emptyClientForm } from '../../data/clients'

export function ClientFormModal({ open, mode = 'add', initialValues, onClose, onSave }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(emptyClientForm)

  useEffect(() => {
    if (!open) return
    if (isEdit && initialValues) {
      setForm({
        name: initialValues.name || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        nationalId: initialValues.nationalId || '',
        address: initialValues.address || '',
        password: '',
        status: initialValues.status || 'نشط',
      })
    } else {
      setForm(emptyClientForm)
    }
  }, [open, isEdit, initialValues])

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleClose = () => {
    setForm(emptyClientForm)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    onSave({ ...form })
    setForm(emptyClientForm)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'تعديل الموكل' : 'إضافة موكل جديد'}
      onClose={handleClose}
      footer={
        <>
          <button type="submit" form="client-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="client-form" className="case-form" onSubmit={handleSubmit}>
        <FieldGrid cols={1}>
          <Field label="الاسم الكامل" required>
            <input
              className="input"
              value={form.name}
              onChange={set('name')}
              required
            />
          </Field>
          <Field label="البريد الإلكتروني" required>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
            />
          </Field>
          <Field label="رقم الجوال">
            <input
              className="input"
              value={form.phone}
              onChange={set('phone')}
              placeholder="05xxxxxxxx"
            />
          </Field>
          <Field label="رقم الهوية">
            <input
              className="input"
              value={form.nationalId}
              onChange={set('nationalId')}
            />
          </Field>
          <Field label="العنوان">
            <input
              className="input"
              value={form.address}
              onChange={set('address')}
            />
          </Field>
          {!isEdit ? (
            <Field label="كلمة المرور">
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
              />
            </Field>
          ) : null}
          <Field label="الحالة">
            <select className="input" value={form.status} onChange={set('status')}>
              {clientStatusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>
      </form>
    </Modal>
  )
}

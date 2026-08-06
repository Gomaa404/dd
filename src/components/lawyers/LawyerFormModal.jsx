import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { FormSection, Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import {
  lawyerStatusOptions,
  specializationOptions,
  emptyLawyerForm,
} from '../../data/lawyers'

export function LawyerFormModal({ open, mode = 'add', initialValues, onClose, onSave }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(emptyLawyerForm)

  useEffect(() => {
    if (!open) return
    if (isEdit && initialValues) {
      setForm({
        name: initialValues.name || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        nationalId: initialValues.nationalId || '',
        barNumber: initialValues.barNumber || '',
        address: initialValues.address || '',
        password: '',
        status: initialValues.status || 'نشط',
        specialization: initialValues.specialization || '',
        notes: initialValues.notes || '',
      })
    } else {
      setForm(emptyLawyerForm)
    }
  }, [open, isEdit, initialValues])

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleClose = () => {
    setForm(emptyLawyerForm)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    onSave({ ...form })
    setForm(emptyLawyerForm)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'تعديل المحامي' : 'إضافة محامي جديد'}
      onClose={handleClose}
      wide
      footer={
        <>
          <button type="submit" form="lawyer-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="lawyer-form" className="case-form" onSubmit={handleSubmit}>
        <FormSection icon={<Icon name="lawyers" />} title="معلومات المحامي">
          <FieldGrid>
            <Field label="الاسم الكامل" required full>
              <input
                className="input"
                value={form.name}
                onChange={set('name')}
                placeholder="اسم المحامي بالكامل"
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
                placeholder="رقم الهوية للمحامي"
              />
            </Field>
            <Field label="رقم القيد بالنقابة">
              <input
                className="input"
                value={form.barNumber}
                onChange={set('barNumber')}
              />
            </Field>
            <Field label="العنوان" full>
              <input
                className="input"
                value={form.address}
                onChange={set('address')}
              />
            </Field>
            <Field
              label={isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}
              full
            >
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
              />
              {!isEdit ? (
                <p className="field__hint">
                  سيتم إرسال كلمة المرور للمحامي عبر البريد الإلكتروني
                </p>
              ) : null}
            </Field>
            <Field label="الحالة" full>
              <select className="input" value={form.status} onChange={set('status')}>
                {lawyerStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="التخصص" full>
              <select
                className="input"
                value={form.specialization}
                onChange={set('specialization')}
              >
                <option value="">اختر التخصص</option>
                {specializationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ملاحظات" full>
              <textarea
                className="input input--area"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="أي ملاحظات إضافية عن المحامي"
              />
            </Field>
          </FieldGrid>
        </FormSection>
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { FormSection, Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import {
  emptySessionForm,
  sessionCaseOptions,
  sessionTypeOptions,
  sessionImportanceOptions,
  sessionStatusOptions,
  sessionDecisionOptions,
  sessionLawyerOptions,
} from '../../data/sessions'

export function SessionFormModal({
  open,
  session,
  onClose,
  onSave,
  caseOptions = sessionCaseOptions,
  hideLawyer = false,
}) {
  const [form, setForm] = useState(emptySessionForm)
  const isEdit = Boolean(session)

  useEffect(() => {
    if (!open) return
    setForm(
      session
        ? {
            caseId: session.caseId,
            sessionNumber: session.sessionNumber,
            date: session.date,
            time: session.time,
            type: session.type,
            court: session.court,
            circuit: session.circuit,
            judge: session.judge,
            hall: session.hall,
            courtAddress: session.courtAddress,
            notes: session.notes,
            importance: session.importance,
            status: session.status,
            decision: session.decision,
            lawyerId: session.lawyerId,
          }
        : emptySessionForm,
    )
  }, [open, session])

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.caseId || !form.date || !form.court.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'تعديل الجلسة' : 'إضافة جلسة قضائية'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="submit" form="session-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="session-form" className="case-form" onSubmit={handleSubmit}>
        <FormSection icon={<Icon name="cases" />} title="معلومات الجلسة">
          <FieldGrid cols={2}>
            <Field label="القضية" required full>
              <select
                className="input"
                value={form.caseId}
                onChange={set('caseId')}
                required
              >
                <option value="">-- اختر القضية --</option>
                {caseOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.number} - {item.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="رقم الجلسة">
              <input
                className="input"
                value={isEdit ? form.sessionNumber : ''}
                readOnly={!isEdit}
                placeholder="تلقائي"
                onChange={set('sessionNumber')}
              />
              {!isEdit ? (
                <p className="field__hint">سيتم تعيينه تلقائياً</p>
              ) : null}
            </Field>
            <Field label="تاريخ الجلسة" required>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={set('date')}
                required
              />
            </Field>
            <Field label="وقت الجلسة">
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={set('time')}
              />
            </Field>
            <Field label="نوع الجلسة">
              <select className="input" value={form.type} onChange={set('type')}>
                {sessionTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            {!hideLawyer ? (
              <Field label="المحامي">
                <select
                  className="input"
                  value={form.lawyerId}
                  onChange={set('lawyerId')}
                >
                  <option value="">-- اختر محامي --</option>
                  {sessionLawyerOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="sessions" />} title="معلومات المحكمة">
          <FieldGrid cols={2}>
            <Field label="المحكمة" required full>
              <input
                className="input"
                value={form.court}
                onChange={set('court')}
                placeholder="مثال: محكمة القاهرة الابتدائية"
                required
              />
            </Field>
            <Field label="الدائرة">
              <input
                className="input"
                value={form.circuit}
                onChange={set('circuit')}
                placeholder="مثال: الدائرة الثالثة"
              />
            </Field>
            <Field label="القاضي">
              <input
                className="input"
                value={form.judge}
                onChange={set('judge')}
                placeholder="اسم القاضي"
              />
            </Field>
            <Field label="رقم القاعة">
              <input
                className="input"
                value={form.hall}
                onChange={set('hall')}
                placeholder="رقم أو اسم القاعة"
              />
            </Field>
            <Field label="عنوان المحكمة" full>
              <input
                className="input"
                value={form.courtAddress}
                onChange={set('courtAddress')}
                placeholder="عنوان المحكمة (اختياري)"
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="notes" />} title="معلومات إضافية">
          <FieldGrid cols={2}>
            <Field label="ملاحظات" full>
              <textarea
                className="input input--area"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="أي ملاحظات إضافية..."
              />
            </Field>
            <Field label="الأهمية">
              <select
                className="input"
                value={form.importance}
                onChange={set('importance')}
              >
                {sessionImportanceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            {isEdit ? (
              <>
                <Field label="الحالة">
                  <select
                    className="input"
                    value={form.status}
                    onChange={set('status')}
                  >
                    {sessionStatusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="القرار">
                  <select
                    className="input"
                    value={form.decision}
                    onChange={set('decision')}
                  >
                    {sessionDecisionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : null}
          </FieldGrid>
        </FormSection>

        {!isEdit ? (
          <div className="info-banner">
            <Icon name="info" size={20} />
            <div>
              <strong>
                ملاحظة: رقم الجلسة سيتم تعيينه تلقائياً بناءً على القضية المختارة
              </strong>
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}

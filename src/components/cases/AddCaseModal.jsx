import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { FormSection, Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import {
  caseTypeOptions,
  caseStatusOptions,
  priorityOptions,
  classificationOptions,
  stageOptions,
  clientOptions,
  lawyerOptions,
  emptyCaseForm,
} from '../../data/cases'

export function AddCaseModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(emptyCaseForm)
  const [filesLabel, setFilesLabel] = useState('لم يتم اختيار ملف')

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const reset = () => {
    setForm(emptyCaseForm)
    setFilesLabel('لم يتم اختيار ملف')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.number.trim() || !form.title.trim() || !form.type || !form.client || !form.lawyer) {
      return
    }
    onSave({
      ...form,
      status: form.status === 'نشطة' ? 'قيد' : form.status,
      nextSession: form.nextSession || '—',
    })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      title="إضافة قضية جديدة"
      onClose={handleClose}
      wide
      footer={
        <>
          <button type="submit" form="add-case-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="add-case-form" className="case-form" onSubmit={handleSubmit}>
        <FormSection icon={<Icon name="info" />} title="المعلومات الأساسية">
          <FieldGrid>
            <Field label="رقم القضية" required>
              <input
                className="input"
                value={form.number}
                onChange={set('number')}
                placeholder="مثال: 2024/1234"
                required
              />
            </Field>
            <Field label="عنوان القضية" required>
              <input
                className="input"
                value={form.title}
                onChange={set('title')}
                placeholder="وصف مختصر للقضية"
                required
              />
            </Field>
            <Field label="نوع القضية" required>
              <select
                className="input"
                value={form.type}
                onChange={set('type')}
                required
              >
                <option value="">اختر النوع</option>
                {caseTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="حالة القضية" required>
              <select
                className="input"
                value={form.status}
                onChange={set('status')}
                required
              >
                {caseStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="cases" />} title="معلومات المحكمة">
          <FieldGrid>
            <Field label="اسم المحكمة" required>
              <input
                className="input"
                value={form.courtName}
                onChange={set('courtName')}
                placeholder="مثال: محكمة الرياض العامة"
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
            <Field label="اسم القاضي">
              <input
                className="input"
                value={form.judgeName}
                onChange={set('judgeName')}
                placeholder="اسم القاضي المسؤول"
              />
            </Field>
            <Field label="رقم الدعوى بالمحكمة">
              <input
                className="input"
                value={form.courtCaseNumber}
                onChange={set('courtCaseNumber')}
                placeholder="رقم القضية في المحكمة"
              />
            </Field>
            <Field label="تاريخ أول جلسة">
              <input
                className="input"
                type="date"
                value={form.firstSession}
                onChange={set('firstSession')}
              />
            </Field>
            <Field label="الجلسة القادمة">
              <input
                className="input"
                type="date"
                value={form.nextSession}
                onChange={set('nextSession')}
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="clients" />} title="الأطراف">
          <FieldGrid>
            <Field label="الموكل" required full>
              <select
                className="input"
                value={form.client}
                onChange={set('client')}
                required
              >
                <option value="">اختر الموكل</option>
                {clientOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المحامي المسؤول" required full>
              <select
                className="input"
                value={form.lawyer}
                onChange={set('lawyer')}
                required
              >
                <option value="">اختر المحامي</option>
                {lawyerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الخصم (الطرف الآخر)" full>
              <input
                className="input"
                value={form.opponent}
                onChange={set('opponent')}
                placeholder="اسم الخصم في القضية"
              />
            </Field>
            <Field label="محامي الخصم">
              <input
                className="input"
                value={form.opponentLawyer}
                onChange={set('opponentLawyer')}
                placeholder="اسم محامي الطرف الآخر"
              />
            </Field>
            <Field label="هاتف محامي الخصم">
              <input
                className="input"
                value={form.opponentLawyerPhone}
                onChange={set('opponentLawyerPhone')}
                placeholder="رقم التواصل"
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="documents" />} title="المستندات والوصف">
          <FieldGrid cols={1}>
            <Field label="وصف تفصيلي للقضية" full>
              <textarea
                className="input input--area"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="اكتب وصف تفصيلي للقضية وملابساتها..."
              />
            </Field>
            <Field label="الملاحظات الداخلية" full>
              <textarea
                className="input input--area"
                rows={3}
                value={form.internalNotes}
                onChange={set('internalNotes')}
                placeholder="ملاحظات خاصة للفريق القانوني..."
              />
            </Field>
            <Field label="المستندات المطلوبة" full>
              <textarea
                className="input input--area"
                rows={2}
                value={form.requiredDocuments}
                onChange={set('requiredDocuments')}
                placeholder="قائمة بالمستندات المطلوبة من الموكل..."
              />
            </Field>
            <Field label="رفع مستندات القضية" full>
              <div className="file-upload">
                <label className="file-upload__btn">
                  اختيار ملفات
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    className="file-upload__input"
                    onChange={(e) => {
                      const count = e.target.files?.length || 0
                      setFilesLabel(
                        count === 0
                          ? 'لم يتم اختيار ملف'
                          : count === 1
                            ? e.target.files[0].name
                            : `${count} ملفات مختارة`,
                      )
                    }}
                  />
                </label>
                <span className="file-upload__name">{filesLabel}</span>
              </div>
              <p className="field__hint">يمكنك رفع عدة ملفات (PDF, Word, صور)</p>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="calendar" />} title="التواريخ المهمة">
          <FieldGrid>
            <Field label="تاريخ الواقعة">
              <input
                className="input"
                type="date"
                value={form.incidentDate}
                onChange={set('incidentDate')}
              />
            </Field>
            <Field label="تاريخ التوكيل">
              <input
                className="input"
                type="date"
                value={form.powerOfAttorneyDate}
                onChange={set('powerOfAttorneyDate')}
              />
            </Field>
            <Field label="تاريخ انتهاء التقادم">
              <input
                className="input"
                type="date"
                value={form.limitationExpiry}
                onChange={set('limitationExpiry')}
              />
            </Field>
            <Field label="الموعد النهائي للحكم">
              <input
                className="input"
                type="date"
                value={form.judgmentDeadline}
                onChange={set('judgmentDeadline')}
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="alert" />} title="الأولوية والتصنيف">
          <FieldGrid>
            <Field label="مستوى الأولوية">
              <select
                className="input"
                value={form.priority}
                onChange={set('priority')}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="التصنيف">
              <select
                className="input"
                value={form.classification}
                onChange={set('classification')}
              >
                <option value="">اختر التصنيف</option>
                {classificationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المرحلة الحالية" full>
              <select
                className="input"
                value={form.stage}
                onChange={set('stage')}
              >
                {stageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </FormSection>
      </form>
    </Modal>
  )
}

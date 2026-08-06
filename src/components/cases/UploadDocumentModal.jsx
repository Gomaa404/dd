import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { FormSection, Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import { documentTypeOptions } from '../../data/cases'

const emptyDoc = {
  name: '',
  type: '',
  notes: '',
  fileName: '',
}

export function UploadDocumentModal({ open, onClose, onSave, caseLabel }) {
  const [form, setForm] = useState(emptyDoc)
  const [fileLabel, setFileLabel] = useState('لم يتم اختيار ملف')

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleClose = () => {
    setForm(emptyDoc)
    setFileLabel('لم يتم اختيار ملف')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.fileName) return
    onSave({
      id: String(Date.now()),
      name: form.name,
      type: form.type || 'أخرى',
      notes: form.notes,
      fileName: form.fileName,
      uploadedAt: new Date().toLocaleDateString('ar-SA'),
    })
    setForm(emptyDoc)
    setFileLabel('لم يتم اختيار ملف')
    onClose()
  }

  return (
    <Modal
      open={open}
      title="رفع مستند جديد"
      onClose={handleClose}
      wide
      footer={
        <>
          <button type="submit" form="upload-doc-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="upload-doc-form" className="case-form" onSubmit={handleSubmit}>
        <FormSection icon={<Icon name="documents" />} title="معلومات المستند">
          <FieldGrid cols={1}>
            <Field label="اختر الملف" required>
              <div className="file-upload">
                <label className="file-upload__btn">
                  اختيار ملف
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                    className="file-upload__input"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      setFileLabel(file ? file.name : 'لم يتم اختيار ملف')
                      setForm((prev) => ({
                        ...prev,
                        fileName: file?.name || '',
                      }))
                    }}
                  />
                </label>
                <span className="file-upload__name">{fileLabel}</span>
              </div>
              <p className="field__hint">
                الأنواع المسموحة: PDF, Word, Excel, صور (الحد الأقصى: 10 MB)
              </p>
            </Field>
            <Field label="اسم/وصف المستند" required>
              <input
                className="input"
                value={form.name}
                onChange={set('name')}
                placeholder="مثال: عقد الإيجار، صورة البطاقة، محضر الجلسة..."
                required
              />
              <p className="field__hint">
                هذا الوصف سيساعدك في التعرف على المستند لاحقاً
              </p>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="link" />} title="ربط بقضية">
          <FieldGrid cols={1}>
            <Field label="القضية المرتبطة">
              <input
                className="input"
                value={caseLabel || ''}
                readOnly
              />
            </Field>
            <Field label="نوع المستند">
              <select className="input" value={form.type} onChange={set('type')}>
                <option value="">-- اختر النوع --</option>
                {documentTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="notes" />} title="ملاحظات إضافية">
          <Field label="ملاحظات" full>
            <textarea
              className="input input--area"
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="أي ملاحظات إضافية عن المستند..."
            />
          </Field>
        </FormSection>

        <div className="info-banner">
          <Icon name="info" size={20} />
          <div>
            <strong>معلومات هامة</strong>
            <ul>
              <li>سيتم حفظ المستند بشكل آمن في النظام.</li>
              <li>سيتم إشعار الأطراف المرتبطين بالقضية عند رفع المستند.</li>
              <li>يمكنك تنزيل المستند لاحقاً من قائمة المستندات.</li>
            </ul>
          </div>
        </div>
      </form>
    </Modal>
  )
}

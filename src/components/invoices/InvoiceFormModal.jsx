import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../ui/Modal'
import { FormSection, Field, FieldGrid } from '../ui/Form'
import { Icon } from '../ui/Icon'
import {
  emptyInvoiceForm,
  invoiceClients,
  invoiceCases,
  invoiceStatusOptions,
  paymentMethodOptions,
  deriveStatus,
  generateInvoiceNumber,
} from '../../data/invoices'

export function InvoiceFormModal({ open, invoice, onClose, onSave }) {
  const [form, setForm] = useState(emptyInvoiceForm)
  const isEdit = Boolean(invoice)

  useEffect(() => {
    if (!open) return
    setForm(
      invoice
        ? {
            number: invoice.number,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            clientId: invoice.clientId,
            caseId: invoice.caseId,
            description: invoice.description,
            total: String(invoice.total ?? ''),
            paid: String(invoice.paid ?? ''),
            status: invoice.status,
            items: invoice.items || [],
            paymentMethod: invoice.paymentMethod || '',
            notes: invoice.notes || '',
          }
        : {
            ...emptyInvoiceForm,
            number: generateInvoiceNumber(),
            issueDate: new Date().toISOString().slice(0, 10),
          },
    )
  }, [open, invoice])

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const itemsTotal = useMemo(
    () => (form.items || []).reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
    [form.items],
  )

  const remaining = Math.max(
    0,
    (Number(form.total) || 0) - (Number(form.paid) || 0),
  )

  const autoStatus = deriveStatus(form.total, form.paid)

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...(prev.items || []), { description: '', amount: '' }],
    }))
  }

  const updateItem = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) =>
        i === index ? { ...it, [key]: value } : it,
      ),
    }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.clientId || !form.description.trim() || !form.total) return
    onSave({ ...form, status: form.status || autoStatus })
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="submit" form="invoice-form" className="btn btn--primary">
            حفظ
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <form id="invoice-form" className="case-form" onSubmit={handleSubmit}>
        <FormSection icon={<Icon name="invoices" />} title="معلومات الفاتورة">
          <FieldGrid cols={2}>
            <Field label="رقم الفاتورة" required>
              <input className="input" value={form.number} onChange={set('number')} readOnly />
            </Field>
            <Field label="تاريخ الإصدار" required>
              <input
                type="date"
                className="input"
                value={form.issueDate}
                onChange={set('issueDate')}
                required
              />
            </Field>
            <Field label="الموكل" required>
              <select
                className="input"
                value={form.clientId}
                onChange={set('clientId')}
                required
              >
                <option value="">اختر الموكل</option>
                {invoiceClients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="القضية (اختياري)">
              <select className="input" value={form.caseId} onChange={set('caseId')}>
                <option value="">اختر القضية</option>
                {invoiceCases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} (#{item.number})
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="cash" />} title="تفاصيل المبالغ">
          <FieldGrid cols={2}>
            <Field label="وصف الفاتورة" required full>
              <textarea
                className="input input--area"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="أتعاب قانونية، استشارة، مصروفات قضائية..."
                required
              />
            </Field>
            <Field label="المبلغ الإجمالي" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.total}
                onChange={set('total')}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="المبلغ المدفوع">
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.paid}
                onChange={set('paid')}
                placeholder="0"
              />
            </Field>
            <Field label="المبلغ المتبقي">
              <input
                className="input"
                value={remaining.toFixed(2)}
                readOnly
                tabIndex={-1}
              />
            </Field>
            <Field label="تاريخ الاستحقاق">
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={set('dueDate')}
              />
            </Field>
            <Field label="حالة الفاتورة" full>
              <select
                className={`input invoice-status-select invoice-status-select--${statusKey(form.status)}`}
                value={form.status}
                onChange={set('status')}
              >
                {invoiceStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection icon={<Icon name="notes" />} title="بنود الفاتورة (اختياري)">
          <div className="invoice-items">
            {(form.items || []).length === 0 ? (
              <p className="invoice-items__empty">لا توجد بنود</p>
            ) : (
              form.items.map((item, index) => (
                <div key={index} className="invoice-item-row">
                  <input
                    className="input"
                    placeholder="وصف البند"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="المبلغ"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn--danger invoice-item-row__del"
                    onClick={() => removeItem(index)}
                    aria-label="حذف البند"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))
            )}
            <button type="button" className="btn btn--ghost" onClick={addItem}>
              <Icon name="plus" size={16} />
              إضافة بند
            </button>
            <div className="invoice-items__total">
              إجمالي البنود: {itemsTotal.toFixed(2)} جنيه
            </div>
          </div>
        </FormSection>

        <FormSection icon={<Icon name="payment" />} title="معلومات الدفع">
          <FieldGrid cols={1}>
            <Field label="طريقة الدفع المفضلة">
              <select
                className="input"
                value={form.paymentMethod}
                onChange={set('paymentMethod')}
              >
                <option value="">غير محدد</option>
                {paymentMethodOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ملاحظات إضافية">
              <textarea
                className="input input--area"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
              />
            </Field>
          </FieldGrid>
        </FormSection>
      </form>
    </Modal>
  )
}

function statusKey(status) {
  if (status === 'مدفوعة') return 'paid'
  if (status === 'مدفوعة جزئياً') return 'partial'
  if (status === 'ملغاة') return 'cancelled'
  return 'unpaid'
}

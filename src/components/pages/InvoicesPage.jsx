import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { StatCard } from '../dashboard/StatCard'
import { InvoiceFormModal } from '../invoices/InvoiceFormModal'
import { InvoiceDetailsModal } from '../invoices/InvoiceDetailsModal'
import { RecordPaymentModal } from '../invoices/RecordPaymentModal'
import { useAuth } from '../../context/AuthContext'
import { getLawyerInvoices } from '../../data/lawyerDashboard'
import { getClientInvoices } from '../../data/clientDashboard'
import {
  initialInvoices,
  invoiceStatusOptions,
  createInvoiceFromForm,
  invoiceCases,
  invoiceClients,
  formatMoney,
  formatInvoiceDate,
  remaining,
  deriveStatus,
  calcInvoiceStats,
} from '../../data/invoices'

function statusPill(status) {
  if (status === 'مدفوعة') return 'invoice-pill invoice-pill--paid'
  if (status === 'مدفوعة جزئياً') return 'invoice-pill invoice-pill--partial'
  if (status === 'ملغاة') return 'invoice-pill invoice-pill--cancelled'
  return 'invoice-pill invoice-pill--unpaid'
}

function printInvoice(invoice, payment) {
  const win = window.open('', '_blank', 'width=780,height=900')
  if (!win) return
  const rows = payment
    ? `<tr><td>${formatInvoiceDate(payment.date)}</td><td>${formatMoney(payment.amount)}</td><td>${payment.method}</td><td>${payment.reference || '—'}</td></tr>`
    : (invoice.payments || [])
        .map(
          (p) =>
            `<tr><td>${formatInvoiceDate(p.date)}</td><td>${formatMoney(p.amount)}</td><td>${p.method}</td><td>${p.reference || '—'}</td></tr>`,
        )
        .join('')
  win.document.write(`
    <html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${payment ? 'إيصال' : 'فاتورة'} ${invoice.number}</title>
    <style>
      body{font-family:'Segoe UI',Tahoma,sans-serif;padding:28px;color:#1e3a3c}
      h1{color:#8b775e;margin:0 0 4px}
      .muted{color:#777;margin:0 0 20px}
      table{width:100%;border-collapse:collapse;margin-top:14px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right;font-size:14px}
      th{background:#f4f1ea}
      .totals{margin-top:16px;font-size:16px}
      .totals div{display:flex;justify-content:space-between;padding:4px 0}
    </style></head><body>
      <h1>مكتب الدوسري للمحاماة</h1>
      <p class="muted">${payment ? 'إيصال سداد' : 'فاتورة'} رقم ${invoice.number}</p>
      <p><b>الموكل:</b> ${invoice.clientName || '—'}</p>
      <p><b>الوصف:</b> ${invoice.description || '—'}</p>
      <p><b>تاريخ الإصدار:</b> ${formatInvoiceDate(invoice.issueDate)}</p>
      <table><thead><tr><th>التاريخ</th><th>المبلغ</th><th>الطريقة</th><th>المرجع</th></tr></thead><tbody>${rows || '<tr><td colspan="4">لا توجد مدفوعات</td></tr>'}</tbody></table>
      <div class="totals">
        <div><span>الإجمالي</span><b>${formatMoney(invoice.total)}</b></div>
        <div><span>المدفوع</span><b>${formatMoney(invoice.paid)}</b></div>
        <div><span>المتبقي</span><b>${formatMoney(remaining(invoice))}</b></div>
      </div>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`)
  win.document.close()
}

export default function InvoicesPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const isClient = user?.roleId === 'client'
  const isAdmin = !isLawyer && !isClient
  const [invoices, setInvoices] = useState(initialInvoices)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [paymentId, setPaymentId] = useState(null)

  const scoped = useMemo(() => {
    if (isLawyer) return getLawyerInvoices(user?.name, invoices)
    if (isClient) return getClientInvoices(user?.name, invoices)
    return invoices
  }, [invoices, isLawyer, isClient, user?.name])

  const stats = useMemo(() => calcInvoiceStats(scoped), [scoped])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((inv) => {
      if (statusFilter && inv.status !== statusFilter) return false
      if (!q) return true
      return [inv.number, inv.clientName, inv.caseTitle, inv.description, inv.status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [scoped, query, statusFilter])

  const editingInvoice = invoices.find((item) => item.id === editingId) || null
  const detailsInvoice = invoices.find((item) => item.id === detailsId) || null
  const paymentInvoice = invoices.find((item) => item.id === paymentId) || null

  const openAdd = () => {
    setEditingId(null)
    setFormOpen(true)
  }

  const handleSave = (form) => {
    if (editingId) {
      const client = invoiceClients.find((item) => item.id === form.clientId)
      const linkedCase = invoiceCases.find((item) => item.id === form.caseId)
      const total = Number(form.total) || 0
      const paid = Number(form.paid) || 0
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                number: form.number,
                issueDate: form.issueDate,
                dueDate: form.dueDate,
                clientId: client?.id || '',
                clientName: client?.name || item.clientName,
                caseId: linkedCase?.id || '',
                caseTitle: linkedCase?.title || '',
                description: form.description.trim(),
                total,
                paid,
                status: form.status || deriveStatus(total, paid),
                items: form.items || [],
                paymentMethod: form.paymentMethod || '',
                notes: form.notes?.trim() || '',
              }
            : item,
        ),
      )
      return
    }
    setInvoices((prev) => [createInvoiceFromForm(form), ...prev])
  }

  const handleAddPayment = (id, payment) => {
    setInvoices((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const paid = (Number(item.paid) || 0) + payment.amount
        return {
          ...item,
          paid,
          status: deriveStatus(item.total, paid),
          payments: [...(item.payments || []), payment],
        }
      }),
    )
  }

  const handleDelete = (id) => {
    setInvoices((prev) => prev.filter((item) => item.id !== id))
    if (detailsId === id) setDetailsId(null)
    if (editingId === id) setEditingId(null)
    if (paymentId === id) setPaymentId(null)
  }

  return (
    <div className="invoices-page">
      <div className="stats-grid">
        <StatCard value={formatMoney(stats.total)} label="إجمالي الفواتير" tone="gold" icon="invoices" index={0} />
        <StatCard value={formatMoney(stats.collected)} label="المحصّل" tone="success" icon="check" index={1} />
        <StatCard value={formatMoney(stats.due)} label="المستحق" tone="teal" icon="cash" index={2} />
        <StatCard value={stats.overdue} label="فواتير متأخرة السداد" tone="muted" icon="alert" index={3} />
      </div>

      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">الفواتير والمدفوعات</h2>
        <div className="cases-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في الفواتير..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="تصفية حسب الحالة"
          >
            <option value="">كل الفواتير</option>
            {invoiceStatusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {isAdmin && (
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              <Icon name="plus" size={18} />
              إضافة فاتورة
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table invoices-table">
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>القضية/الموكل</th>
                <th>الوصف</th>
                <th>المبلغ</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
                <th>تاريخ الاستحقاق</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="data-table__empty">
                    لا توجد فواتير
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const due = remaining(inv)
                  const isPayable = due > 0 && inv.status !== 'ملغاة'
                  return (
                    <tr key={inv.id}>
                      <td className="invoices-table__num">{inv.number}</td>
                      <td>
                        <div className="invoice-party">
                          <strong>{inv.clientName || '—'}</strong>
                          {inv.caseTitle ? <small>{inv.caseTitle}</small> : null}
                        </div>
                      </td>
                      <td>{inv.description || '—'}</td>
                      <td>{formatMoney(inv.total)}</td>
                      <td className="invoices-table__paid">{formatMoney(inv.paid)}</td>
                      <td className="invoices-table__due">{formatMoney(due)}</td>
                      <td>{formatInvoiceDate(inv.dueDate)}</td>
                      <td>
                        <span className={statusPill(inv.status)}>{inv.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {isPayable && !isClient ? (
                            <button
                              type="button"
                              className="action-btn action-btn--pay"
                              title="تسجيل دفعة"
                              onClick={() => setPaymentId(inv.id)}
                            >
                              <Icon name="cash" size={16} />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="action-btn action-btn--view"
                            title="عرض التفاصيل"
                            onClick={() => setDetailsId(inv.id)}
                          >
                            <Icon name="eye" size={16} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--print"
                            title="طباعة"
                            onClick={() => printInvoice(inv)}
                          >
                            <Icon name="print" size={16} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="action-btn action-btn--edit"
                                title="تعديل"
                                onClick={() => {
                                  setEditingId(inv.id)
                                  setFormOpen(true)
                                }}
                              >
                                <Icon name="edit" size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-btn action-btn--delete"
                                title="حذف"
                                onClick={() => handleDelete(inv.id)}
                              >
                                <Icon name="trash" size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceFormModal
        open={formOpen}
        invoice={editingInvoice}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
      />
      <InvoiceDetailsModal
        open={Boolean(detailsInvoice)}
        invoice={detailsInvoice}
        onClose={() => setDetailsId(null)}
        onPrintReceipt={printInvoice}
      />
      <RecordPaymentModal
        open={Boolean(paymentInvoice)}
        invoice={paymentInvoice}
        onClose={() => setPaymentId(null)}
        onSave={handleAddPayment}
      />
    </div>
  )
}

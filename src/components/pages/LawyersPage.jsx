import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { LawyerFormModal } from '../lawyers/LawyerFormModal'
import { LawyerDetailsModal } from '../lawyers/LawyerDetailsModal'
import { initialLawyers, createLawyerFromForm } from '../../data/lawyers'

function statusClass(status) {
  if (status === 'نشط') return 'status-pill status-pill--active'
  if (status === 'موقوف') return 'status-pill status-pill--done'
  return 'status-pill status-pill--hold'
}

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState(initialLawyers)
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [editingId, setEditingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lawyers
    return lawyers.filter((item) =>
      [
        item.name,
        item.email,
        item.phone,
        item.specialization,
        item.barNumber,
        item.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [lawyers, query])

  const editingLawyer = lawyers.find((item) => item.id === editingId) || null
  const detailsLawyer = lawyers.find((item) => item.id === detailsId) || null

  const openAdd = () => {
    setFormMode('add')
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (id) => {
    setFormMode('edit')
    setEditingId(id)
    setFormOpen(true)
  }

  const handleSave = (form) => {
    if (formMode === 'edit' && editingId) {
      setLawyers((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                nationalId: form.nationalId.trim(),
                barNumber: form.barNumber.trim(),
                address: form.address.trim(),
                status: form.status,
                specialization: form.specialization || item.specialization,
                notes: form.notes.trim(),
              }
            : item,
        ),
      )
      return
    }
    setLawyers((prev) => [createLawyerFromForm(form), ...prev])
  }

  const handleDelete = (id) => {
    setLawyers((prev) => prev.filter((item) => item.id !== id))
    if (detailsId === id) setDetailsId(null)
    if (editingId === id) setEditingId(null)
  }

  return (
    <div className="cases-page">
      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">المحامين</h2>
        <div className="cases-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في المحامين..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="بحث في المحامين"
            />
          </div>
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            <Icon name="plus" size={18} />
            إضافة محامي
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table data-table--lawyers">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table__empty">
                    لا يوجد محامون مطابقون لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="lawyer-name-cell">
                        <span className="lawyer-name-cell__name">{item.name}</span>
                        <span className="lawyer-name-cell__spec">
                          {item.specialization || '—'}
                        </span>
                      </div>
                    </td>
                    <td>{item.email}</td>
                    <td>{item.phone || '—'}</td>
                    <td>
                      <span className={statusClass(item.status)}>{item.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="تفاصيل"
                          aria-label={`تفاصيل ${item.name}`}
                          onClick={() => setDetailsId(item.id)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--edit"
                          title="تعديل"
                          aria-label={`تعديل ${item.name}`}
                          onClick={() => openEdit(item.id)}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--delete"
                          title="حذف"
                          aria-label={`حذف ${item.name}`}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LawyerFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editingLawyer}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
      />

      <LawyerDetailsModal
        open={Boolean(detailsLawyer)}
        lawyer={detailsLawyer}
        onClose={() => setDetailsId(null)}
      />
    </div>
  )
}

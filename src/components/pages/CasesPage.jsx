import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { AddCaseModal } from '../cases/AddCaseModal'
import { CaseDetailsModal } from '../cases/CaseDetailsModal'
import { initialCases, normalizeCaseFromForm } from '../../data/cases'
import { isSamePerson } from '../../data/roles'
import { useAuth } from '../../context/AuthContext'
import { getClientCases } from '../../data/clientDashboard'

function statusClass(status) {
  if (status === 'منتهي') return 'status-pill status-pill--done'
  if (status === 'مؤجل') return 'status-pill status-pill--hold'
  return 'status-pill status-pill--active'
}

function displayStatus(status) {
  if (status === 'قيد' || status === 'نشطة') return 'نشط'
  return status
}

export default function CasesPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const isClient = user?.roleId === 'client'
  const isAdmin = !isLawyer && !isClient
  const [cases, setCases] = useState(initialCases)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const visibleCases = useMemo(() => {
    if (isLawyer) {
      return cases.filter((item) => isSamePerson(item.lawyer, user?.name))
    }
    if (isClient) {
      return getClientCases(user?.name, cases)
    }
    return cases
  }, [cases, isLawyer, isClient, user?.name])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return visibleCases
    return visibleCases.filter((item) =>
      [item.number, item.title, item.client, item.lawyer, item.type, item.status]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [visibleCases, query])

  const selectedCase = cases.find((item) => item.id === selectedId) || null

  const handleSave = (payload) => {
    setCases((prev) => [normalizeCaseFromForm(payload), ...prev])
  }

  const handleUpdateCase = (updated) => {
    setCases((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  const handleDelete = (id) => {
    setCases((prev) => prev.filter((item) => item.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="cases-page">
      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">القضايا</h2>
        <div className="cases-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في القضايا..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="بحث في القضايا"
            />
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setAddOpen(true)}
            >
              <Icon name="plus" size={18} />
              إضافة قضية
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>رقم القضية</th>
                <th>العنوان</th>
                <th>الموكل</th>
                <th>المحامي</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>الجلسة القادمة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__empty">
                    لا توجد قضايا مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="data-table__mono">{item.number}</td>
                    <td>{item.title}</td>
                    <td>{item.client}</td>
                    <td>{item.lawyer}</td>
                    <td>{item.type}</td>
                    <td>
                      <span className={statusClass(item.status)}>
                        {displayStatus(item.status)}
                      </span>
                    </td>
                    <td>{item.nextSession}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="عرض"
                          aria-label={`عرض ${item.title}`}
                          onClick={() => setSelectedId(item.id)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        {!isClient && (
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            title="تعديل"
                            aria-label={`تعديل ${item.title}`}
                            onClick={() => setSelectedId(item.id)}
                          >
                            <Icon name="edit" size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="action-btn action-btn--delete"
                            title="حذف"
                            aria-label={`حذف ${item.title}`}
                            onClick={() => handleDelete(item.id)}
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCaseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSave}
      />

      <CaseDetailsModal
        open={Boolean(selectedCase)}
        caseData={selectedCase}
        onClose={() => setSelectedId(null)}
        onUpdate={handleUpdateCase}
        readOnly={isClient}
      />
    </div>
  )
}

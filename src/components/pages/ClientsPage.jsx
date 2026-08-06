import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { ClientFormModal } from '../clients/ClientFormModal'
import { ClientDetailsModal } from '../clients/ClientDetailsModal'
import { ClientCasesModal } from '../clients/ClientCasesModal'
import { useAuth } from '../../context/AuthContext'
import { getLawyerClients, getClientCases } from '../../data/lawyerDashboard'
import {
  initialClients,
  createClientFromForm,
} from '../../data/clients'
import { initialCases } from '../../data/cases'
import { isSamePerson } from '../../data/roles'

function statusClass(status) {
  if (status === 'نشط') return 'status-pill status-pill--active'
  if (status === 'موقوف') return 'status-pill status-pill--done'
  return 'status-pill status-pill--hold'
}

export default function ClientsPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const [clients, setClients] = useState(initialClients)
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [editingId, setEditingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [casesClientId, setCasesClientId] = useState(null)

  const scoped = useMemo(() => {
    if (!isLawyer) return clients
    return getLawyerClients(user?.name, clients)
  }, [clients, isLawyer, user?.name])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return scoped
    return scoped.filter((item) =>
      [item.name, item.email, item.phone, item.nationalId, item.status]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [scoped, query])

  const editingClient = clients.find((item) => item.id === editingId) || null
  const detailsClient = clients.find((item) => item.id === detailsId) || null
  const casesClient = clients.find((item) => item.id === casesClientId) || null

  const clientCases = useMemo(() => {
    if (!casesClient) return []
    return getClientCases(casesClient.name, initialCases)
  }, [casesClient])

  const detailsClientCases = useMemo(() => {
    if (!detailsClient) return []
    return getClientCases(detailsClient.name, initialCases)
  }, [detailsClient])

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
      setClients((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                nationalId: form.nationalId.trim(),
                address: form.address.trim(),
                status: form.status,
              }
            : item,
        ),
      )
      return
    }
    setClients((prev) => [createClientFromForm(form), ...prev])
  }

  const handleDelete = (id) => {
    setClients((prev) => prev.filter((item) => item.id !== id))
    if (detailsId === id) setDetailsId(null)
    if (editingId === id) setEditingId(null)
    if (casesClientId === id) setCasesClientId(null)
  }

  return (
    <div className="cases-page">
      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">الموكلون</h2>
        <div className="cases-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في الموكلين..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="بحث في الموكلين"
            />
          </div>
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            <Icon name="plus" size={18} />
            إضافة موكل
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>عدد القضايا</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table__empty">
                    لا يوجد موكلون مطابقون لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const casesCount = isLawyer
                    ? getClientCases(item.name, initialCases).filter((c) =>
                        isSamePerson(c.lawyer, user?.name),
                      ).length
                    : item.casesCount
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phone || '—'}</td>
                      <td>{casesCount}</td>
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
                            className="action-btn action-btn--notes"
                            title="قضايا الموكل"
                            onClick={() => setCasesClientId(item.id)}
                          >
                            <Icon name="cases" size={16} />
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
                          {!isLawyer && (
                            <button
                              type="button"
                              className="action-btn action-btn--delete"
                              title="حذف"
                              aria-label={`حذف ${item.name}`}
                              onClick={() => handleDelete(item.id)}
                            >
                              <Icon name="trash" size={16} />
                            </button>
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

      <ClientFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editingClient}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
      />

      <ClientDetailsModal
        open={Boolean(detailsClient)}
        client={detailsClient}
        cases={detailsClientCases}
        onClose={() => setDetailsId(null)}
        onOpenCases={() => {
          setCasesClientId(detailsClient?.id || null)
          setDetailsId(null)
        }}
      />

      <ClientCasesModal
        open={Boolean(casesClient)}
        client={casesClient}
        cases={clientCases}
        onClose={() => setCasesClientId(null)}
      />
    </div>
  )
}

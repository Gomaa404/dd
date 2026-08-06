import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { StatCard } from '../dashboard/StatCard'
import { UploadDocumentModal } from '../documents/UploadDocumentModal'
import { DocumentDetailsModal } from '../documents/DocumentDetailsModal'
import { DocumentNotesModal } from '../documents/DocumentNotesModal'
import { useAuth } from '../../context/AuthContext'
import { getLawyerDocuments, getLawyerCaseIds } from '../../data/lawyerDashboard'
import { getClientDocuments, getClientCaseIds } from '../../data/clientDashboard'
import {
  initialDocuments,
  documentTypeOptions,
  documentCaseOptions,
  createDocumentFromForm,
  formatFileSize,
  formatMimeLabel,
  calcDocumentsStats,
  downloadDocumentStub,
} from '../../data/documents'

export default function DocumentsPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const isClient = user?.roleId === 'client'
  const isAdmin = !isLawyer && !isClient
  const [documents, setDocuments] = useState(initialDocuments)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [caseFilter, setCaseFilter] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailsId, setDetailsId] = useState(null)
  const [notesId, setNotesId] = useState(null)

  const scoped = useMemo(() => {
    if (isLawyer) return getLawyerDocuments(user?.name, documents)
    if (isClient) return getClientDocuments(user?.name, documents)
    return documents
  }, [documents, isLawyer, isClient, user?.name])

  const roleCaseOptions = useMemo(() => {
    if (isLawyer) {
      const ids = getLawyerCaseIds(user?.name)
      return documentCaseOptions.filter((item) => ids.has(item.id))
    }
    if (isClient) {
      const ids = getClientCaseIds(user?.name)
      return documentCaseOptions.filter((item) => ids.has(item.id))
    }
    return documentCaseOptions
  }, [isLawyer, isClient, user?.name])

  const stats = useMemo(() => {
    const base = calcDocumentsStats(scoped)
    const images = scoped.filter((doc) =>
      String(doc.mimeType || '').startsWith('image/'),
    ).length
    return { ...base, images }
  }, [scoped])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((doc) => {
      if (typeFilter && doc.docType !== typeFilter) return false
      if (caseFilter === 'none' && doc.caseId) return false
      if (caseFilter && caseFilter !== 'none' && doc.caseId !== caseFilter) return false
      if (!q) return true
      return [doc.fileName, doc.description, doc.docType, doc.caseTitle, doc.mimeType]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [scoped, query, typeFilter, caseFilter])

  const detailsDoc = documents.find((item) => item.id === detailsId) || null
  const notesDoc = documents.find((item) => item.id === notesId) || null

  const handleUpload = (form) => {
    setDocuments((prev) => [
      createDocumentFromForm({
        ...form,
        uploadedBy: user?.name || form.uploadedBy,
      }),
      ...prev,
    ])
  }

  const handleDelete = (id) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id))
    if (detailsId === id) setDetailsId(null)
    if (notesId === id) setNotesId(null)
  }

  const handleSaveNotes = (id, notes) => {
    setDocuments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item)),
    )
  }

  const handleDownload = (doc) => {
    downloadDocumentStub(doc)
  }

  return (
    <div className="documents-page">
      <div className="stats-grid">
        <StatCard
          value={stats.total}
          label="إجمالي المستندات"
          tone="gold"
          icon="documents"
          index={0}
        />
        <StatCard
          value={stats.linked}
          label="مرتبطة بقضايا"
          tone="teal"
          icon="cases"
          index={1}
        />
        <StatCard
          value={isLawyer ? stats.images : stats.thisMonth}
          label={isLawyer ? 'عدد الصور' : 'هذا الشهر'}
          tone="muted"
          icon={isLawyer ? 'documents' : 'calendar'}
          index={2}
        />
        <StatCard
          value={stats.spaceUsed}
          label="المساحة المستخدمة"
          tone="success"
          icon="folder"
          index={3}
        />
      </div>

      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">المستندات</h2>
        <div className="cases-toolbar__actions documents-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في المستندات..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="بحث في المستندات"
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="تصفية حسب النوع"
          >
            <option value="">كل الأنواع</option>
            {documentTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            aria-label="تصفية حسب القضية"
          >
            <option value="">كل القضايا</option>
            <option value="none">بدون قضية</option>
            {roleCaseOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setUploadOpen(true)}
          >
            <Icon name="upload" size={18} />
            رفع مستند
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const lines = [
                'اسم الملف,الوصف,النوع,الحجم,القضية,تاريخ الرفع',
                ...filtered.map((doc) =>
                  [
                    doc.fileName,
                    doc.description,
                    doc.docType,
                    formatFileSize(doc.sizeBytes),
                    doc.caseTitle || '—',
                    doc.uploadedAt,
                  ].join(','),
                ),
              ].join('\n')
              const blob = new Blob(['\ufeff' + lines], {
                type: 'text/csv;charset=utf-8',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'documents.csv'
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
          >
            <Icon name="download" size={18} />
            تصدير
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم الملف</th>
                <th>الحجم</th>
                <th>النوع</th>
                <th>القضية</th>
                <th>تاريخ الرفع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table__empty">
                    لا توجد مستندات مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doc-file-cell">
                        <span className="doc-file-cell__name">{doc.fileName}</span>
                        <span className="doc-file-cell__desc">{doc.description}</span>
                      </div>
                    </td>
                    <td>{formatFileSize(doc.sizeBytes)}</td>
                    <td>
                      <span className="doc-mime">
                        {formatMimeLabel(doc.mimeType, doc.fileName)}
                      </span>
                    </td>
                    <td>{doc.caseTitle || '—'}</td>
                    <td>{doc.uploadedAt}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn action-btn--download"
                          title="تحميل"
                          aria-label={`تحميل ${doc.fileName}`}
                          onClick={() => handleDownload(doc)}
                        >
                          <Icon name="download" size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn--view-gold"
                          title="تفاصيل"
                          aria-label={`تفاصيل ${doc.fileName}`}
                          onClick={() => setDetailsId(doc.id)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        {!isClient && (
                          <button
                            type="button"
                            className="action-btn action-btn--notes"
                            title="ملاحظات"
                            aria-label={`ملاحظات ${doc.fileName}`}
                            onClick={() => setNotesId(doc.id)}
                          >
                            <Icon name="annotation" size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="action-btn action-btn--delete"
                            title="حذف"
                            aria-label={`حذف ${doc.fileName}`}
                            onClick={() => handleDelete(doc.id)}
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

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUpload}
        caseOptions={roleCaseOptions}
      />

      <DocumentDetailsModal
        open={Boolean(detailsDoc)}
        document={detailsDoc}
        onClose={() => setDetailsId(null)}
        onDownload={handleDownload}
        onDelete={isAdmin ? handleDelete : undefined}
        canDelete={isAdmin}
      />

      <DocumentNotesModal
        open={Boolean(notesDoc)}
        document={notesDoc}
        onClose={() => setNotesId(null)}
        onSave={handleSaveNotes}
      />
    </div>
  )
}

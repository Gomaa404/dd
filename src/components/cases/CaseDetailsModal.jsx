import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Icon } from '../ui/Icon'
import { AddEventModal } from './AddEventModal'
import { UploadDocumentModal } from './UploadDocumentModal'

const tabs = [
  { id: 'overview', label: 'نظرة عامة', icon: 'info' },
  { id: 'parties', label: 'الأطراف', icon: 'clients' },
  { id: 'events', label: 'الإجراءات القانونية', icon: 'clock' },
  { id: 'documents', label: 'المستندات', icon: 'documents' },
]

function statusClass(status) {
  if (status === 'منتهي') return 'status-pill status-pill--done'
  if (status === 'مؤجل') return 'status-pill status-pill--hold'
  return 'status-pill status-pill--active'
}

function priorityClass(priority) {
  if (priority === 'عاجل' || priority === 'مرتفع' || priority === 'عالي') {
    return 'status-pill status-pill--hold'
  }
  return 'status-pill status-pill--done'
}

function DetailCard({ icon, title, tone, children }) {
  return (
    <section className={`detail-card${tone ? ` detail-card--${tone}` : ''}`}>
      <header className="detail-card__header">
        <span className="detail-card__icon">
          <Icon name={icon} />
        </span>
        <h3>{title}</h3>
      </header>
      <div className="detail-card__body">{children}</div>
    </section>
  )
}

function MetaGrid({ items, cols = 2 }) {
  return (
    <div className={`meta-grid meta-grid--${cols}`}>
      {items.map((item) => (
        <div key={item.label} className="meta-item">
          <span className="meta-item__label">{item.label}</span>
          <span className={`meta-item__value${item.accent ? ' meta-item__value--accent' : ''}`}>
            {item.value || '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CaseDetailsModal({ open, caseData, onClose, onUpdate, readOnly = false }) {
  const [tab, setTab] = useState('overview')
  const [eventOpen, setEventOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)

  if (!caseData) return null

  const displayStatus =
    caseData.status === 'قيد' || caseData.status === 'نشطة' ? 'نشط' : caseData.status

  const handleAddEvent = (event) => {
    if (readOnly || !onUpdate) return
    onUpdate({
      ...caseData,
      events: [event, ...(caseData.events || [])],
    })
  }

  const handleAddDocument = (doc) => {
    if (readOnly || !onUpdate) return
    onUpdate({
      ...caseData,
      documents: [doc, ...(caseData.documents || [])],
    })
  }

  const header = (
    <div className="details-header">
      <h2 className="details-header__title">{caseData.title}</h2>
      <div className="details-header__meta">
        <span>رقم القضية: {caseData.number}</span>
        <span>النوع: {caseData.type}</span>
        <span className="details-header__status">
          الحالة: <span className={statusClass(caseData.status)}>{displayStatus}</span>
        </span>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        open={open}
        title={caseData.title}
        header={header}
        onClose={() => {
          setTab('overview')
          onClose()
        }}
        xwide
        className="modal-dialog--details"
      >
        <div className="details-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`details-tab${tab === item.id ? ' details-tab--active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="details-content" role="tabpanel">
          {tab === 'overview' && (
            <div className="details-stack">
              <DetailCard icon="cases" title="معلومات المحكمة">
                <MetaGrid
                  cols={2}
                  items={[
                    { label: 'المحكمة', value: caseData.courtName },
                    { label: 'الدائرة', value: caseData.circuit },
                    { label: 'القاضي', value: caseData.judgeName },
                    { label: 'رقم الدعوى', value: caseData.courtCaseNumber },
                  ]}
                />
              </DetailCard>

              <DetailCard icon="calendar" title="التواريخ المهمة">
                <MetaGrid
                  cols={3}
                  items={[
                    { label: 'تاريخ الواقعة', value: caseData.incidentDate },
                    { label: 'تاريخ التوكيل', value: caseData.powerOfAttorneyDate },
                    { label: 'أول جلسة', value: caseData.firstSession },
                    {
                      label: 'الجلسة القادمة',
                      value: caseData.nextSession,
                      accent: true,
                    },
                    { label: 'انتهاء التقادم', value: caseData.limitationExpiry },
                    { label: 'موعد الحكم', value: caseData.judgmentDeadline },
                  ]}
                />
              </DetailCard>

              <DetailCard icon="tag" title="التصنيف والأولوية">
                <MetaGrid
                  cols={2}
                  items={[
                    {
                      label: 'الأولوية',
                      value: (
                        <span className={priorityClass(caseData.priority)}>
                          {caseData.priority}
                        </span>
                      ),
                    },
                    { label: 'التصنيف', value: caseData.classification },
                    { label: 'المرحلة الحالية', value: caseData.stage },
                    { label: 'تاريخ البدء', value: caseData.startDate },
                  ]}
                />
              </DetailCard>

              <DetailCard icon="notes" title="الوصف والملاحظات">
                <p className="detail-text">
                  <strong>وصف القضية:</strong> {caseData.description}
                </p>
                {caseData.internalNotes ? (
                  <p className="detail-text">
                    <strong>ملاحظات داخلية:</strong> {caseData.internalNotes}
                  </p>
                ) : null}
              </DetailCard>
            </div>
          )}

          {tab === 'parties' && (
            <div className="details-stack">
              <DetailCard icon="person" title="الموكل">
                <MetaGrid
                  cols={2}
                  items={[
                    { label: 'الاسم', value: caseData.clientDetails?.name || caseData.client },
                    { label: 'رقم الهوية', value: caseData.clientDetails?.nationalId },
                    { label: 'الهاتف', value: caseData.clientDetails?.phone },
                    { label: 'العنوان', value: caseData.clientDetails?.address },
                  ]}
                />
              </DetailCard>

              <DetailCard icon="lawyers" title="المحامي المسؤول">
                <MetaGrid
                  cols={2}
                  items={[
                    { label: 'الاسم', value: caseData.lawyerDetails?.name || caseData.lawyer },
                    { label: 'الهاتف', value: caseData.lawyerDetails?.phone },
                    { label: 'البريد', value: caseData.lawyerDetails?.email },
                  ]}
                />
              </DetailCard>

              <DetailCard icon="opponent" title="الطرف الآخر — الخصم" tone="danger">
                <MetaGrid
                  cols={2}
                  items={[
                    { label: 'اسم الخصم', value: caseData.opponent },
                    { label: 'محامي الخصم', value: caseData.opponentLawyer },
                    { label: 'هاتف محامي الخصم', value: caseData.opponentLawyerPhone },
                  ]}
                />
              </DetailCard>
            </div>
          )}

          {tab === 'events' && (
            <div className="tab-panel">
              {!readOnly ? (
                <div className="tab-panel__toolbar">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setEventOpen(true)}
                  >
                    <Icon name="plus" size={18} />
                    إضافة إجراء
                  </button>
                </div>
              ) : null}
              {(caseData.events || []).length === 0 ? (
                <div className="empty-panel">
                  <Icon name="clock" className="empty-panel__icon" />
                  <p>لا توجد أحداث مسجلة</p>
                </div>
              ) : (
                <div className="timeline">
                  {caseData.events.map((event) => (
                    <article key={event.id} className="timeline-item">
                      <div className="timeline-item__icon">
                        <Icon name="clock" />
                      </div>
                      <div className="timeline-item__body">
                        <div className="timeline-item__top">
                          <h4>{event.title}</h4>
                          <span className={priorityClass(event.importance)}>
                            {event.importance}
                          </span>
                        </div>
                        <div className="timeline-item__meta">
                          <span>{event.type}</span>
                          <span>{event.date}</span>
                          {event.reminder ? <span>تذكير مفعّل</span> : null}
                        </div>
                        {event.details ? (
                          <p className="timeline-item__details">{event.details}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'documents' && (
            <div className="tab-panel">
              {!readOnly ? (
                <div className="tab-panel__toolbar">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setDocOpen(true)}
                  >
                    <Icon name="upload" size={18} />
                    رفع مستند
                  </button>
                </div>
              ) : null}
              {(caseData.documents || []).length === 0 ? (
                <div className="empty-panel">
                  <Icon name="documents" className="empty-panel__icon" />
                  <p>لا توجد مستندات مرفوعة</p>
                </div>
              ) : (
                <div className="docs-list">
                  {caseData.documents.map((doc) => (
                    <article key={doc.id} className="doc-item">
                      <div className="doc-item__icon">
                        <Icon name="folder" />
                      </div>
                      <div className="doc-item__body">
                        <h4>{doc.name}</h4>
                        <div className="doc-item__meta">
                          <span>{doc.type}</span>
                          <span>{doc.fileName}</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                        {doc.notes ? <p>{doc.notes}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <AddEventModal
        open={eventOpen}
        onClose={() => setEventOpen(false)}
        onSave={handleAddEvent}
      />
      <UploadDocumentModal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        onSave={handleAddDocument}
        caseLabel={`${caseData.number} — ${caseData.title}`}
      />
    </>
  )
}

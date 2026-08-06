import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { StatCard } from '../dashboard/StatCard'
import { SessionFormModal } from '../sessions/SessionFormModal'
import { SessionDetailsModal } from '../sessions/SessionDetailsModal'
import { PostponeSessionModal } from '../sessions/PostponeSessionModal'
import { useAuth } from '../../context/AuthContext'
import { isSamePerson } from '../../data/roles'
import { getLawyerSessions } from '../../data/lawyerDashboard'
import { getClientSessions, getClientCases } from '../../data/clientDashboard'
import {
  initialSessions,
  sessionTypeOptions,
  sessionStatusOptions,
  sessionCaseOptions,
  sessionLawyerOptions,
  createSessionFromForm,
  formatSessionDate,
  calcSessionStats,
} from '../../data/sessions'

const WEEKDAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

function statusClass(status) {
  if (status === 'مجدولة') return 'session-status session-status--scheduled'
  if (status === 'مؤجلة') return 'session-status session-status--postponed'
  if (status === 'منتهية') return 'session-status session-status--done'
  return 'session-status session-status--cancelled'
}

function typeIcon(type) {
  if (type === 'مرافعة') return 'annotation'
  return 'person'
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function buildCalendarDays(monthDate) {
  const first = startOfMonth(monthDate)
  const year = first.getFullYear()
  const month = first.getMonth()
  // Saturday-first calendar: JS getDay() Sun=0 ... Sat=6 → shift
  const startOffset = (first.getDay() + 1) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function SessionsPage() {
  const { user } = useAuth()
  const isLawyer = user?.roleId === 'lawyer'
  const isClient = user?.roleId === 'client'
  const isAdmin = !isLawyer && !isClient
  const [sessions, setSessions] = useState(initialSessions)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [caseFilter, setCaseFilter] = useState('')
  const [lawyerFilter, setLawyerFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [postponeId, setPostponeId] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())

  const caseOptionsForFilter = useMemo(() => {
    if (isClient) {
      return getClientCases(user?.name).map(({ id, title, number }) => ({
        id,
        title,
        number,
      }))
    }
    if (isLawyer) {
      const ids = new Set(
        getLawyerSessions(user?.name, sessions).map((item) => item.caseId),
      )
      return sessionCaseOptions.filter((item) => ids.has(item.id))
    }
    return sessionCaseOptions
  }, [isClient, isLawyer, user?.name, sessions])

  const scopedSessions = useMemo(() => {
    if (isLawyer) return getLawyerSessions(user?.name, sessions)
    if (isClient) return getClientSessions(user?.name, sessions)
    return sessions
  }, [sessions, isLawyer, isClient, user?.name])

  const stats = useMemo(() => calcSessionStats(scopedSessions), [scopedSessions])
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekEndKey = weekEnd.toISOString().slice(0, 10)

    return scopedSessions.filter((item) => {
      if (quickFilter === 'today' && item.date !== todayKey) return false
      if (quickFilter === 'week' && (item.date < todayKey || item.date > weekEndKey)) {
        return false
      }
      if (quickFilter === 'postponed' && item.status !== 'مؤجلة') return false
      if (quickFilter === 'upcoming' && !(item.date > todayKey && item.status === 'مجدولة')) {
        return false
      }
      if (typeFilter && item.type !== typeFilter) return false
      if (statusFilter && item.status !== statusFilter) return false
      if (caseFilter && item.caseId !== caseFilter) return false
      if (isAdmin) {
        if (lawyerFilter && item.lawyerId !== lawyerFilter) return false
      }
      if (dateFrom && item.date < dateFrom) return false
      if (dateTo && item.date > dateTo) return false
      if (!q) return true
      return [
        item.sessionNumber,
        item.caseTitle,
        item.caseNumber,
        item.court,
        item.judge,
        item.type,
        item.status,
        item.decision,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [
    scopedSessions,
    query,
    typeFilter,
    statusFilter,
    caseFilter,
    lawyerFilter,
    dateFrom,
    dateTo,
    quickFilter,
    todayKey,
    isAdmin,
  ])

  const editingSession = sessions.find((item) => item.id === editingId) || null
  const detailsSession = sessions.find((item) => item.id === detailsId) || null
  const postponeSession = sessions.find((item) => item.id === postponeId) || null

  const sessionsByDay = useMemo(() => {
    const map = {}
    scopedSessions.forEach((item) => {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    })
    return map
  }, [scopedSessions])

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  )

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(
        calendarMonth,
      ),
    [calendarMonth],
  )

  const openAdd = () => {
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (id) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleSave = (form) => {
    const linkedCase =
      caseOptionsForFilter.find((item) => item.id === form.caseId) ||
      sessionCaseOptions.find((item) => item.id === form.caseId)

    let lawyerOption = isLawyer
      ? sessionLawyerOptions.find((item) => isSamePerson(item.name, user?.name)) || {
          id: '',
          name: user?.name || '',
        }
      : sessionLawyerOptions.find((item) => item.id === form.lawyerId)

    if (isClient && !lawyerOption) {
      const caseRow = getClientCases(user?.name).find((item) => item.id === form.caseId)
      lawyerOption = sessionLawyerOptions.find((item) =>
        isSamePerson(item.name, caseRow?.lawyer),
      ) || {
        id: '',
        name: caseRow?.lawyer || '',
      }
    }

    const payload = {
      ...form,
      lawyerId: lawyerOption?.id || form.lawyerId || '',
    }

    if (editingId) {
      setSessions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                sessionNumber: form.sessionNumber || item.sessionNumber,
                caseId: linkedCase?.id || '',
                caseTitle: linkedCase?.title || '',
                caseNumber: linkedCase?.number || '',
                court: form.court.trim(),
                circuit: form.circuit.trim(),
                judge: form.judge.trim(),
                hall: form.hall.trim(),
                courtAddress: form.courtAddress.trim(),
                date: form.date,
                time: form.time,
                type: form.type,
                decision: form.decision,
                status: form.status,
                importance: form.importance,
                notes: form.notes.trim(),
                lawyerId: lawyerOption?.id || item.lawyerId,
                lawyerName: lawyerOption?.name || user?.name || item.lawyerName,
              }
            : item,
        ),
      )
      return
    }

    const created = createSessionFromForm(payload, sessions)
    setSessions((prev) => [
      {
        ...created,
        lawyerId: lawyerOption?.id || created.lawyerId,
        lawyerName: lawyerOption?.name || user?.name || created.lawyerName,
      },
      ...prev,
    ])
  }

  const handlePostpone = (id, { date, reason }) => {
    setSessions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              date,
              status: 'مؤجلة',
              decision: 'تأجيل',
              postponeReason: reason,
            }
          : item,
      ),
    )
  }

  const handleDelete = (id) => {
    setSessions((prev) => prev.filter((item) => item.id !== id))
    if (detailsId === id) setDetailsId(null)
    if (editingId === id) setEditingId(null)
    if (postponeId === id) setPostponeId(null)
  }

  const clearFilters = () => {
    setQuery('')
    setTypeFilter('')
    setStatusFilter('')
    setCaseFilter('')
    setLawyerFilter('')
    setDateFrom('')
    setDateTo('')
    setQuickFilter('all')
  }

  return (
    <div className="sessions-page">
      <div className="stats-grid">
        <StatCard value={stats.total} label="إجمالي الجلسات" tone="gold" icon="sessions" index={0} />
        <StatCard value={stats.upcoming} label="الجلسات القادمة" tone="teal" icon="calendar" index={1} />
        <StatCard value={stats.today} label="جلسات اليوم" tone="muted" icon="clock" index={2} />
        <StatCard value={stats.postponed} label="جلسات مؤجلة" tone="success" icon="refresh" index={3} />
      </div>

      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">الجلسات</h2>
        <div className="cases-toolbar__actions">
          <div className="search-field">
            <Icon name="search" className="search-field__icon" />
            <input
              className="search-field__input"
              type="search"
              placeholder="بحث في الجلسات..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            <Icon name="plus" size={18} />
            إضافة جلسة
          </button>
        </div>
      </div>

      <div className="session-quick-filters">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'today', label: 'اليوم' },
          { id: 'week', label: 'هذا الأسبوع' },
          { id: 'upcoming', label: 'القادمة' },
          { id: 'postponed', label: 'مؤجلة' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={`session-chip${quickFilter === item.id ? ' is-active' : ''}`}
            onClick={() => setQuickFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="sessions-filters">
        <div className={`sessions-filters__grid${isLawyer || isClient ? ' sessions-filters__grid--lawyer' : ''}`}>
          {isAdmin && (
            <label>
              <span>المحامي</span>
              <select className="input" value={lawyerFilter} onChange={(e) => setLawyerFilter(e.target.value)}>
                <option value="">كل المحامين</option>
                {sessionLawyerOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>القضية</span>
            <select className="input" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
              <option value="">كل القضايا</option>
              {caseOptionsForFilter.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>من تاريخ</span>
            <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label>
            <span>إلى تاريخ</span>
            <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label>
            <span>النوع</span>
            <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">كل الأنواع</option>
              {sessionTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label>
            <span>الحالة</span>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              {sessionStatusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn btn--ghost" onClick={clearFilters}>
          مسح الفلاتر
        </button>
      </section>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table sessions-table">
            <thead>
              <tr>
                <th>رقم الجلسة</th>
                <th>القضية</th>
                <th>المحكمة</th>
                <th>القاضي</th>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>نوع الجلسة</th>
                <th>القرار</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="data-table__empty">
                    لا توجد جلسات مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.sessionNumber}</td>
                    <td>
                      <div className="session-case-cell">
                        <strong>{item.caseTitle}</strong>
                        <small>{item.caseNumber}</small>
                      </div>
                    </td>
                    <td>{item.court}</td>
                    <td>{item.judge || '—'}</td>
                    <td>{formatSessionDate(item.date)}</td>
                    <td>{item.time || '—'}</td>
                    <td>
                      <span className="session-type">
                        <Icon name={typeIcon(item.type)} size={14} />
                        {item.type}
                      </span>
                    </td>
                    <td>{item.decision || '—'}</td>
                    <td>
                      <span className={statusClass(item.status)}>{item.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-btn action-btn--view"
                          title="التفاصيل"
                          onClick={() => setDetailsId(item.id)}
                        >
                          <Icon name="eye" size={16} />
                        </button>
                        {!isClient && (
                          <>
                            <button
                              type="button"
                              className="action-btn action-btn--edit"
                              title="تعديل"
                              onClick={() => openEdit(item.id)}
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-btn action-btn--postpone"
                              title="تأجيل الجلسة"
                              aria-label={`تأجيل جلسة ${item.sessionNumber}`}
                              onClick={() => setPostponeId(item.id)}
                            >
                              <Icon name="refresh" size={16} />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="action-btn action-btn--delete"
                            title="حذف"
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

      <section className="sessions-calendar">
        <header className="sessions-calendar__head">
          <h3>التقويم الشهري للجلسات</h3>
          <div className="sessions-calendar__nav">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                setCalendarMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
            >
              السابق
            </button>
            <strong>{monthLabel}</strong>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                setCalendarMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
            >
              التالي
            </button>
          </div>
        </header>
        <div className="sessions-calendar__weekdays">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="sessions-calendar__grid">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="sessions-calendar__cell is-empty" />
            const key = toKey(day)
            const daySessions = sessionsByDay[key] || []
            const isToday = key === todayKey
            return (
              <div
                key={key}
                className={`sessions-calendar__cell${isToday ? ' is-today' : ''}${daySessions.length ? ' has-sessions' : ''}`}
              >
                <span className="sessions-calendar__day">{day.getDate()}</span>
                {daySessions.slice(0, 2).map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className="sessions-calendar__chip"
                    onClick={() => setDetailsId(session.id)}
                  >
                    #{session.sessionNumber} {session.caseTitle}
                  </button>
                ))}
                {daySessions.length > 2 ? (
                  <span className="sessions-calendar__more">+{daySessions.length - 2}</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      <SessionFormModal
        open={formOpen}
        session={editingSession}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
        caseOptions={caseOptionsForFilter}
        hideLawyer={isLawyer || isClient}
      />
      <SessionDetailsModal
        open={Boolean(detailsSession)}
        session={detailsSession}
        onClose={() => setDetailsId(null)}
      />
      <PostponeSessionModal
        open={Boolean(postponeSession)}
        session={postponeSession}
        onClose={() => setPostponeId(null)}
        onPostpone={handlePostpone}
      />
    </div>
  )
}

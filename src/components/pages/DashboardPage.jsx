import { useMemo } from 'react'
import { HiOutlineExclamationCircle, HiOutlineRefresh } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../dashboard/StatCard'
import { CaseUpdatesPanel } from '../dashboard/CaseUpdatesPanel'
import { AppointmentsPanel } from '../dashboard/AppointmentsPanel'
import { ActivityPanel } from '../dashboard/ActivityPanel'
import { fetchDashboard, parseApiError } from '../../api/dashboard'
import { caseStatusLabel } from '../../api/cases'
import { toDateInputValue, toTimeInputValue, prettifyEmbeddedDates, activityIconFor, formatRelativeTime, formatDisplayDate, stripRedundantActivityLead } from '../../utils/formatDisplay'
import { dashboardKeys } from '../../hooks/queryKeys'
import { useClients } from '../../hooks/useClients'
import { useCases } from '../../hooks/useCases'
import { useAppointments } from '../../hooks/useAppointments'

function isActiveCase(item) {
  return item?.status === 'active' || item?.status === 'نشطة'
}

function isToday(dateValue) {
  const iso = toDateInputValue(dateValue)
  if (!iso) return false
  return iso === toDateInputValue(new Date().toISOString())
}

/**
 * Admin dashboard — KPIs from live entity lists; panels from GET /api/dashboard.
 */
export default function DashboardPage() {
  const {
    data,
    isLoading: dashLoading,
    error: dashError,
    refetch: refetchDash,
    isFetching: dashFetching,
  } = useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboard,
  })

  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
    isFetching: clientsFetching,
  } = useClients()

  const {
    cases,
    isLoading: casesLoading,
    error: casesError,
    refetch: refetchCases,
    isFetching: casesFetching,
  } = useCases()

  const {
    appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments,
    isFetching: appointmentsFetching,
  } = useAppointments()

  const dashStats = data?.statistics ?? {}
  const upcoming = data?.upcoming_appointments ?? []
  const activities = data?.latest_activities ?? []

  // Match Clients page total (not the stale dashboard.statistics.clients)
  const clientsCount = clients.length

  const activeCasesCount = useMemo(
    () => cases.filter(isActiveCase).length,
    [cases],
  )

  const todayAppointmentsCount = useMemo(
    () => appointments.filter((a) => isToday(a.date)).length,
    [appointments],
  )

  const successRate = dashStats.success_rate ?? 0

  const isLoading = dashLoading || clientsLoading || casesLoading || appointmentsLoading
  const isFetching = dashFetching || clientsFetching || casesFetching || appointmentsFetching
  const error = clientsError || casesError || appointmentsError || (dashError && !data)

  const refetchAll = () => {
    refetchDash()
    refetchClients()
    refetchCases()
    refetchAppointments()
  }

  const statCards = [
    {
      id: 'clients',
      label: 'الموكلون الحاليون',
      value: String(clientsCount),
      tone: 'gold',
      icon: 'clients',
    },
    {
      id: 'cases',
      label: 'القضايا النشطة',
      value: String(activeCasesCount),
      tone: 'teal',
      icon: 'cases',
    },
    {
      id: 'appointments',
      label: 'مواعيد اليوم',
      value: String(todayAppointmentsCount),
      tone: 'muted',
      icon: 'appointments',
    },
    {
      id: 'success',
      label: 'نسبة النجاح',
      value: `${successRate}%`,
      tone: 'success',
      icon: 'invoices',
    },
  ]

  const caseUpdates = useMemo(
    () =>
      [...cases]
        .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          title: c.title ?? '—',
          sessionDate: c.created_at
            ? new Date(c.created_at).toLocaleDateString('ar-EG')
            : c.nextSession || '—',
          status: caseStatusLabel(c.status),
        })),
    [cases],
  )

  const upcomingAppointments = upcoming.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.title ?? a.appointment_type ?? a.notes ?? 'موعد',
    date: toDateInputValue(a.appointment_date ?? a.date),
    time: toTimeInputValue(a.appointment_time ?? a.time),
    client: a.client?.full_name ?? a.client_name ?? '—',
  }))

  const activityItems = activities.map((item) => {
    const title = prettifyEmbeddedDates(item.title ?? '')
    const rawDescription = prettifyEmbeddedDates(item.description ?? '')
    const description = stripRedundantActivityLead(title, rawDescription)
    const when = item.created_at || item.createdAt || item.date || item.timestamp
    const timeLabel = when
      ? formatRelativeTime(when) !== '—'
        ? formatRelativeTime(when)
        : formatDisplayDate(when)
      : ''
    const blob = `${item.type ?? ''} ${item.title ?? ''}`
    return {
      id: item.id,
      title: title || 'نشاط',
      description,
      icon: activityIconFor(item),
      tone: /موعد|appointment/.test(blob)
        ? 'gold'
        : /جلسة|session/.test(blob)
          ? 'teal'
          : 'muted',
      timeLabel,
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#6b7f80]">
        <HiOutlineRefresh size={32} className="animate-spin text-gold" aria-hidden />
        <p className="text-sm font-medium">جاري تحميل لوحة التحكم...</p>
      </div>
    )
  }

  if (error && !data && clients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <HiOutlineExclamationCircle size={28} className="text-rose-600" aria-hidden />
        <p className="font-display text-base font-bold text-brand">تعذر تحميل البيانات</p>
        <p className="text-sm text-[#6b7f80]">
          {typeof error === 'string' ? error : parseApiError(error).message}
        </p>
        <button type="button" className="btn btn--primary" onClick={refetchAll}>
          <HiOutlineRefresh size={18} aria-hidden />
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          className="btn btn--ghost inline-flex items-center gap-2"
          onClick={refetchAll}
          disabled={isFetching}
        >
          <HiOutlineRefresh size={18} className={isFetching ? 'animate-spin' : undefined} />
          تحديث
        </button>
      </div>

      <section className="stats-grid" aria-label="مؤشرات سريعة">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.id}
            value={stat.value}
            label={stat.label}
            tone={stat.tone}
            icon={stat.icon}
            index={index}
          />
        ))}
      </section>

      <section className="widgets-row" aria-label="تحديثات ومواعيد">
        <CaseUpdatesPanel cases={caseUpdates} />
        <AppointmentsPanel appointments={upcomingAppointments} />
      </section>

      <ActivityPanel activities={activityItems} />
    </div>
  )
}

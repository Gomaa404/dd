import { useMemo } from 'react'
import { StatCard } from '../dashboard/StatCard'
import { CaseUpdatesPanel } from '../dashboard/CaseUpdatesPanel'
import { AppointmentsPanel } from '../dashboard/AppointmentsPanel'
import { ActivityPanel } from '../dashboard/ActivityPanel'
import { useAuth } from '../../context/AuthContext'
import {
  stats,
  caseUpdates,
  upcomingAppointments,
  activities,
} from '../../data/dashboard'
import {
  buildLawyerStats,
  buildLawyerCaseUpdates,
  buildLawyerAppointments,
  buildLawyerActivities,
} from '../../data/lawyerDashboard'
import {
  buildClientStats,
  buildClientCaseUpdates,
  buildClientAppointments,
  buildClientActivities,
} from '../../data/clientDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  const roleId = user?.roleId
  const personName = user?.name
  const isScoped = roleId === 'lawyer' || roleId === 'client'

  const view = useMemo(() => {
    if (roleId === 'lawyer') {
      return {
        cards: buildLawyerStats(personName),
        cases: buildLawyerCaseUpdates(personName),
        appointments: buildLawyerAppointments(personName),
        activity: buildLawyerActivities(personName),
      }
    }
    if (roleId === 'client') {
      return {
        cards: buildClientStats(personName),
        cases: buildClientCaseUpdates(personName),
        appointments: buildClientAppointments(personName),
        activity: buildClientActivities(personName),
      }
    }
    return {
      cards: stats,
      cases: caseUpdates,
      appointments: upcomingAppointments,
      activity: activities,
    }
  }, [roleId, personName])

  return (
    <div>
      <section
        className={`stats-grid${isScoped ? ' stats-grid--wrap' : ''}`}
        aria-label="مؤشرات سريعة"
      >
        {view.cards.map((stat, index) => (
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
        <CaseUpdatesPanel cases={view.cases} />
        <AppointmentsPanel appointments={view.appointments} />
      </section>

      <ActivityPanel activities={view.activity} />
    </div>
  )
}

import { initialCases } from './cases'
import { initialSessions } from './sessions'
import { initialAppointments } from './appointments'
import { initialDocuments } from './documents'
import { initialClients } from './clients'
import { initialInvoices } from './invoices'
import { isSamePerson } from './roles'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function weekAheadKey() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

export function getLawyerCases(lawyerName, cases = initialCases) {
  return cases.filter((item) => isSamePerson(item.lawyer, lawyerName))
}

export function getLawyerCaseIds(lawyerName, cases = initialCases) {
  return new Set(getLawyerCases(lawyerName, cases).map((item) => item.id))
}

export function getLawyerClientNames(lawyerName, cases = initialCases) {
  return new Set(
    getLawyerCases(lawyerName, cases)
      .map((item) => item.client)
      .filter(Boolean),
  )
}

export function getLawyerSessions(lawyerName, sessions = initialSessions) {
  return sessions.filter((item) => isSamePerson(item.lawyerName, lawyerName))
}

export function getLawyerAppointments(
  lawyerName,
  appointments = initialAppointments,
) {
  return appointments.filter((item) => isSamePerson(item.lawyerName, lawyerName))
}

export function getLawyerDocuments(
  lawyerName,
  documents = initialDocuments,
  cases = initialCases,
) {
  const caseIds = getLawyerCaseIds(lawyerName, cases)
  return documents.filter((doc) => doc.caseId && caseIds.has(doc.caseId))
}

export function getLawyerClients(
  lawyerName,
  clients = initialClients,
  cases = initialCases,
) {
  const names = getLawyerClientNames(lawyerName, cases)
  return clients.filter((client) =>
    [...names].some((name) => isSamePerson(name, client.name)),
  )
}

export function getLawyerInvoices(
  lawyerName,
  invoices = initialInvoices,
  cases = initialCases,
) {
  const names = getLawyerClientNames(lawyerName, cases)
  const caseIds = getLawyerCaseIds(lawyerName, cases)
  return invoices.filter(
    (inv) =>
      (inv.caseId && caseIds.has(inv.caseId)) ||
      [...names].some((name) => isSamePerson(name, inv.clientName)),
  )
}

export function getClientCases(clientName, cases = initialCases) {
  return cases.filter((item) => isSamePerson(item.client, clientName))
}

export function buildLawyerStats(lawyerName) {
  const cases = getLawyerCases(lawyerName)
  const sessions = getLawyerSessions(lawyerName)
  const appointments = getLawyerAppointments(lawyerName)

  const today = todayKey()
  const weekAhead = weekAheadKey()

  const activeCases = cases.filter((item) => item.status !== 'منتهي')
  const closedCases = cases.filter((item) => item.status === 'منتهي')
  const clients = new Set(cases.map((item) => item.client).filter(Boolean))

  const successRate =
    cases.length > 0 ? Math.round((closedCases.length / cases.length) * 100) : 0

  return [
    { id: 'clients', label: 'عملاء', value: String(clients.size), tone: 'gold', icon: 'clients' },
    { id: 'active', label: 'قضايا نشطة', value: String(activeCases.length), tone: 'teal', icon: 'cases' },
    {
      id: 'today-appointments',
      label: 'مواعيد اليوم',
      value: String(appointments.filter((item) => item.date === today).length),
      tone: 'muted',
      icon: 'calendar',
    },
    { id: 'success', label: 'نسبة النجاح', value: `${successRate}%`, tone: 'success', icon: 'check' },
    { id: 'total', label: 'إجمالي القضايا', value: String(cases.length), tone: 'gold', icon: 'folder' },
    { id: 'closed', label: 'قضايا منتهية', value: String(closedCases.length), tone: 'teal', icon: 'check' },
    {
      id: 'week-appointments',
      label: 'مواعيد الأسبوع',
      value: String(
        appointments.filter((item) => item.date >= today && item.date <= weekAhead)
          .length,
      ),
      tone: 'muted',
      icon: 'appointments',
    },
    {
      id: 'upcoming-sessions',
      label: 'جلسات قادمة',
      value: String(
        sessions.filter((item) => item.date >= today && item.status !== 'منتهية')
          .length,
      ),
      tone: 'success',
      icon: 'sessions',
    },
  ]
}

export function buildLawyerCaseUpdates(lawyerName) {
  return getLawyerCases(lawyerName).map((item) => ({
    id: item.id,
    title: item.title,
    sessionDate: item.nextSession || '—',
    status: item.status === 'منتهي' ? 'منتهي' : 'نشط',
  }))
}

export function buildLawyerAppointments(lawyerName) {
  const today = todayKey()
  return getLawyerAppointments(lawyerName)
    .filter((item) => item.date >= today)
    .map((item) => ({
      id: item.id,
      title: item.type,
      client: item.clientName,
      date: item.date,
      time: item.time,
    }))
}

export function buildLawyerActivities(lawyerName) {
  const appointments = getLawyerAppointments(lawyerName)
  const sessions = getLawyerSessions(lawyerName)

  return [
    ...appointments.map((item) => ({
      id: `appointment-${item.id}`,
      text: `موعد ${item.type} مع ${item.clientName} في ${item.date}`,
      type: 'appointment',
    })),
    ...sessions.map((item) => ({
      id: `session-${item.id}`,
      text: `جلسة ${item.type} في قضية ${item.caseTitle} بتاريخ ${item.date}`,
      type: 'session',
    })),
  ].slice(0, 6)
}

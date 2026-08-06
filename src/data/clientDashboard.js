import { initialCases } from './cases'
import { initialSessions } from './sessions'
import { initialAppointments } from './appointments'
import { initialDocuments } from './documents'
import { initialInvoices } from './invoices'
import { isSamePerson } from './roles'
import { remaining, formatMoney } from './invoices'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function weekAheadKey() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

export function getClientCases(clientName, cases = initialCases) {
  return cases.filter((item) => isSamePerson(item.client, clientName))
}

export function getClientCaseIds(clientName, cases = initialCases) {
  return new Set(getClientCases(clientName, cases).map((item) => item.id))
}

export function getClientSessions(clientName, sessions = initialSessions, cases = initialCases) {
  const caseIds = getClientCaseIds(clientName, cases)
  return sessions.filter((item) => item.caseId && caseIds.has(item.caseId))
}

export function getClientAppointments(
  clientName,
  appointments = initialAppointments,
) {
  return appointments.filter((item) => isSamePerson(item.clientName, clientName))
}

export function getClientDocuments(
  clientName,
  documents = initialDocuments,
  cases = initialCases,
) {
  const caseIds = getClientCaseIds(clientName, cases)
  return documents.filter((doc) => doc.caseId && caseIds.has(doc.caseId))
}

export function getClientInvoices(clientName, invoices = initialInvoices) {
  return invoices.filter((inv) => isSamePerson(inv.clientName, clientName))
}

export function buildClientStats(clientName) {
  const cases = getClientCases(clientName)
  const sessions = getClientSessions(clientName)
  const appointments = getClientAppointments(clientName)
  const invoices = getClientInvoices(clientName)

  const today = todayKey()
  const weekAhead = weekAheadKey()
  const activeCases = cases.filter((item) => item.status !== 'منتهي')
  const closedCases = cases.filter((item) => item.status === 'منتهي')
  const balance = invoices.reduce((sum, inv) => sum + remaining(inv), 0)

  return [
    { id: 'cases', label: 'قضايا', value: String(activeCases.length), tone: 'gold', icon: 'cases' },
    {
      id: 'appointments',
      label: 'مواعيدي',
      value: String(appointments.length),
      tone: 'teal',
      icon: 'calendar',
    },
    {
      id: 'today',
      label: 'مواعيد اليوم',
      value: String(appointments.filter((item) => item.date === today).length),
      tone: 'muted',
      icon: 'clock',
    },
    {
      id: 'balance',
      label: 'الرصيد',
      value: formatMoney(balance),
      tone: 'success',
      icon: 'invoices',
    },
    {
      id: 'total',
      label: 'إجمالي القضايا',
      value: String(cases.length),
      tone: 'gold',
      icon: 'folder',
    },
    {
      id: 'closed',
      label: 'قضايا منتهية',
      value: String(closedCases.length),
      tone: 'teal',
      icon: 'check',
    },
    {
      id: 'week',
      label: 'مواعيد الأسبوع',
      value: String(
        appointments.filter((item) => item.date >= today && item.date <= weekAhead)
          .length,
      ),
      tone: 'muted',
      icon: 'appointments',
    },
    {
      id: 'sessions',
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

export function buildClientCaseUpdates(clientName) {
  return getClientCases(clientName).map((item) => ({
    id: item.id,
    title: item.title,
    sessionDate: item.nextSession || '—',
    status: item.status === 'منتهي' ? 'منتهي' : 'نشط',
  }))
}

export function buildClientAppointments(clientName) {
  const today = todayKey()
  return getClientAppointments(clientName)
    .filter((item) => item.date >= today)
    .map((item) => ({
      id: item.id,
      title: item.type,
      client: item.lawyerName || 'بانتظار التعيين',
      date: item.date,
      time: item.time,
    }))
}

export function buildClientActivities(clientName) {
  return getClientAppointments(clientName)
    .map((item) => ({
      id: `appointment-${item.id}`,
      text: `موعد ${item.type} في ${item.date}`,
      type: 'appointment',
    }))
    .slice(0, 6)
}

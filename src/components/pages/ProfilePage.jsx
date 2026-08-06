import { useNavigate } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useAuth } from '../../context/AuthContext'
import { currentUser as fallbackUser } from '../../data/dashboard'
import { getClientInvoices } from '../../data/clientDashboard'
import { remaining, formatMoney } from '../../data/invoices'

function display(value) {
  if (value === 0) return '0'
  return value || '—'
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const balance =
    user?.roleId === 'client'
      ? getClientInvoices(user?.name).reduce((sum, inv) => sum + remaining(inv), 0)
      : fallbackUser.balance

  const profile = {
    ...fallbackUser,
    ...user,
    type: user?.role || fallbackUser.type,
    status: user?.status || 'نشط',
    phone: user?.phone || fallbackUser.phone,
    address: user?.address || '',
    nationalId: user?.nationalId || '',
    balance,
  }

  const rows = [
    { label: 'الاسم', value: profile.name },
    { label: 'البريد الإلكتروني', value: profile.email },
    { label: 'الهاتف', value: profile.phone },
    { label: 'العنوان', value: profile.address },
    { label: 'رقم الهوية', value: profile.nationalId },
    { label: 'النوع', value: profile.type },
    { label: 'الحالة', value: profile.status },
    {
      label: 'الرصيد',
      value:
        typeof profile.balance === 'number'
          ? formatMoney(profile.balance)
          : `${display(profile.balance)} ج.م`,
    },
  ]

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero__avatar" aria-hidden>
          {profile.initials}
        </div>
        <div>
          <h2 className="profile-hero__name">{profile.name}</h2>
          <p className="profile-hero__role">{profile.role}</p>
        </div>
        <span className="status-pill status-pill--active">{profile.status}</span>
        <button
          type="button"
          className="btn btn--ghost profile-logout"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      <section className="profile-card">
        <header className="profile-card__head">
          <Icon name="person" size={20} />
          <h3>الملف الشخصي</h3>
        </header>
        <dl className="profile-list">
          {rows.map((row) => (
            <div key={row.label} className="profile-list__row">
              <dt>{row.label}</dt>
              <dd>{display(row.value)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import { initialNotifications } from '../../data/notifications'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const removeOne = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }

  return (
    <div className="notifications-page">
      <div className="cases-toolbar">
        <h2 className="cases-toolbar__title">
          <Icon name="bell" size={22} />
          الإشعارات
          {unreadCount > 0 ? (
            <span className="notifications-count">{unreadCount} غير مقروء</span>
          ) : null}
        </h2>
        <button
          type="button"
          className="btn btn--primary"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <Icon name="check" size={18} />
          قراءة الكل
        </button>
      </div>

      <section className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Icon name="bell" size={36} />
            <p>لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          notifications.map((item) => (
            <article
              key={item.id}
              className={`notification-item${item.read ? '' : ' is-unread'}`}
              onClick={() => markRead(item.id)}
            >
              <span className="notification-item__icon" aria-hidden>
                <Icon name="bell" size={18} />
              </span>
              <div className="notification-item__body">
                <h3>
                  {item.title}
                  {item.type === 'payment' || item.type === 'invoice' ? (
                    <Icon name="invoices" size={15} className="notification-item__badge" />
                  ) : null}
                </h3>
                <p>{item.message}</p>
                <span className="notification-item__time">
                  <Icon name="clock" size={14} />
                  {item.timeAgo}
                </span>
              </div>
              <button
                type="button"
                className="notification-item__delete"
                title="حذف الإشعار"
                aria-label={`حذف ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  removeOne(item.id)
                }}
              >
                <Icon name="trash" size={18} />
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

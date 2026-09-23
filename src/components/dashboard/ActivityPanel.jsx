import { Icon } from '../ui/Icon'

export function ActivityPanel({ activities = [] }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">
          <span className="panel__title-icon">
            <Icon name="clock" />
          </span>
          آخر الأنشطة
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden>
            <Icon name="clock" size={36} />
          </span>
          <p>لا توجد أنشطة حديثة</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((item) => (
            <article key={item.id} className="activity-item">
              <div className={`activity-item__icon activity-item__icon--${item.tone || 'teal'}`}>
                <Icon name={item.icon || 'bell'} size={18} />
              </div>
              <div className="activity-item__body">
                {item.title ? <h3 className="activity-item__title">{item.title}</h3> : null}
                {item.description ? (
                  <p className="activity-item__text">{item.description}</p>
                ) : item.text ? (
                  <p className="activity-item__text">{item.text}</p>
                ) : null}
                {item.timeLabel ? (
                  <span className="activity-item__meta">
                    <Icon name="clock" size={13} />
                    {item.timeLabel}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

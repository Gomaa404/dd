import { Icon } from '../ui/Icon'

export function ActivityPanel({ activities }) {
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
      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <div className="activity-item__icon">
              <Icon name="folder" />
            </div>
            <div className="activity-item__text">{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

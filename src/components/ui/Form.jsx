export function FormSection({ icon, title, children }) {
  return (
    <section className="form-section">
      <header className="form-section__header">
        {icon ? <span className="form-section__icon">{icon}</span> : null}
        <h3 className="form-section__title">{title}</h3>
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  )
}

export function Field({ label, required, children, full, hint }) {
  return (
    <label className={`field${full ? ' field--full' : ''}`}>
      <span className="field__label">
        {label}
        {required ? <span className="field__req">*</span> : null}
      </span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

export function FieldGrid({ children, cols = 2 }) {
  return <div className={`field-grid field-grid--${cols}`}>{children}</div>
}

const nf = new Intl.NumberFormat('es-PY')

export default function MoneyInput({ value, onChange, placeholder = '0', autoFocus, id }) {
  const texto = value == null ? '' : nf.format(value)

  const handle = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(digits ? Number(digits) : null)
  }

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">₲</span>
      <input
        id={id}
        inputMode="numeric"
        className="input tnum pl-8 font-mono"
        value={texto}
        onChange={handle}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </div>
  )
}

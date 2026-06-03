export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  as = 'input',
  options = [],
}) {
  const base =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {as === 'select' ? (
        <select id={name} name={name} value={value} onChange={onChange} className={base} required={required}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={base}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={base}
          required={required}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

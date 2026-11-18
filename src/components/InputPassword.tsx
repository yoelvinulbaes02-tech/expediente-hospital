'use client'

import { useState } from 'react'

export function InputPassword({
  name,
  required = false,
  minLength,
  placeholder = '••••••••',
  className = '',
  defaultValue,
  autoComplete,
}: {
  name: string
  required?: boolean
  minLength?: number
  placeholder?: string
  className?: string
  defaultValue?: string
  autoComplete?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
        title={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-base leading-none p-1 cursor-pointer select-none"
      >
        {visible ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
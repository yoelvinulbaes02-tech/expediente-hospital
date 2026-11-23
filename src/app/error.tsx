'use client'

import { ErrorRecuperacionNexo } from '@/components/ErrorRecuperacionNexo'

export default function RootError({
  error,
  retry,
  reset,
}: {
  error: unknown
  retry?: () => void
  reset?: () => void
}) {
  return <ErrorRecuperacionNexo error={error} retry={retry} reset={reset} />
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

/**
 * Extracts a user-facing message from unknown errors.
 * Supports $fetch/ofetch errors (often expose `data.message`) and normal Errors.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = 'Ocorreu um erro. Tente novamente.'
): string {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (error instanceof Error) {
    const anyErr = error as unknown as UnknownRecord
    const data = isRecord(anyErr.data) ? anyErr.data : undefined
    const dataMsg = typeof data?.message === 'string' ? data.message : undefined
    return dataMsg || error.message || fallback
  }

  if (isRecord(error)) {
    const data = isRecord(error.data) ? error.data : undefined
    const dataMsg = typeof data?.message === 'string' ? data.message : undefined
    const msg = typeof error.message === 'string' ? error.message : undefined
    return dataMsg || msg || fallback
  }

  return fallback
}




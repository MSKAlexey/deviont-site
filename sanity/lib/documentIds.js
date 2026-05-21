export function normalizeSanityDocumentId(documentId) {
  return typeof documentId === 'string' && documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId || ''
}

export function getDraftDocumentId(documentId) {
  const normalizedDocumentId = normalizeSanityDocumentId(documentId)

  return normalizedDocumentId ? `drafts.${normalizedDocumentId}` : ''
}

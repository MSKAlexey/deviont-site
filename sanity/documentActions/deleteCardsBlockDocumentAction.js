import {useState} from 'react'
import {useToast} from '@sanity/ui'
import {useClient} from 'sanity'

const API_VERSION = '2026-03-27'
const deleteActionWrapperCache = new WeakMap()
const SITE_SETTINGS_IDS = ['siteSettings', 'drafts.siteSettings']
const REFERENCED_SECTIONS_QUERY = `
  *[_id in $siteSettingsIds]{
    _id,
    "sections": sections[_type in ["cardsBlock", "cardsBlockItem"] && contentDocument._ref == $documentId]{
      _key,
      _type,
      title,
      "itemsCount": count(items)
    }
  }
`

function buildSectionPath(sectionKey, suffix = '') {
  return `sections[_key==${JSON.stringify(sectionKey)}]${suffix}`
}

function hasLegacyCardsContent(section) {
  return Boolean(section?.title) || Number(section?.itemsCount) > 0
}

async function deleteDocumentPair(client, publishedId) {
  const draftId = `drafts.${publishedId}`

  for (const documentId of [draftId, publishedId]) {
    try {
      await client.delete(documentId)
    } catch (error) {
      const statusCode = error?.statusCode || error?.response?.statusCode

      if (statusCode !== 404) {
        throw error
      }
    }
  }
}

export function createDeleteCardsBlockDocumentAction(originalAction) {
  if (deleteActionWrapperCache.has(originalAction)) {
    return deleteActionWrapperCache.get(originalAction)
  }

  function DeleteCardsBlockDocumentAction(props) {
    const client = useClient({apiVersion: API_VERSION})
    const toast = useToast()
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const originalResult = originalAction(props)
    const publishedId =
      props.published?._id || props.id?.replace(/^drafts\./, '') || ''

    async function handleConfirmDelete() {
      if (!publishedId) {
        return
      }

      setIsDeleting(true)

      try {
        const referencedDocuments = await client.fetch(REFERENCED_SECTIONS_QUERY, {
          documentId: publishedId,
          siteSettingsIds: SITE_SETTINGS_IDS,
        })

        let transaction = client.transaction()
        let hasReferenceUpdates = false

        for (const siteSettingsDocument of referencedDocuments || []) {
          const unsetPaths = []

          for (const section of siteSettingsDocument?.sections || []) {
            if (!section?._key) {
              continue
            }

            if (hasLegacyCardsContent(section)) {
              unsetPaths.push(buildSectionPath(section._key, '.contentDocument'))
            } else {
              unsetPaths.push(buildSectionPath(section._key))
            }
          }

          if (unsetPaths.length > 0) {
            transaction = transaction.patch(siteSettingsDocument._id, {
              unset: unsetPaths,
            })
            hasReferenceUpdates = true
          }
        }

        if (hasReferenceUpdates) {
          await transaction.commit()
        }

        await deleteDocumentPair(client, publishedId)

        setIsConfirmDialogOpen(false)
        props.onComplete()

        toast.push({
          closable: true,
          status: 'success',
          title: 'Блок карточек удалён',
        })
      } catch (error) {
        setIsDeleting(false)

        toast.push({
          closable: true,
          status: 'error',
          title: 'Не удалось удалить блок карточек',
          description: error?.message,
        })
      }
    }

    return {
      ...originalResult,
      disabled: isDeleting,
      label: isDeleting ? 'Удаление...' : originalResult?.label,
      onHandle: () => {
        if (!isDeleting) {
          setIsConfirmDialogOpen(true)
        }
      },
      dialog: isConfirmDialogOpen
        ? {
            type: 'confirm',
            tone: 'critical',
            message:
              'Удалить блок карточек? Связь с "Секциями главной" будет автоматически очищена.',
            confirmButtonText: isDeleting ? 'Удаление...' : 'Удалить',
            cancelButtonText: 'Отмена',
            onConfirm: handleConfirmDelete,
            onCancel: () => {
              if (!isDeleting) {
                setIsConfirmDialogOpen(false)
              }
            },
          }
        : null,
    }
  }

  deleteActionWrapperCache.set(originalAction, DeleteCardsBlockDocumentAction)

  return DeleteCardsBlockDocumentAction
}

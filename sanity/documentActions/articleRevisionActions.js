import {useState} from 'react'
import {useToast} from '@sanity/ui'
import {useClient} from 'sanity'
import {getDraftDocumentId, normalizeSanityDocumentId} from '../lib/documentIds.js'

const API_VERSION = '2026-03-27'
const publishActionWrapperCache = new WeakMap()
const BEFORE_PUBLISH_DUPLICATE_QUERY = `
  *[
    _type == "articleRevision" &&
    article._ref in [$articleId, $draftArticleId] &&
    revisionType == "beforePublish" &&
    sourceArticleUpdatedAt == $sourceArticleUpdatedAt
  ][0]._id
`
const ARTICLE_EXISTS_QUERY = `*[_id in [$articleId, $draftId]][0]._id`
const CURRENT_ARTICLE_QUERY = `coalesce(*[_id == $draftId][0], *[_id == $articleId][0])`

function removeUndefinedValues(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedValues)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, fieldValue]) => typeof fieldValue !== 'undefined')
      .map(([key, fieldValue]) => [key, removeUndefinedValues(fieldValue)])
  )
}

function hasField(document, fieldName) {
  return Object.prototype.hasOwnProperty.call(document || {}, fieldName)
}

function buildRevisionDocument({
  article,
  revisionType,
  revisionComment,
  revisionCreatedAt = new Date().toISOString(),
}) {
  const articleId = normalizeSanityDocumentId(article?._id)

  if (!articleId) {
    throw new Error('Статья ещё не сохранена')
  }

  return removeUndefinedValues({
    _type: 'articleRevision',
    article: {
      _type: 'reference',
      _ref: articleId,
    },
    articleTitle: article.title,
    articleSlug: article.slug?.current,
    excerpt: article.excerpt,
    body: article.body,
    coverImage: article.coverImage,
    coverImageAlt: article.coverImageAlt,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    materialType: article.materialType,
    oneCConfiguration: article.oneCConfiguration,
    oneCVersion: article.oneCVersion,
    relatedService: article.relatedService,
    sourceArticleUpdatedAt: article._updatedAt,
    revisionCreatedAt,
    revisionComment,
    revisionType,
  })
}

async function createArticleRevision({
  client,
  article,
  revisionType,
  revisionComment,
  skipDuplicateBeforePublish = false,
}) {
  const revisionDocument = buildRevisionDocument({
    article,
    revisionType,
    revisionComment,
  })

  if (
    skipDuplicateBeforePublish &&
    revisionType === 'beforePublish' &&
    revisionDocument.sourceArticleUpdatedAt
  ) {
    const existingRevisionId = await client.fetch(BEFORE_PUBLISH_DUPLICATE_QUERY, {
      articleId: revisionDocument.article._ref,
      draftArticleId: getDraftDocumentId(revisionDocument.article._ref),
      sourceArticleUpdatedAt: revisionDocument.sourceArticleUpdatedAt,
    })

    if (existingRevisionId) {
      return null
    }
  }

  return client.create(revisionDocument)
}

function buildArticleRestorePatch(revision) {
  const set = {}
  const unset = []
  const optionalFields = [
    'coverImage',
    'coverImageAlt',
    'seoTitle',
    'seoDescription',
    'materialType',
    'oneCConfiguration',
    'oneCVersion',
    'relatedService',
  ]

  if (revision.articleTitle) {
    set.title = revision.articleTitle
  }

  if (revision.articleSlug) {
    set.slug = {
      _type: 'slug',
      current: revision.articleSlug,
    }
  }

  if (hasField(revision, 'excerpt')) {
    set.excerpt = revision.excerpt
  }

  if (Array.isArray(revision.body)) {
    set.body = revision.body
  }

  for (const fieldName of optionalFields) {
    if (typeof revision[fieldName] === 'undefined' || revision[fieldName] === null) {
      unset.push(fieldName)
    } else {
      set[fieldName] = revision[fieldName]
    }
  }

  return {
    set: removeUndefinedValues(set),
    unset,
  }
}

export function SaveArticleRevisionAction(props) {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const article = props.draft || props.published
  const articleId = normalizeSanityDocumentId(article?._id || props.id)
  const disabled = isSaving || !article || !articleId

  return {
    label: isSaving ? 'Сохраняем версию...' : 'Сохранить версию',
    disabled,
    onHandle: async () => {
      if (disabled) {
        props.onComplete()
        return
      }

      const revisionComment =
        typeof window === 'undefined'
          ? ''
          : window.prompt('Комментарий к версии') ?? null

      if (revisionComment === null) {
        props.onComplete()
        return
      }

      setIsSaving(true)

      try {
        await createArticleRevision({
          client,
          article,
          revisionType: 'manual',
          revisionComment: revisionComment.trim(),
        })

        toast.push({
          closable: true,
          status: 'success',
          title: 'Версия статьи сохранена',
        })
      } catch (error) {
        toast.push({
          closable: true,
          status: 'error',
          title: 'Не удалось сохранить версию',
          description: error?.message,
        })
      } finally {
        setIsSaving(false)
        props.onComplete()
      }
    },
  }
}

export function RestoreArticleRevisionAction(props) {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const revision = props.draft || props.published
  const articleId = normalizeSanityDocumentId(revision?.article?._ref)
  const draftId = getDraftDocumentId(articleId)
  const disabled = isRestoring || !revision || !articleId

  async function handleRestore() {
    if (disabled) {
      return
    }

    setIsRestoring(true)

    try {
      const existingArticleId = await client.fetch(ARTICLE_EXISTS_QUERY, {
        articleId,
        draftId,
      })

      if (!existingArticleId) {
        throw new Error('Связанная статья не найдена')
      }

      const currentArticle = await client.fetch(CURRENT_ARTICLE_QUERY, {
        articleId,
        draftId,
      })
      const restorePatch = buildArticleRestorePatch(revision)
      let transaction = client.transaction()

      if (currentArticle) {
        transaction = transaction.create(
          buildRevisionDocument({
            article: currentArticle,
            revisionType: 'restorePoint',
            revisionComment: `Перед восстановлением версии ${revision.revisionCreatedAt || ''}`.trim(),
          })
        )
      }

      transaction = transaction
        .createIfNotExists({
          _id: draftId,
          _type: 'article',
        })
        .patch(draftId, (patch) => {
          let nextPatch = patch.set(restorePatch.set)

          if (restorePatch.unset.length > 0) {
            nextPatch = nextPatch.unset(restorePatch.unset)
          }

          return nextPatch
        })

      await transaction.commit()

      setIsConfirmDialogOpen(false)
      props.onComplete()

      toast.push({
        closable: true,
        status: 'success',
        title: 'Версия восстановлена в черновик статьи',
      })
    } catch (error) {
      setIsRestoring(false)

      toast.push({
        closable: true,
        status: 'error',
        title: 'Не удалось восстановить версию',
        description: error?.message,
      })
    }
  }

  return {
    label: isRestoring ? 'Восстанавливаем...' : 'Восстановить в статью',
    disabled,
    tone: 'critical',
    onHandle: () => {
      if (!disabled) {
        setIsConfirmDialogOpen(true)
      }
    },
    dialog: isConfirmDialogOpen
      ? {
          type: 'confirm',
          tone: 'critical',
          message:
            'Восстановить эту версию в черновик статьи? Текущий черновик будет перезаписан, публикация не произойдёт.',
          confirmButtonText: isRestoring ? 'Восстановление...' : 'Восстановить',
          cancelButtonText: 'Отмена',
          onConfirm: handleRestore,
          onCancel: () => {
            if (!isRestoring) {
              setIsConfirmDialogOpen(false)
            }
          },
        }
      : null,
  }
}

export function createPublishArticleWithRevisionAction(originalAction) {
  if (publishActionWrapperCache.has(originalAction)) {
    return publishActionWrapperCache.get(originalAction)
  }

  function PublishArticleWithRevisionAction(props) {
    const client = useClient({apiVersion: API_VERSION})
    const toast = useToast()
    const [isCreatingRevision, setIsCreatingRevision] = useState(false)
    const originalResult = originalAction(props)
    const article = props.draft || props.published

    return {
      ...originalResult,
      disabled: originalResult?.disabled || isCreatingRevision,
      label: isCreatingRevision ? 'Сохраняем версию...' : originalResult?.label,
      onHandle: async () => {
        setIsCreatingRevision(true)

        try {
          if (!article) {
            throw new Error('Не удалось получить данные статьи для версии перед публикацией')
          }

          await createArticleRevision({
            client,
            article,
            revisionType: 'beforePublish',
            skipDuplicateBeforePublish: true,
          })
        } catch (error) {
          toast.push({
            closable: true,
            status: 'error',
            title: 'Публикация остановлена',
            description:
              error?.message ||
              'Не удалось создать версию перед публикацией. Статья не опубликована.',
          })
          setIsCreatingRevision(false)
          props.onComplete?.()
          return
        } finally {
          setIsCreatingRevision(false)
        }

        originalResult?.onHandle?.()
      },
    }
  }

  publishActionWrapperCache.set(originalAction, PublishArticleWithRevisionAction)

  return PublishArticleWithRevisionAction
}

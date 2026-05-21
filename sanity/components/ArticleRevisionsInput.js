import {useEffect, useMemo, useState} from 'react'
import {Badge, Box, Card, Flex, Stack, Text} from '@sanity/ui'
import {useClient, useFormValue} from 'sanity'
import {IntentLink} from 'sanity/router'

const API_VERSION = '2026-03-27'
const ARTICLE_REVISIONS_QUERY = `
  *[_type == "articleRevision" && article._ref == $articleId]
    | order(revisionCreatedAt desc)[0...20]{
      _id,
      articleTitle,
      articleSlug,
      revisionCreatedAt,
      revisionComment,
      revisionType
    }
`

const revisionTypeTitles = {
  manual: 'Ручная',
  beforePublish: 'Перед публикацией',
  restorePoint: 'Точка восстановления',
}

function getPublishedDocumentId(documentId) {
  return typeof documentId === 'string' && documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function formatDateTime(value) {
  if (!value) {
    return 'Дата не указана'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Дата не указана' : date.toLocaleString('ru-RU')
}

export default function ArticleRevisionsInput() {
  const client = useClient({apiVersion: API_VERSION})
  const documentId = useFormValue(['_id'])
  const articleId = useMemo(() => getPublishedDocumentId(documentId), [documentId])
  const [state, setState] = useState({
    articleId: null,
    revisions: [],
    error: null,
  })

  useEffect(() => {
    if (!articleId) {
      return
    }

    let isCancelled = false

    client
      .fetch(ARTICLE_REVISIONS_QUERY, {articleId})
      .then((revisions) => {
        if (!isCancelled) {
          setState({
            articleId,
            revisions: Array.isArray(revisions) ? revisions : [],
            error: null,
          })
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setState({
            articleId,
            revisions: [],
            error: error?.message || 'Не удалось загрузить версии',
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [articleId, client])

  if (!articleId) {
    return (
      <Card padding={3} radius={2} tone="caution">
        <Text size={1}>Сохраните статью, чтобы видеть связанные версии.</Text>
      </Card>
    )
  }

  const isLoading = state.articleId !== articleId

  if (state.error) {
    return (
      <Card padding={3} radius={2} tone="critical">
        <Text size={1}>{state.error}</Text>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card padding={3} radius={2} tone="default">
        <Text size={1}>Загружаем версии...</Text>
      </Card>
    )
  }

  if (state.revisions.length === 0) {
    return (
      <Card padding={3} radius={2} tone="default">
        <Text size={1}>Для этой статьи пока нет сохранённых версий.</Text>
      </Card>
    )
  }

  return (
    <Stack space={2}>
      {state.revisions.map((revision) => (
        <Card key={revision._id} padding={3} radius={2} shadow={1}>
          <Flex align="center" justify="space-between" gap={3}>
            <Box flex={1}>
              <Stack space={2}>
                <Flex align="center" gap={2} wrap="wrap">
                  <Text size={1} weight="semibold">
                    {formatDateTime(revision.revisionCreatedAt)}
                  </Text>
                  <Badge tone={revision.revisionType === 'beforePublish' ? 'primary' : 'default'}>
                    {revisionTypeTitles[revision.revisionType] || revision.revisionType}
                  </Badge>
                </Flex>
                <Text size={1} muted>
                  {revision.articleSlug || 'slug не указан'}
                </Text>
                {revision.revisionComment ? (
                  <Text size={1} muted>
                    {revision.revisionComment}
                  </Text>
                ) : null}
              </Stack>
            </Box>
            <IntentLink intent="edit" params={{id: revision._id, type: 'articleRevision'}}>
              Открыть
            </IntentLink>
          </Flex>
        </Card>
      ))}
    </Stack>
  )
}

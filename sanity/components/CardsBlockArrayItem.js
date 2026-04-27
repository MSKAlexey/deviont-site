import {useEffect, useMemo, useRef, useState} from 'react'
import {Badge, Box, Flex, Switch, useToast} from '@sanity/ui'
import {
  set,
  useClient,
  useDocumentOperation,
  useDocumentOperationEvent,
  useFormValue,
} from 'sanity'

const API_VERSION = '2026-03-27'
const CARDS_BLOCK_PREVIEW_QUERY = `
  coalesce(
    *[_id == $draftId][0]{
      title,
      titleContent,
      "itemsCount": count(items)
    },
    *[_id == $publishedId][0]{
      title,
      titleContent,
      "itemsCount": count(items)
    }
  )
`

function stopAndPrevent(event) {
  event.preventDefault()
  event.stopPropagation()
}

function stopEvent(event) {
  event.stopPropagation()
}

function isCardsBlockValue(value) {
  return typeof value?._type === 'string' && value._type.startsWith('cardsBlock')
}

function getCardsCount(value, linkedPreview) {
  if (typeof linkedPreview?.itemsCount === 'number') {
    return linkedPreview.itemsCount
  }

  if (Array.isArray(value?.items)) {
    return value.items.length
  }

  return 0
}

function getPortableTextPlainText(value) {
  const content = Array.isArray(value?.content) ? value.content : []

  return content
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) {
        return ''
      }

      return block.children
        .map((child) => (child?._type === 'span' && typeof child.text === 'string' ? child.text : ''))
        .join('')
        .trim()
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

function getTitle(props, linkedPreview) {
  if (typeof props.value?.adminTitle === 'string' && props.value.adminTitle.trim()) {
    return props.value.adminTitle.trim()
  }

  const localRichTitle = getPortableTextPlainText(props.value?.titleContent)

  if (localRichTitle) {
    return localRichTitle
  }

  const linkedRichTitle = getPortableTextPlainText(linkedPreview?.titleContent)

  if (linkedRichTitle) {
    return linkedRichTitle
  }

  if (linkedPreview?.title) {
    return linkedPreview.title
  }

  return props.value?.title || props.title
}

function getSubtitle(props, linkedPreview) {
  if (isCardsBlockValue(props.value)) {
    return `${getCardsCount(props.value, linkedPreview)} карточек`
  }

  return props.subtitle
}

function getPreviewItems(props, linkedPreview) {
  if (!isCardsBlockValue(props.value)) {
    return props.items
  }

  const itemsCount = getCardsCount(props.value, linkedPreview)

  if (itemsCount > 0) {
    return Array.from({length: itemsCount}, (_, index) => ({_key: `preview-${index}`}))
  }

  return props.value?.items
}

export default function CardsBlockArrayItem(props) {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const rootDocument = useFormValue([])
  const rootDocumentId =
    typeof rootDocument?._id === 'string' ? rootDocument._id : 'siteSettings'
  const rootDocumentType =
    typeof rootDocument?._type === 'string' ? rootDocument._type : 'siteSettings'
  const publishedDocumentId = useMemo(() => {
    if (typeof rootDocumentId !== 'string') {
      return 'siteSettings'
    }

    return rootDocumentId.startsWith('drafts.')
      ? rootDocumentId.slice('drafts.'.length)
      : rootDocumentId
  }, [rootDocumentId])
  const {publish} = useDocumentOperation(publishedDocumentId, rootDocumentType)
  const operationEvent = useDocumentOperationEvent(publishedDocumentId, rootDocumentType)
  const lastSeenOperationRef = useRef(operationEvent)
  const hidden = props.value?.isActive === false
  const [syncState, setSyncState] = useState('idle')
  const disabled = props.readOnly === true || syncState !== 'idle'
  const statusTone = hidden ? 'caution' : 'positive'
  const statusText = hidden ? 'Скрыто' : 'Активна'
  const linkedDocumentId = props.value?.contentDocument?._ref
  const [linkedPreviewState, setLinkedPreviewState] = useState({
    documentId: null,
    value: null,
  })
  const linkedPreview =
    linkedPreviewState.documentId === linkedDocumentId
      ? linkedPreviewState.value
      : null

  useEffect(() => {
    if (!linkedDocumentId) {
      return
    }

    let isCancelled = false

    client
      .fetch(CARDS_BLOCK_PREVIEW_QUERY, {
        draftId: `drafts.${linkedDocumentId}`,
        publishedId: linkedDocumentId,
      })
      .then((result) => {
        if (!isCancelled) {
          setLinkedPreviewState({
            documentId: linkedDocumentId,
            value: result || null,
          })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLinkedPreviewState({
            documentId: linkedDocumentId,
            value: null,
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [client, linkedDocumentId])

  useEffect(() => {
    if (!operationEvent || operationEvent === lastSeenOperationRef.current) {
      return
    }

    lastSeenOperationRef.current = operationEvent

    if (syncState === 'pendingPatch' && operationEvent.op === 'patch') {
      if (operationEvent.type === 'error') {
        queueMicrotask(() => {
          setSyncState('idle')
        })
        toast.push({
          closable: true,
          status: 'error',
          title: 'Не удалось сохранить изменение видимости',
        })
        return
      }

      queueMicrotask(() => {
        setSyncState('readyToPublish')
      })
      return
    }

    if (syncState === 'publishing' && operationEvent.op === 'publish') {
      queueMicrotask(() => {
        setSyncState('idle')
      })

      if (operationEvent.type === 'error') {
        toast.push({
          closable: true,
          status: 'error',
          title: 'Не удалось опубликовать изменение видимости',
        })
      }
    }
  }, [operationEvent, syncState, toast])

  useEffect(() => {
    if (syncState !== 'readyToPublish') {
      return
    }

    if (publish.disabled === false) {
      queueMicrotask(() => {
        setSyncState('publishing')
      })

      try {
        publish.execute()
      } catch {
        queueMicrotask(() => {
          setSyncState('idle')
        })
        toast.push({
          closable: true,
          status: 'error',
          title: 'Не удалось опубликовать изменение видимости',
        })
      }
    }
  }, [publish, syncState, toast])

  function handleToggleClick(event) {
    stopAndPrevent(event)

    if (disabled) {
      return
    }

    lastSeenOperationRef.current = operationEvent
    setSyncState('pendingPatch')
    props.inputProps.onChange(set(hidden, ['isActive']))
  }

  return (
    <Flex align="center" gap={2}>
      <button
        type="button"
        role="switch"
        aria-checked={!hidden}
        aria-label={hidden ? 'Показать секцию' : 'Скрыть секцию'}
        disabled={disabled}
        onClick={handleToggleClick}
        onMouseDown={stopEvent}
        onPointerDown={stopEvent}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 0,
          padding: 0,
          margin: 0,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <Flex align="center" gap={2} paddingLeft={2} paddingRight={1}>
          <Switch
            checked={!hidden}
            readOnly
            tabIndex={-1}
            style={{pointerEvents: 'none'}}
          />
          <Badge tone={statusTone}>{statusText}</Badge>
        </Flex>
      </button>

      <Box
        flex={1}
        style={{
          opacity: hidden ? 0.6 : 1,
          transition: 'opacity 120ms ease',
        }}
      >
        {props.renderDefault({
          ...props,
          items: getPreviewItems(props, linkedPreview),
          title: getTitle(props, linkedPreview),
          subtitle: getSubtitle(props, linkedPreview),
        })}
      </Box>
    </Flex>
  )
}

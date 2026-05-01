import {useEffect} from 'react'
import {ObjectInputMember, PatchEvent, set, setIfMissing, useFormValue} from 'sanity'

function getFieldMember(members = [], name) {
  return members.find((member) => member.kind === 'field' && member.name === name)
}

function renderMember(props, member) {
  if (!member) {
    return null
  }

  return (
    <ObjectInputMember
      member={member}
      renderAnnotation={props.renderAnnotation}
      renderBlock={props.renderBlock}
      renderField={props.renderField}
      renderInlineBlock={props.renderInlineBlock}
      renderInput={props.renderInput}
      renderItem={props.renderItem}
      renderPreview={props.renderPreview}
    />
  )
}

function getEditorHeight(rows) {
  const resolvedRows = Math.max(1, Number(rows) || 1)

  return `calc(${(resolvedRows * 1.67).toFixed(2)}em + 12px)`
}

function hasPortableTextContent(value) {
  return Array.isArray(value)
    ? value.some(
        (block) =>
          block?._type === 'block' &&
          Array.isArray(block.children) &&
          block.children.some(
            (child) => child?._type === 'span' && typeof child.text === 'string' && child.text.trim().length > 0
          )
      )
    : false
}

function createPortableTextBlock(text) {
  const keySuffix = Math.random().toString(36).slice(2, 10)

  return [
    {
      _type: 'block',
      _key: `block-${keySuffix}`,
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `span-${keySuffix}`,
          marks: [],
          text,
        },
      ],
    },
  ]
}

export default function CardsTextConfigInput(props) {
  const {onChange, readOnly, schemaType, value} = props
  const rows = schemaType?.options?.rows || 3
  const isPlainTextInput = schemaType?.options?.plainTextInput === true
  const legacyFieldName = schemaType?.options?.legacyFieldName
  const contentMember = getFieldMember(props.members, 'content')
  const editorHeight = getEditorHeight(rows)
  const parentValue = useFormValue(Array.isArray(props.path) ? props.path.slice(0, -1) : [])
  const legacyText =
    legacyFieldName && parentValue && typeof parentValue === 'object'
      ? parentValue[legacyFieldName]
      : undefined

  useEffect(() => {
    if (readOnly) {
      return
    }

    const patches = []

    if (!value || typeof value !== 'object') {
      patches.push(setIfMissing({}))
    }

    if (
      !hasPortableTextContent(value?.content) &&
      typeof legacyText === 'string' &&
      legacyText.trim().length > 0
    ) {
      patches.push(set(createPortableTextBlock(legacyText), ['content']))
    }

    if (patches.length > 0) {
      onChange(PatchEvent.from(patches))
    }
  }, [legacyText, onChange, readOnly, value])

  if (isPlainTextInput) {
    const plainText = getPortableTextPlainText(value?.content) || legacyText || ''

    return (
      <div className="cardsTextConfigInputContent">
        <style>{`
          .cardsPlainTextInput {
            width: 100%;
            min-height: 40px;
            padding: 0 12px;
            border: 1px solid var(--card-border-color, #2f3548);
            border-radius: 4px;
            background: transparent;
            color: inherit;
            font: inherit;
            line-height: 40px;
          }

          .cardsPlainTextInput:focus {
            outline: none;
            box-shadow: 0 0 0 1px var(--card-focus-ring-color, #6e8cff);
          }
        `}</style>
        <input
          className="cardsPlainTextInput"
          type="text"
          value={plainText}
          disabled={readOnly}
          onChange={(event) =>
            onChange(
              PatchEvent.from([
                setIfMissing({}),
                set(createPortableTextBlock(event.currentTarget.value), ['content']),
              ])
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="cardsTextConfigInputContent">
      <style>{`
        .cardsTextConfigInputContent [data-testid='pt-editor'][data-fullscreen='false'] {
          min-height: ${editorHeight} !important;
          height: auto !important;
          overflow: hidden !important;
        }

        .cardsTextConfigInputContent [data-testid='pt-editor'][data-fullscreen='false'] > div {
          overflow: visible !important;
        }

        .cardsTextConfigInputContent [data-slate-editor='true'] {
          min-height: ${editorHeight} !important;
        }
      `}</style>
      {renderMember(props, contentMember)}
    </div>
  )
}

function getPortableTextPlainText(value) {
  if (!Array.isArray(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) {
        return ''
      }

      return block.children
        .map((child) => (child?._type === 'span' && typeof child.text === 'string' ? child.text : ''))
        .join('')
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

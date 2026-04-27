import {useEffect, useMemo, useRef, useState} from 'react'
import {PortableTextEditor} from '@portabletext/editor'
import {Grid, Select, Stack, Text, TextInput} from '@sanity/ui'
import {ObjectInputMember, PatchEvent, set, setIfMissing, useFormValue} from 'sanity'
import {CardsTextConfigProvider} from './CardsTextConfigContext.js'

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

function getFieldSchema(schemaType, name) {
  return Array.isArray(schemaType?.fields) ? schemaType.fields.find((field) => field.name === name) : null
}

function getFieldOptions(fieldSchema) {
  const options = fieldSchema?.type?.options || fieldSchema?.options

  return Array.isArray(options?.list) ? options.list : []
}

function getDefaultTypography(schemaType) {
  return {
    fontFamily: schemaType?.initialValue?.fontFamily || 'segoe-ui',
    fontWeight: schemaType?.initialValue?.fontWeight || '600',
    fontSize:
      typeof schemaType?.initialValue?.fontSize === 'number' && schemaType.initialValue.fontSize > 0
        ? schemaType.initialValue.fontSize
        : 15,
  }
}

function getStoredTypography(value, defaults) {
  return {
    fontFamily: value?.fontFamily || defaults.fontFamily,
    fontWeight: value?.fontWeight || defaults.fontWeight,
    fontSize:
      typeof value?.fontSize === 'number' && value.fontSize > 0 ? value.fontSize : defaults.fontSize,
  }
}

function getVisibleTypography(storedTypography, inlineTypography) {
  if (!inlineTypography) {
    return storedTypography
  }

  return {
    fontFamily: inlineTypography.fontFamily || storedTypography.fontFamily,
    fontWeight: inlineTypography.fontWeight || storedTypography.fontWeight,
    fontSize:
      typeof inlineTypography.fontSize === 'number' && inlineTypography.fontSize > 0
        ? inlineTypography.fontSize
        : storedTypography.fontSize,
  }
}

function getSanitizedTypography(nextTypography, defaults) {
  return {
    fontFamily: nextTypography.fontFamily || defaults.fontFamily,
    fontWeight: nextTypography.fontWeight || defaults.fontWeight,
    fontSize:
      typeof nextTypography.fontSize === 'number' && nextTypography.fontSize > 0
        ? nextTypography.fontSize
        : defaults.fontSize,
  }
}

function getInlineTypographyKeys(editor) {
  return [
    ...new Set(
      (PortableTextEditor.activeAnnotations(editor) || [])
        .filter((annotation) => annotation?._type === 'inlineTypography')
        .map((annotation) => annotation?._key)
        .filter(Boolean)
    ),
  ]
}

function getContentWithUpdatedInlineTypography(content, annotationKeys, nextTypography) {
  if (!Array.isArray(content) || annotationKeys.length === 0) {
    return content
  }

  const targetKeys = new Set(annotationKeys)
  let hasChanges = false

  const nextContent = content.map((block) => {
    if (block?._type !== 'block' || !Array.isArray(block.markDefs)) {
      return block
    }

    let blockChanged = false

    const nextMarkDefs = block.markDefs.map((markDef) => {
      if (!targetKeys.has(markDef?._key) || markDef?._type !== 'inlineTypography') {
        return markDef
      }

      const nextMarkDef = {
        ...markDef,
        ...nextTypography,
      }

      if (
        nextMarkDef.fontFamily !== markDef.fontFamily ||
        nextMarkDef.fontWeight !== markDef.fontWeight ||
        nextMarkDef.fontSize !== markDef.fontSize
      ) {
        blockChanged = true
        hasChanges = true
      }

      return nextMarkDef
    })

    return blockChanged ? {...block, markDefs: nextMarkDefs} : block
  })

  return hasChanges ? nextContent : content
}

function SelectControl({label, onChange, options, readOnly, value}) {
  return (
    <Stack space={2}>
      <Text size={1} weight="medium">
        {label}
      </Text>
      <Select disabled={readOnly} onChange={onChange} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </Select>
    </Stack>
  )
}

function NumberControl({label, onChange, readOnly, value}) {
  return (
    <Stack space={2}>
      <Text size={1} weight="medium">
        {label}
      </Text>
      <TextInput disabled={readOnly} onChange={onChange} type="number" value={String(value)} />
    </Stack>
  )
}

export default function CardsTextConfigInput(props) {
  const [editorState, setEditorState] = useState(null)
  const pendingInlineAnnotationKeysRef = useRef([])
  const rows = props.schemaType?.options?.rows || 3
  const legacyFieldName = props.schemaType?.options?.legacyFieldName
  const contentMember = getFieldMember(props.members, 'content')
  const editorHeight = getEditorHeight(rows)
  const parentValue = useFormValue(Array.isArray(props.path) ? props.path.slice(0, -1) : [])
  const legacyText =
    legacyFieldName && parentValue && typeof parentValue === 'object'
      ? parentValue[legacyFieldName]
      : undefined
  const defaultTypography = useMemo(() => getDefaultTypography(props.schemaType), [props.schemaType])
  const storedTypography = useMemo(
    () => getStoredTypography(props.value, defaultTypography),
    [defaultTypography, props.value]
  )
  const visibleTypography = useMemo(
    () => getVisibleTypography(storedTypography, editorState?.activeInlineTypography),
    [editorState?.activeInlineTypography, storedTypography]
  )
  const fontFamilyField = getFieldSchema(props.schemaType, 'fontFamily')
  const fontWeightField = getFieldSchema(props.schemaType, 'fontWeight')
  const fontSizeField = getFieldSchema(props.schemaType, 'fontSize')
  const fontFamilyOptions = getFieldOptions(fontFamilyField)
  const fontWeightOptions = getFieldOptions(fontWeightField)
  const activeInlineAnnotationKeys =
    pendingInlineAnnotationKeysRef.current.length > 0
      ? pendingInlineAnnotationKeysRef.current
      : Array.isArray(editorState?.activeInlineTypographyKeys)
        ? editorState.activeInlineTypographyKeys
        : []
  const isInlineMode = activeInlineAnnotationKeys.length > 0
  const contextValue = useMemo(
    () => ({
      onEditorStateChange: (nextState) => {
        setEditorState((currentState) => {
          if (!nextState) {
            return currentState
          }

          return {
            ...nextState,
            lastExpandedSelection:
              nextState.hasExpandedSelection && nextState.selection
                ? nextState.selection
                : currentState?.lastExpandedSelection || null,
          }
        })
      },
    }),
    []
  )

  useEffect(() => {
    if (props.readOnly) {
      return
    }

    const patches = []

    if (!props.value || typeof props.value !== 'object') {
      patches.push(setIfMissing({}))
    }

    if (!props.value?.fontFamily) {
      patches.push(set(defaultTypography.fontFamily, ['fontFamily']))
    }

    if (!props.value?.fontWeight) {
      patches.push(set(defaultTypography.fontWeight, ['fontWeight']))
    }

    if (!(typeof props.value?.fontSize === 'number' && props.value.fontSize > 0)) {
      patches.push(set(defaultTypography.fontSize, ['fontSize']))
    }

    if (
      !hasPortableTextContent(props.value?.content) &&
      typeof legacyText === 'string' &&
      legacyText.trim().length > 0
    ) {
      patches.push(set(createPortableTextBlock(legacyText), ['content']))
    }

    if (patches.length > 0) {
      props.onChange(PatchEvent.from(patches))
    }
  }, [
    defaultTypography.fontFamily,
    defaultTypography.fontSize,
    defaultTypography.fontWeight,
    legacyText,
    props.onChange,
    props.readOnly,
    props.value,
  ])

  function commitFieldTypography(fieldName, nextValue) {
    const normalizedTypography = getSanitizedTypography(
      {
        ...visibleTypography,
        [fieldName]: nextValue,
      },
      defaultTypography
    )

    if (isInlineMode && editorState?.editor) {
      const nextContent = getContentWithUpdatedInlineTypography(
        PortableTextEditor.getValue(editorState.editor),
        activeInlineAnnotationKeys,
        normalizedTypography
      )

      props.onChange(PatchEvent.from([setIfMissing({}), set(nextContent, ['content'])]))
      setEditorState((currentState) =>
        currentState
          ? {
              ...currentState,
              activeInlineTypography: normalizedTypography,
              activeInlineTypographyKeys: activeInlineAnnotationKeys,
            }
          : currentState
      )
      return
    }

    props.onChange(
      PatchEvent.from([setIfMissing({}), set(normalizedTypography[fieldName], [fieldName])])
    )
  }

  function handleToolbarMouseDownCapture() {
    if (props.readOnly) {
      return
    }

    const editor = editorState?.editor
    const annotationSchemaType = editorState?.annotationSchemaType
    const hasExpandedSelection = Boolean(editorState?.hasExpandedSelection && editorState?.selection)

    if (!editor || !annotationSchemaType || !hasExpandedSelection) {
      pendingInlineAnnotationKeysRef.current = Array.isArray(editorState?.activeInlineTypographyKeys)
        ? editorState.activeInlineTypographyKeys
        : []
      return
    }

    const existingKeys = Array.isArray(editorState?.activeInlineTypographyKeys)
      ? editorState.activeInlineTypographyKeys.filter(Boolean)
      : []

    if (existingKeys.length > 0) {
      pendingInlineAnnotationKeysRef.current = existingKeys
      return
    }

    PortableTextEditor.addAnnotation(
      editor,
      annotationSchemaType,
      getSanitizedTypography(visibleTypography, defaultTypography)
    )

    const nextKeys = getInlineTypographyKeys(editor)
    pendingInlineAnnotationKeysRef.current = nextKeys

    if (nextKeys.length > 0) {
      setEditorState((currentState) =>
        currentState
          ? {
              ...currentState,
              activeInlineTypography: getSanitizedTypography(visibleTypography, defaultTypography),
              activeInlineTypographyKeys: nextKeys,
            }
          : currentState
      )
    }
  }

  return (
    <CardsTextConfigProvider value={contextValue}>
      <Stack space={0}>
        <Grid columns={[1, 1, 3]} gap={3} onMouseDownCapture={handleToolbarMouseDownCapture} style={{alignItems: 'end'}}>
          <SelectControl
            label={fontFamilyField?.title || 'Шрифт'}
            onChange={(event) => commitFieldTypography('fontFamily', event.currentTarget.value)}
            options={fontFamilyOptions}
            readOnly={props.readOnly}
            value={visibleTypography.fontFamily}
          />
          <SelectControl
            label={fontWeightField?.title || 'Толщина'}
            onChange={(event) => commitFieldTypography('fontWeight', event.currentTarget.value)}
            options={fontWeightOptions}
            readOnly={props.readOnly}
            value={visibleTypography.fontWeight}
          />
          <NumberControl
            label={fontSizeField?.title || 'Размер шрифта, px'}
            onChange={(event) =>
              commitFieldTypography('fontSize', Number.parseInt(event.currentTarget.value, 10) || 0)
            }
            readOnly={props.readOnly}
            value={visibleTypography.fontSize}
          />
        </Grid>

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
      </Stack>
    </CardsTextConfigProvider>
  )
}

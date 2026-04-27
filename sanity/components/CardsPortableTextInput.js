import {useCallback, useEffect, useMemo, useRef} from 'react'
import {PortableTextEditor} from '@portabletext/editor'
import {useCardsTextConfigContext} from './CardsTextConfigContext.js'

const fontFamilyMap = {
  'segoe-ui': "'Segoe UI', 'Noto Sans', sans-serif",
  'noto-sans': "'Noto Sans', 'Segoe UI', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  'trebuchet-ms': "'Trebuchet MS', 'Segoe UI', sans-serif",
  'courier-new': "'Courier New', monospace",
}

const fontWeightValues = new Set(['300', '400', '500', '600', '700', '800', '900'])

function cloneSelectionPoint(point) {
  if (!point || typeof point !== 'object') {
    return null
  }

  return {
    ...point,
    path: Array.isArray(point.path)
      ? point.path.map((segment) =>
          segment && typeof segment === 'object' ? {...segment} : segment
        )
      : point.path,
  }
}

function cloneSelection(selection) {
  if (!selection || typeof selection !== 'object') {
    return null
  }

  return {
    ...selection,
    anchor: cloneSelectionPoint(selection.anchor),
    focus: cloneSelectionPoint(selection.focus),
  }
}

function normalizeFontSize(value) {
  const parsedValue = typeof value === 'number' ? value : Number.parseFloat(value)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function resolveInlineTypographyStyle(typography) {
  if (!typography || typeof typography !== 'object') {
    return undefined
  }

  const style = {}
  const fontFamily = fontFamilyMap[typography.fontFamily]
  const fontWeight = `${typography.fontWeight ?? ''}`
  const fontSize = normalizeFontSize(typography.fontSize)

  if (fontFamily) {
    style.fontFamily = fontFamily
  }

  if (fontWeightValues.has(fontWeight)) {
    style.fontWeight = Number.parseInt(fontWeight, 10)
  }

  if (fontSize) {
    style.fontSize = `${fontSize}px`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

function findInlineTypographySchemaType(schemaType) {
  const blockType = Array.isArray(schemaType?.of)
    ? schemaType.of.find((type) => type?.name === 'block') || schemaType.of[0]
    : null

  const annotations = Array.isArray(blockType?.marks?.annotations)
    ? blockType.marks.annotations
    : Array.isArray(blockType?.annotations)
      ? blockType.annotations
      : []

  return (
    annotations.find(
      (annotation) =>
        annotation?.name === 'inlineTypography' ||
        annotation?.type?.name === 'inlineTypography' ||
        annotation?.type === 'inlineTypography'
    ) || null
  )
}

function getActiveInlineTypographyAnnotations(editor) {
  return (PortableTextEditor.activeAnnotations(editor) || []).filter(
    (annotation) => annotation?._type === 'inlineTypography'
  )
}

function getActiveInlineTypography(editor) {
  return getActiveInlineTypographyAnnotations(editor)[0] || null
}

function getActiveInlineTypographyKeys(editor) {
  return [
    ...new Set(
      getActiveInlineTypographyAnnotations(editor)
        .map((annotation) => annotation?._key)
        .filter(Boolean)
    ),
  ]
}

function getEditorState(editor, annotationSchemaType) {
  if (!editor) {
    return {
      activeInlineTypography: null,
      activeInlineTypographyKeys: [],
      annotationSchemaType,
      editor: null,
      hasExpandedSelection: false,
      selection: null,
    }
  }

  return {
    activeInlineTypography: getActiveInlineTypography(editor),
    activeInlineTypographyKeys: getActiveInlineTypographyKeys(editor),
    annotationSchemaType,
    editor,
    hasExpandedSelection: PortableTextEditor.isExpandedSelection(editor),
    selection: cloneSelection(PortableTextEditor.getSelection(editor)),
  }
}

export default function CardsPortableTextInput(props) {
  const context = useCardsTextConfigContext()
  const editorRef = useRef(null)
  const annotationSchemaType = useMemo(() => findInlineTypographySchemaType(props.schemaType), [props.schemaType])

  const syncEditorState = useCallback(
    (_change, nextEditor) => {
      if (!context?.onEditorStateChange) {
        return
      }

      const editor = nextEditor || editorRef.current
      context.onEditorStateChange(getEditorState(editor, annotationSchemaType))
    },
    [annotationSchemaType, context]
  )

  useEffect(() => {
    syncEditorState(null, editorRef.current)

    return () => {
      context?.onEditorStateChange?.(null)
    }
  }, [context, syncEditorState])

  const renderAnnotation = useCallback(
    (annotationProps) => {
      const isInlineTypography =
        annotationProps?.value?._type === 'inlineTypography' ||
        annotationProps?.schemaType?.name === 'inlineTypography'

      if (!isInlineTypography) {
        return props.renderAnnotation
          ? props.renderAnnotation(annotationProps)
          : annotationProps.renderDefault(annotationProps)
      }

      const inlineStyle = resolveInlineTypographyStyle(annotationProps.value)

      return annotationProps.renderDefault({
        ...annotationProps,
        textElement: (
          <span
            style={{
              ...inlineStyle,
              backgroundColor: 'rgba(92, 118, 255, 0.14)',
              borderRadius: '4px',
              boxShadow: '0 0 0 1px rgba(92, 118, 255, 0.2) inset',
            }}
          >
            {annotationProps.textElement}
          </span>
        ),
      })
    },
    [props]
  )

  return props.renderDefault({
    ...props,
    editorRef,
    hideToolbar: true,
    onEditorChange: syncEditorState,
    renderAnnotation,
  })
}

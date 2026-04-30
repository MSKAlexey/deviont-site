import {useEffect} from 'react'
import {Grid, Stack} from '@sanity/ui'
import {ObjectInputMember, PatchEvent, set, setIfMissing} from 'sanity'

const fallbackTypography = {
  fontFamily: 'segoe-ui',
  fontWeight: '400',
  fontSize: 16,
}

function getFieldMember(members, name) {
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

function renderInputOnlyMember(props, member) {
  if (!member) {
    return null
  }

  return (
    <ObjectInputMember
      member={member}
      renderAnnotation={props.renderAnnotation}
      renderBlock={props.renderBlock}
      renderField={(fieldProps) => fieldProps.children}
      renderInlineBlock={props.renderInlineBlock}
      renderInput={props.renderInput}
      renderItem={props.renderItem}
      renderPreview={props.renderPreview}
    />
  )
}

export default function HeroTextConfigInput(props) {
  const {onChange, readOnly, schemaType, value} = props
  const defaultTypography = schemaType?.options?.defaultTypography || fallbackTypography
  const currentValue = value || {}
  const contentMember = getFieldMember(props.members, 'content')
  const fontFamilyMember = getFieldMember(props.members, 'fontFamily')
  const fontWeightMember = getFieldMember(props.members, 'fontWeight')
  const fontSizeMember = getFieldMember(props.members, 'fontSize')

  useEffect(() => {
    if (readOnly) {
      return
    }

    const nextFontFamily =
      !currentValue.fontFamily || currentValue.fontFamily === 'default'
        ? defaultTypography.fontFamily
        : currentValue.fontFamily
    const nextFontWeight =
      !currentValue.fontWeight || currentValue.fontWeight === 'default'
        ? defaultTypography.fontWeight
        : currentValue.fontWeight
    const nextFontSize =
      typeof currentValue.fontSize === 'number' && currentValue.fontSize > 0
        ? currentValue.fontSize
        : defaultTypography.fontSize
    const patches = []

    if (!value || typeof value !== 'object') {
      patches.push(setIfMissing({}))
    }

    if (nextFontFamily !== currentValue.fontFamily) {
      patches.push(set(nextFontFamily, ['fontFamily']))
    }

    if (nextFontWeight !== currentValue.fontWeight) {
      patches.push(set(nextFontWeight, ['fontWeight']))
    }

    if (nextFontSize !== currentValue.fontSize) {
      patches.push(set(nextFontSize, ['fontSize']))
    }

    if (patches.length > 0) {
      onChange(PatchEvent.from(patches))
    }
  }, [
    currentValue.fontFamily,
    currentValue.fontSize,
    currentValue.fontWeight,
    defaultTypography.fontFamily,
    defaultTypography.fontSize,
    defaultTypography.fontWeight,
    onChange,
    readOnly,
    value,
  ])

  return (
    <Stack space={0}>
      <div className="heroTextConfigInputTypography">
        <Grid columns={[1, 1, 3]} gap={0} style={{alignItems: 'stretch'}}>
          {renderInputOnlyMember(props, fontFamilyMember)}
          {renderInputOnlyMember(props, fontWeightMember)}
          {renderInputOnlyMember(props, fontSizeMember)}
        </Grid>
      </div>

      <div className="heroTextConfigInputContent">
        <style>{`
          .heroTextConfigInputTypography {
            margin-bottom: 0 !important;
            overflow: hidden;
            border: 1px solid var(--card-border-color, #2f3548);
            border-bottom: 0;
            border-radius: 4px 4px 0 0;
          }

          .heroTextConfigInputTypography + .heroTextConfigInputContent {
            margin-top: 0 !important;
          }

          .heroTextConfigInputTypography [data-ui='Box'],
          .heroTextConfigInputTypography [data-ui='Stack'] {
            margin-bottom: 0 !important;
          }

          .heroTextConfigInputTypography [data-ui='Select'],
          .heroTextConfigInputTypography input {
            border-radius: 0 !important;
            border-top: 0 !important;
            border-bottom: 0 !important;
            border-left: 0 !important;
          }

          .heroTextConfigInputTypography [data-ui='Grid'] > *:not(:last-child) [data-ui='Select'],
          .heroTextConfigInputTypography [data-ui='Grid'] > *:not(:last-child) input {
            border-right: 1px solid var(--card-border-color, #2f3548) !important;
          }

          .heroTextConfigInputContent [data-testid='pt-editor'] {
            margin-top: 0 !important;
            border-top-left-radius: 0 !important;
            border-top-right-radius: 0 !important;
          }

          .heroTextConfigInputContent [data-testid='pt-editor'][data-fullscreen='false'] {
            min-height: calc(1.67em + 12px) !important;
            height: calc(6.33em + 12px) !important;
          }
        `}</style>
        {renderMember(props, contentMember)}
      </div>
    </Stack>
  )
}

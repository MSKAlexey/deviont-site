import {useEffect} from 'react'
import {Grid} from '@sanity/ui'
import {ObjectInputMember, set} from 'sanity'

const fallbackTypography = {
  fontFamily: 'segoe-ui',
  fontWeight: '600',
  fontSize: 15,
}

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

export default function CardDetailTypographyInput(props) {
  const {onChange, readOnly} = props
  const defaultTypography = props.schemaType?.options?.defaultTypography || fallbackTypography
  const value = props.value || {}
  const {fontFamily, fontWeight, fontSize} = value
  const fontFamilyMember = getFieldMember(props.members, 'fontFamily')
  const fontWeightMember = getFieldMember(props.members, 'fontWeight')
  const fontSizeMember = getFieldMember(props.members, 'fontSize')

  useEffect(() => {
    if (readOnly) {
      return
    }

    const nextValue = {
      fontFamily: !fontFamily || fontFamily === 'default' ? defaultTypography.fontFamily : fontFamily,
      fontWeight: !fontWeight || fontWeight === 'default' ? defaultTypography.fontWeight : fontWeight,
      fontSize:
        typeof fontSize === 'number' && fontSize > 0
          ? fontSize
          : defaultTypography.fontSize,
    }

    if (
      nextValue.fontFamily !== fontFamily ||
      nextValue.fontWeight !== fontWeight ||
      nextValue.fontSize !== fontSize
    ) {
      onChange(set(nextValue))
    }
  }, [fontFamily, fontSize, fontWeight, onChange, readOnly])

  return (
    <Grid columns={3} gap={3} style={{alignItems: 'end'}}>
      {renderMember(props, fontFamilyMember)}
      {renderMember(props, fontWeightMember)}
      {renderMember(props, fontSizeMember)}
    </Grid>
  )
}

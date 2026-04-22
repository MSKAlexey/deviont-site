import {Grid} from '@sanity/ui'
import {ObjectInputMember} from 'sanity'

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

export default function CardDetailTypographyInput(props) {
  const fontFamilyMember = getFieldMember(props.members, 'fontFamily')
  const fontWeightMember = getFieldMember(props.members, 'fontWeight')
  const fontSizeMember = getFieldMember(props.members, 'fontSize')

  return (
    <Grid columns={3} gap={3} style={{alignItems: 'end'}}>
      {renderMember(props, fontFamilyMember)}
      {renderMember(props, fontWeightMember)}
      {renderMember(props, fontSizeMember)}
    </Grid>
  )
}

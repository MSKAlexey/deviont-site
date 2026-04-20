import {Grid, Stack} from '@sanity/ui'
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

export default function HeroTextConfigInput(props) {
  const contentMember = getFieldMember(props.members, 'content')
  const fontFamilyMember = getFieldMember(props.members, 'fontFamily')
  const fontWeightMember = getFieldMember(props.members, 'fontWeight')
  const fontSizeMember = getFieldMember(props.members, 'fontSize')

  return (
    <Stack space={4}>
      <div className="heroTextConfigInputContent">
        <style>{`
          .heroTextConfigInputContent [data-testid='pt-editor'][data-fullscreen='false'] {
            min-height: calc(1.67em + 12px) !important;
            height: calc(6.33em + 12px) !important;
          }
        `}</style>
        {renderMember(props, contentMember)}
      </div>

      <Grid columns={[1, 1, 3]} gap={3} style={{alignItems: 'end'}}>
        {renderMember(props, fontFamilyMember)}
        {renderMember(props, fontWeightMember)}
        {renderMember(props, fontSizeMember)}
      </Grid>
    </Stack>
  )
}

import {Stack} from '@sanity/ui'
import {ObjectInputMember} from 'sanity'

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

export default function CardsBlockItemInput(props) {
  const members = props.members || []
  const memberNames = new Set(['titleContent', 'textContent', 'service', 'details', 'image'])

  const titleContentMember = getFieldMember(members, 'titleContent')
  const textContentMember = getFieldMember(members, 'textContent')
  const serviceMember = getFieldMember(members, 'service')
  const detailsMember = getFieldMember(members, 'details')
  const imageMember = getFieldMember(members, 'image')

  const remainingMembers = members.filter(
    (member) => member.kind !== 'field' || !memberNames.has(member.name)
  )

  return (
    <Stack space={4}>
      {renderMember(props, titleContentMember)}
      {renderMember(props, textContentMember)}
      {renderMember(props, serviceMember)}
      {renderMember(props, detailsMember)}
      {renderMember(props, imageMember)}

      {remainingMembers.map((member, index) => (
        <div key={member.field?.name || member.name || member.index || index}>
          {renderMember(props, member)}
        </div>
      ))}
    </Stack>
  )
}

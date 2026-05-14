import {Stack} from '@sanity/ui'
import {ObjectInputMember} from 'sanity'

const sectionTitleFields = [
  {titleName: 'whenNeededTitle', contentName: 'whenNeededItems'},
  {titleName: 'includedTitle', contentName: 'includedItems'},
  {titleName: 'examplesTitle', contentName: 'examples'},
  {titleName: 'configurationsTitle', contentName: 'configurations'},
  {titleName: 'workflowTitle', contentName: 'workflowSteps'},
  {titleName: 'tasksTitle', contentName: 'taskItems'},
  {titleName: 'estimateRequirementsTitle', contentName: 'estimateRequirements'},
  {titleName: 'faqTitle', contentName: 'faqItems'},
]

function getFieldMember(members = [], name) {
  return members.find((member) => member.kind === 'field' && member.name === name)
}

function getMemberName(member) {
  return member?.kind === 'field' ? member.name : undefined
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

export default function ServiceDocumentInput(props) {
  const members = props.members || []
  const titleFieldNames = new Set(sectionTitleFields.map((section) => section.titleName))
  const sectionByContentName = new Map(
    sectionTitleFields.map((section) => [section.contentName, section])
  )

  return (
    <Stack space={5}>
      <style>{`
        .serviceDocumentSectionGroup {
          border: 1px solid var(--card-border-color, #2f3548);
          border-radius: 6px;
          padding: 16px;
        }
      `}</style>

      {members.map((member, index) => {
        const memberName = getMemberName(member)

        if (memberName && titleFieldNames.has(memberName)) {
          return null
        }

        const section = memberName ? sectionByContentName.get(memberName) : null

        if (section) {
          const titleMember = getFieldMember(members, section.titleName)

          return (
            <div className="serviceDocumentSectionGroup" key={memberName || index}>
              <Stack space={4}>
                {renderInputOnlyMember(props, titleMember)}
                {renderInputOnlyMember(props, member)}
              </Stack>
            </div>
          )
        }

        return (
          <div key={memberName || member?.key || index}>
            {renderMember(props, member)}
          </div>
        )
      })}
    </Stack>
  )
}

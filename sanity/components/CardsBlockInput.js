import {Box, Card, Stack, Text} from '@sanity/ui'
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

function renderTextGroup(props, fieldMember, typographyMember) {
  if (!fieldMember && !typographyMember) {
    return null
  }

  return (
    <Stack space={3}>
      {renderMember(props, fieldMember)}
      {typographyMember ? <Box paddingLeft={3}>{renderMember(props, typographyMember)}</Box> : null}
    </Stack>
  )
}

export default function CardsBlockInput(props) {
  const members = props.members || []
  const memberNames = new Set()

  const adminTitleMember = getFieldMember(members, 'adminTitle')
  const contentDocumentMember = getFieldMember(members, 'contentDocument')
  const titleMember = getFieldMember(members, 'title')
  const titleTypographyMember = getFieldMember(members, 'titleTypography')
  const subtitleMember = getFieldMember(members, 'subtitle')
  const subtitleTypographyMember = getFieldMember(members, 'subtitleTypography')
  const itemsMember = getFieldMember(members, 'items')
  const cardTitleTypographyMember = getFieldMember(members, 'cardTitleTypography')
  const cardTextTypographyMember = getFieldMember(members, 'cardTextTypography')
  const detailTypographyMember = getFieldMember(members, 'detailTypography')
  const isActiveMember = getFieldMember(members, 'isActive')

  ;[
    'adminTitle',
    'contentDocument',
    'title',
    'titleTypography',
    'subtitle',
    'subtitleTypography',
    'items',
    'cardTitleTypography',
    'cardTextTypography',
    'detailTypography',
    'isActive',
  ].forEach((name) => memberNames.add(name))

  const remainingMembers = members.filter(
    (member) => member.kind !== 'field' || !memberNames.has(member.name)
  )

  return (
    <Stack space={5}>
      {renderMember(props, adminTitleMember)}
      {renderMember(props, contentDocumentMember)}

      {renderTextGroup(props, titleMember, titleTypographyMember)}
      {renderTextGroup(props, subtitleMember, subtitleTypographyMember)}

      {renderMember(props, itemsMember)}

      {cardTitleTypographyMember || cardTextTypographyMember || detailTypographyMember ? (
        <Card padding={4} radius={2} border>
          <Stack space={4}>
            <Text size={1} weight="semibold">
              Настройки текста карточек
            </Text>
            {renderMember(props, cardTitleTypographyMember)}
            {renderMember(props, cardTextTypographyMember)}
            {renderMember(props, detailTypographyMember)}
          </Stack>
        </Card>
      ) : null}

      {renderMember(props, isActiveMember)}

      {remainingMembers.map((member, index) => (
        <div key={member.field?.name || member.name || member.index || index}>
          {renderMember(props, member)}
        </div>
      ))}
    </Stack>
  )
}

import {Stack, Text} from '@sanity/ui'

export default function PlainTextConfigField(props) {
  return (
    <Stack space={3}>
      {props.title ? (
        <Text as="label" htmlFor={props.inputId} size={1} weight="semibold">
          {props.title}
        </Text>
      ) : null}
      {props.description ? (
        <Text muted size={1}>
          {props.description}
        </Text>
      ) : null}
      {props.children}
    </Stack>
  )
}

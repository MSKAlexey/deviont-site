import {useState} from 'react'
import {TextInput} from '@sanity/ui'
import {PatchEvent, set, unset} from 'sanity'

export default function ServiceSectionTitleInput(props) {
  const {onChange, readOnly, schemaType, value} = props
  const fallbackTitle = schemaType?.options?.fallbackTitle || ''
  const fieldValue = typeof value === 'string' ? value : ''
  const [draftValue, setDraftValue] = useState(null)
  const inputValue = draftValue === null ? fieldValue || fallbackTitle : draftValue

  return (
    <TextInput
      value={inputValue}
      readOnly={readOnly}
      placeholder={fallbackTitle}
      onFocus={() => setDraftValue(fieldValue || fallbackTitle)}
      onBlur={() => setDraftValue(null)}
      onChange={(event) => {
        const nextValue = event.currentTarget.value

        setDraftValue(nextValue)
        onChange(
          PatchEvent.from(
            nextValue.trim().length > 0 && nextValue !== fallbackTitle
              ? set(nextValue)
              : unset()
          )
        )
      }}
    />
  )
}

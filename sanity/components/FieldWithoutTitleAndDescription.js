export default function FieldWithoutTitleAndDescription(props) {
  return props.renderDefault({
    ...props,
    title: undefined,
    description: undefined,
  })
}

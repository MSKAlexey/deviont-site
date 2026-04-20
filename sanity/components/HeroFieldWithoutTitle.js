export default function HeroFieldWithoutTitle(props) {
  return props.renderDefault({
    ...props,
    title: undefined,
  })
}

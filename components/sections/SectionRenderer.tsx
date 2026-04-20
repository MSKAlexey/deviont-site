import CardsBlockSection from './CardsBlockSection'
import ContactsSection from './ContactsSection'
import CtaSection from './CtaSection'
import HeroSection from './HeroSection'
import ListBlockSection from './ListBlockSection'
import TextBlockSection from './TextBlockSection'
import {resolveSectionId} from './sectionIds'

const blockRegistry = {
  heroBlock: {
    component: HeroSection,
    selectProps: ({section, sectionId, settings}) => ({
      block: section,
      sectionId,
      settings,
    }),
  },
  textBlock: {
    component: TextBlockSection,
    selectProps: ({section, sectionId}) => ({
      block: section,
      sectionId,
    }),
  },
  cardsBlock: {
    component: CardsBlockSection,
    selectProps: ({section, sectionId}) => ({
      block: section,
      sectionId,
    }),
  },
  listBlock: {
    component: ListBlockSection,
    selectProps: ({section, sectionId}) => ({
      block: section,
      sectionId,
    }),
  },
  ctaBlock: {
    component: CtaSection,
    selectProps: ({section, sectionId, settings}) => ({
      block: section,
      sectionId,
      settings,
    }),
  },
  contactBlock: {
    component: ContactsSection,
    selectProps: ({section, sectionId, settings}) => ({
      block: section,
      sectionId,
      settings,
    }),
  },
}

export default function SectionRenderer({sections, ...data}) {
  const resolvedSections = Array.isArray(sections)
    ? sections.filter((section) => section?.isActive !== false)
    : []

  return resolvedSections.map((section, index) => {
    const sectionId = resolveSectionId(section)
    const blockConfig = section?._type ? blockRegistry[section._type] : null

    if (blockConfig) {
      const BlockComponent = blockConfig.component

      return (
        <BlockComponent
          key={section?._key || `${section._type}-${index}`}
          section={section}
          {...blockConfig.selectProps({section, sectionId, ...data})}
        />
      )
    }
    return null
  })
}

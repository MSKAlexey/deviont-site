'use client'

import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {resolveSectionId} from './sections/sectionIds'
import {urlFor} from '../sanity/lib/image'

const hiddenBlockTypes = new Set(['heroBlock', 'ctaBlock', 'contactBlock'])
const hiddenLegacySectionTypes = new Set(['hero', 'cta', 'contacts'])

const fallbackSectionTitles = {
  process: 'Порядок работы',
  services: 'Услуги 1С',
  support: 'Сопровождение 1С',
  advantages: 'Почему вам можно доверять',
  products: 'Решения 1С',
  tasks: 'Примеры задач',
  knowledge: 'Статьи',
  articles: 'Статьи',
  contacts: 'Контакты',
}

function resolveNavigationTitle(section) {
  if (typeof section?.title === 'string' && section.title.trim()) {
    return section.title.trim()
  }

  const sectionType = section?.sectionType || section?.sectionKey

  return sectionType ? fallbackSectionTitles[sectionType] || null : null
}

function buildNavigationItems(sections) {
  if (!Array.isArray(sections)) {
    return []
  }

  const seenSectionIds = new Set()

  return sections
    .filter((section) => section && section.isActive !== false && section.isVisible !== false)
    .map((section) => {
      const sectionType = section?.sectionType || section?.sectionKey

      if (hiddenBlockTypes.has(section?._type) || hiddenLegacySectionTypes.has(sectionType)) {
        return null
      }

      const sectionId = resolveSectionId(section)
      const title = resolveNavigationTitle(section)

      if (!sectionId || !title || seenSectionIds.has(sectionId)) {
        return null
      }

      seenSectionIds.add(sectionId)

      return {
        href: `#${sectionId}`,
        title,
      }
    })
    .filter(Boolean)
}

function LogoLink({settings, companyName, subtitle}) {
  const pathname = usePathname()

  const handleClick = (event) => {
    if (pathname === '/') {
      event.preventDefault()
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  const logoSrc = settings?.logo
    ? urlFor(settings.logo).width(180).height(180).url()
    : '/logo-deviont.png'

  return (
    <Link href="/" onClick={handleClick} className="brand brandLink" aria-label="На главную">
      <Image
        src={logoSrc}
        alt={companyName}
        className="brandImage"
        width={72}
        height={72}
        sizes="72px"
      />
      <div>
        <div className="brandTitle">{companyName}</div>
        <div className="brandSubtitle">{subtitle}</div>
      </div>
    </Link>
  )
}

export default function HeaderClient({settings, sections}) {
  const navigationItems = buildNavigationItems(sections)

  return (
    <header className="header">
      <div className="container headerInner">
        <LogoLink
          settings={settings}
          companyName={settings?.companyName || 'Интегратор 1С'}
          subtitle={settings?.subtitle || 'Интегратор 1С'}
        />

        <nav className="nav">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.title}
            </a>
          ))}
        </nav>

        <a className="phone" href={`tel:${settings?.phone || '+79990000000'}`}>
          {settings?.phone || '+7 (999) 000-00-00'}
        </a>
      </div>
    </header>
  )
}

'use client'

import {useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {urlFor} from '../sanity/lib/image'
import {resolveSectionId} from './sections/sectionIds'

const hiddenBlockTypes = new Set(['heroBlock', 'ctaBlock', 'contactBlock'])
const hiddenLegacySectionTypes = new Set(['hero', 'cta', 'contacts'])
const routedSectionTypes = new Set(['knowledge', 'articles', 'services'])
const servicesNavigationItem = {
  href: '/services',
  title: 'Услуги 1С',
}
const articlesNavigationItem = {
  href: '/articles',
  title: 'Статьи',
}
const staticNavigationItems = [servicesNavigationItem, articlesNavigationItem]
const staticNavigationTitles = new Set(
  staticNavigationItems.map((item) => item.title.trim().toLowerCase())
)

const fallbackSectionTitles = {
  process: 'Порядок работы',
  services: 'Услуги 1С',
  support: 'Регулярное сопровождение 1С',
  advantages: 'Почему нам можно доверять',
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

      if (
        hiddenBlockTypes.has(section?._type) ||
        hiddenLegacySectionTypes.has(sectionType) ||
        routedSectionTypes.has(sectionType)
      ) {
        return null
      }

      const sectionId = resolveSectionId(section)
      const title = resolveNavigationTitle(section)

      if (
        !sectionId ||
        !title ||
        seenSectionIds.has(sectionId) ||
        staticNavigationTitles.has(title.trim().toLowerCase())
      ) {
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

function normalizePhoneHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function LogoLink({settings, companyName, subtitle}) {
  const pathname = usePathname()

  const handleClick = (event) => {
    if (pathname === '/') {
      event.preventDefault()
      window.history.pushState(null, '', '/')
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
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sectionNavigationItems = buildNavigationItems(sections).map((item) => ({
    ...item,
    href: pathname === '/' ? item.href : `/${item.href}`,
  }))
  const servicesNavigationHref = pathname === '/' ? '#services' : '/#services'
  const navigationItems = [
    {
      ...servicesNavigationItem,
      href: servicesNavigationHref,
    },
    ...sectionNavigationItems,
    articlesNavigationItem,
  ]
  const phone = settings?.phone || '+7 (999) 000-00-00'

  return (
    <header className="header">
      <div className="container headerInner">
        <LogoLink
          settings={settings}
          companyName={settings?.companyName || 'ДЕВИОНТ'}
          subtitle={settings?.subtitle || 'интегратор 1С'}
        />

        <button
          className="menuToggle"
          type="button"
          aria-controls="site-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-navigation" className={`nav${isMenuOpen ? ' navOpen' : ''}`}>
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.title}
            </a>
          ))}
        </nav>

        <a className="phone" href={normalizePhoneHref(phone)}>
          {phone}
        </a>
      </div>
    </header>
  )
}

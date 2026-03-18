'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {urlFor} from '../sanity/lib/image'

function LogoLink({settings, companyName, subtitle}) {
  const pathname = usePathname()

  const handleClick = (e) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="brand brandLink"
      aria-label="На главную"
    >
      <img
        src={
          settings?.logo
            ? urlFor(settings.logo).width(180).url()
            : '/logo-deviont.png'
        }
        alt={companyName}
        className="brandImage"
      />
      <div>
        <div className="brandTitle">{companyName}</div>
        <div className="brandSubtitle">{subtitle}</div>
      </div>
    </Link>
  )
}

export default function HeaderClient({settings}) {
  return (
    <header className="header">
      <div className="container headerInner">
        <LogoLink
          settings={settings}
          companyName={settings?.companyName || 'ДЕВИОНТ'}
          subtitle={settings?.subtitle || 'интегратор 1С в Москве'}
        />

        <nav className="nav">
          <a href="#services">Услуги</a>
          <a href="#products">Решения 1С</a>
          <a href="#knowledge">База знаний</a>
          <a href="#contacts">Контакты</a>
        </nav>

        <a className="phone" href={`tel:${settings?.phone || '+79995413653'}`}>
          {settings?.phone || '+7 (999) 541-36-53'}
        </a>
      </div>
    </header>
  )
}
import HeaderClient from '../components/HeaderClient'
import SectionRenderer from '../components/sections/SectionRenderer'
import {client} from '../sanity/lib/client'
import {siteSettingsQuery} from '../sanity/lib/queries'

export const revalidate = 60

function Footer({settings}) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div>{`© ${year} ${settings?.companyName || 'Интегратор 1С'}`}</div>
        <div>{settings?.subtitle || 'Интегратор 1С'}</div>
      </div>
    </footer>
  )
}

function normalizeConfiguredSections(settings) {
  if (!Array.isArray(settings?.sections)) {
    return []
  }

  return settings.sections
    .map((section) => {
      if (!section) {
        return null
      }

      if (section.isActive === false) {
        return null
      }

      if (section._type === 'reference') {
        if (section.contentBlock) {
          section = {
            ...section.contentBlock,
            _key: section._key || section.contentBlock._id,
          }
        } else {
          return null
        }
      }

      if (typeof section._type === 'string' && section._type.endsWith('Item')) {
        return {
          ...section,
          _type: section._type.replace(/Item$/, ''),
        }
      }

      return section
    })
    .filter(Boolean)
}

export default async function Page() {
  const settings = await client.fetch(siteSettingsQuery)
  const sections = normalizeConfiguredSections(settings)

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main>
        <SectionRenderer sections={sections} settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  )
}

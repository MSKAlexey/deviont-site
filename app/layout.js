import './globals.css'
import {client} from '../sanity/lib/client'
import {urlFor} from '../sanity/lib/image'

export const revalidate = 60

const metadataBase = {
  title: 'Внедрение и доработка 1С под задачи бизнеса',
  description:
    'Настройка, доработка и сопровождение 1С с учетом реальных процессов компании.',
}

const metadataQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  tabTitle,
  "heroMeta": coalesce(
    sections[_type in ["heroBlock", "heroBlockItem"] && isActive != false][0].contentDocument->{
      tabTitle,
      favicon{
        ...,
        asset
      }
    },
    sections[_type in ["heroBlock", "heroBlockItem"] && isActive != false][0]{
      tabTitle,
      favicon{
        ...,
        asset
      }
    }
  )
}`

export async function generateMetadata() {
  const settings = await client.fetch(metadataQuery)
  const tabTitle = settings?.tabTitle || settings?.heroMeta?.tabTitle || metadataBase.title

  if (!settings?.heroMeta?.favicon?.asset) {
    return {
      ...metadataBase,
      title: tabTitle,
    }
  }

  return {
    ...metadataBase,
    title: tabTitle,
    icons: {
      icon: urlFor(settings.heroMeta.favicon).width(64).height(64).url(),
    },
  }
}

export default function RootLayout({children}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

import type {MetadataRoute} from 'next'

const siteUrl = 'https://deviont.ru'

const routes = [
  {path: '/', changeFrequency: 'weekly', priority: 1},
  {path: '/services', changeFrequency: 'weekly', priority: 0.9},
  {path: '/services/dorabotka-1c', changeFrequency: 'weekly', priority: 0.9},
  {path: '/services/soprovozhdenie-1c', changeFrequency: 'weekly', priority: 0.85},
  {path: '/services/vnedrenie-1c', changeFrequency: 'weekly', priority: 0.85},
  {path: '/services/nastroyka-1c', changeFrequency: 'weekly', priority: 0.8},
  {path: '/services/integraciya-1c-s-saytom', changeFrequency: 'weekly', priority: 0.8},
  {path: '/services/markirovka-1c', changeFrequency: 'weekly', priority: 0.8},
  {path: '/services/otchety-1c', changeFrequency: 'weekly', priority: 0.8},
  {path: '/articles', changeFrequency: 'weekly', priority: 0.7},
] satisfies Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}>

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}

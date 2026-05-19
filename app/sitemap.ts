import type {MetadataRoute} from 'next'
import {client} from '../sanity/lib/client'
import {articlesSitemapQuery} from '../sanity/lib/queries'

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

function getLastModified(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  let articles: Array<{
    slug?: string | null
    updatedAt?: string | null
    publishedAt?: string | null
    _updatedAt?: string | null
  }> = []

  try {
    articles = await client.fetch(articlesSitemapQuery)
  } catch {
    articles = []
  }

  const staticRoutes = routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const articleRoutes = articles
    .filter((article) => article?.slug)
    .map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified:
        getLastModified(article.updatedAt) ||
        getLastModified(article.publishedAt) ||
        getLastModified(article._updatedAt) ||
        lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [...staticRoutes, ...articleRoutes]
}

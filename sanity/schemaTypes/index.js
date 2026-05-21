import {siteSettings} from './siteSettings.js'
import {service} from './service.js'
import {product} from './product.js'
import {article} from './article.js'
import {articleRevision} from './articleRevision.js'
import {taskItem} from './taskItem.js'
import {pageSection} from './pageSection.js'
import {
  cardsBlock,
  cardsBlockItem,
  cardsBlockDocument,
  certificatesBlock,
  certificatesBlockDocument,
  contactBlock,
  contactBlockDocument,
  ctaBlock,
  ctaBlockDocument,
  heroBlock,
  heroBlockDocument,
  listBlock,
  listBlockDocument,
  textBlock,
  textBlockDocument,
} from './pageBuilderBlocks.js'

export const schemaTypes = [
  siteSettings,
  service,
  product,
  article,
  articleRevision,
  taskItem,
  cardsBlockItem,
  heroBlock,
  textBlock,
  cardsBlock,
  certificatesBlock,
  listBlock,
  ctaBlock,
  contactBlock,
  heroBlockDocument,
  textBlockDocument,
  cardsBlockDocument,
  certificatesBlockDocument,
  listBlockDocument,
  ctaBlockDocument,
  contactBlockDocument,
  pageSection,
]

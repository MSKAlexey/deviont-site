import {siteSettings} from './siteSettings.js'
import {service} from './service.js'
import {product} from './product.js'
import {article} from './article.js'
import {taskItem} from './taskItem.js'
import {pageSection} from './pageSection.js'
import {
  cardsBlock,
  cardsBlockItem,
  cardsBlockDocument,
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
  taskItem,
  cardsBlockItem,
  heroBlock,
  textBlock,
  cardsBlock,
  listBlock,
  ctaBlock,
  contactBlock,
  heroBlockDocument,
  textBlockDocument,
  cardsBlockDocument,
  listBlockDocument,
  ctaBlockDocument,
  contactBlockDocument,
  pageSection,
]

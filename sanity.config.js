'use client'

import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './sanity/schemaTypes/index.js'
import {structure} from './sanity/structure.js'
import {dataset, projectId} from './sanity/env.js'
import {createDeleteCardsBlockDocumentAction} from './sanity/documentActions/deleteCardsBlockDocumentAction.js'
import {
  SaveArticleRevisionAction,
  RestoreArticleRevisionAction,
  createPublishArticleWithRevisionAction,
} from './sanity/documentActions/articleRevisionActions.js'

function resolveDocumentActions(previousActions, context) {
  if (context.schemaType === 'article') {
    return [
      ...previousActions.map((action) =>
        action?.action === 'publish' ? createPublishArticleWithRevisionAction(action) : action
      ),
      SaveArticleRevisionAction,
    ]
  }

  if (context.schemaType === 'articleRevision') {
    return [...previousActions, RestoreArticleRevisionAction]
  }

  if (context.schemaType === 'cardsBlockDocument') {
    return previousActions.map((action) =>
      action?.action === 'delete' ? createDeleteCardsBlockDocumentAction(action) : action
    )
  }

  return previousActions
}

function resolveNewDocumentOptions(previousOptions) {
  return previousOptions.filter(
    (option) =>
      option.templateId !== 'pageSection' &&
      option.schemaType !== 'pageSection' &&
      option.schemaType !== 'articleRevision'
  )
}

export default defineConfig({
  name: 'default',
  title: 'DEVIONT Studio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({structure}),
    visionTool(),
  ],
  document: {
    actions: resolveDocumentActions,
    newDocumentOptions: resolveNewDocumentOptions,
  },
  schema: {
    types: schemaTypes,
  },
})

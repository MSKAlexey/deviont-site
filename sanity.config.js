'use client'

import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './sanity/schemaTypes/index.js'
import {structure} from './sanity/structure.js'
import {createDeleteCardsBlockDocumentAction} from './sanity/documentActions/deleteCardsBlockDocumentAction.js'

function resolveDocumentActions(previousActions, context) {
  if (context.schemaType !== 'cardsBlockDocument') {
    return previousActions
  }

  return previousActions.map((action) =>
    action?.action === 'delete' ? createDeleteCardsBlockDocumentAction(action) : action
  )
}

function resolveNewDocumentOptions(previousOptions) {
  return previousOptions.filter((option) => option.templateId !== 'pageSection' && option.schemaType !== 'pageSection')
}

export default defineConfig({
  name: 'default',
  title: 'DEVIONT Studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
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

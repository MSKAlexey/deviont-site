import {NextStudio} from 'next-sanity/studio'
import config from '../../../sanity.config'

export const dynamic = 'force-static'
export {metadata, viewport} from 'next-sanity/studio'

export default function StudioPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #sanity #document-panel-scroller h1:first-of-type {
              font-size: 1.125rem !important;
              line-height: 1.25 !important;
            }
          `,
        }}
      />
      <NextStudio config={config} />
    </>
  )
}

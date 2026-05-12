'use client'

import type {ReactNode} from 'react'
import {openContactModal} from './ContactModal'

type ContactModalTriggerProps = {
  children: ReactNode
  className?: string
}

export default function ContactModalTrigger({
  children,
  className = 'btnPrimary',
}: ContactModalTriggerProps) {
  return (
    <button type="button" className={className} onClick={openContactModal}>
      {children}
    </button>
  )
}

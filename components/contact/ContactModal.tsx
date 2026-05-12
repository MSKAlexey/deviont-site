'use client'

import {useEffect, useRef, useState} from 'react'
import type {ReactNode} from 'react'
import ContactForm from './ContactForm'

export const contactModalEventName = 'deviont:open-contact-modal'

type ContactModalProviderProps = {
  children: ReactNode
}

export function openContactModal() {
  window.dispatchEvent(new Event(contactModalEventName))
}

export default function ContactModalProvider({children}: ContactModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleOpenModal() {
      setIsOpen(true)
    }

    window.addEventListener(contactModalEventName, handleOpenModal)

    return () => {
      window.removeEventListener(contactModalEventName, handleOpenModal)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {children}

      {isOpen ? (
        <div
          className="contactModalOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <div
            className="contactModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <button
              type="button"
              className="contactModalClose"
              aria-label="Закрыть окно"
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <div className="contactModalHead">
              <h2 id="contact-modal-title">Обсудим задачу</h2>
              <p>Оставьте контакты и кратко опишите, что нужно сделать.</p>
            </div>

            <ContactForm
              id="contact-modal-form"
              className="contactForm contactModalForm"
              buttonText="Отправить заявку"
              captchaMode="math"
              generateCaptchaOnMount
              commentLabel="Комментарий / описание задачи"
              commentPlaceholder="Комментарий / описание задачи"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

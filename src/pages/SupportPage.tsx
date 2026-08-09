import { useState, type FormEvent } from 'react'

import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import {
  accountPrimaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
} from '@/pages/account/accountStyles'
import { UserSectionPage } from '@/pages/UserSectionPage'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'

const SUPPORT_PHONE = '1 (800) 555-0148'

const messageTextareaClassName =
  featureMetadataInputClassName + ' min-h-[10rem] resize-y py-2 leading-normal'

function SupportPageContent() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubject('')
    setBody('')
  }

  return (
    <div className="mx-auto mt-16 flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-label="Customer service">
        <p className={accountSectionDescClass}>
          Contact OcuMap support at{' '}
          <a
            href={`tel:+18005550148`}
            className="font-bold text-fg-highlight hover:text-fg focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
          >
            {SUPPORT_PHONE}
          </a>
          , or send us a message below.
        </p>
      </section>

      <section className={accountSectionClass} aria-labelledby="support-message">
        <h2 id="support-message" className="sr-only">
          Send a message
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block min-w-0">
            <span className={authFormLabelClass}>Subject</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="How can we help?"
              required
            />
          </label>
          <label className="block min-w-0">
            <span className={authFormLabelClass}>Message</span>
            <textarea
              className={messageTextareaClassName}
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us what’s going on…"
              required
            />
          </label>
          <div className="flex justify-end">
            <button type="submit" className={accountPrimaryButtonClass}>
              Send message
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export function SupportPage() {
  return (
    <UserSectionPage title="We're here to support you.">
      <SupportPageContent />
    </UserSectionPage>
  )
}

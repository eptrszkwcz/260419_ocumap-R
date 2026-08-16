import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LockClosedIcon } from '@heroicons/react/24/outline'

import { PencilIcon } from '@/components/overlayControlIcons'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuth } from '@/context/AuthContext'
import { getMockAccountProfile } from '@/data/mockAccountData'
import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import { ReplaceProfilePhotoModal } from '@/pages/account/ReplaceProfilePhotoModal'
import {
  accountFormActionsClass,
  accountFormGridClass,
  accountPrimaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import {
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'

const lockedInputClassName =
  featureMetadataInputClassName + ' bg-area-highlight/40 cursor-not-allowed pr-9 opacity-70'

type LockedInputFieldProps = {
  label: string
  value: string
  type?: 'text' | 'email'
  autoComplete?: string
  className?: string
}

function LockedInputField({
  label,
  value,
  type = 'text',
  autoComplete,
  className = '',
}: LockedInputFieldProps) {
  return (
    <label className={'block min-w-0 ' + className}>
      <span className={authFormLabelClass}>{label}</span>
      <div className="relative">
        <input
          type={type}
          className={lockedInputClassName}
          value={value}
          readOnly
          aria-readonly="true"
          autoComplete={autoComplete}
        />
        <LockClosedIcon
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-muted"
          aria-hidden
        />
      </div>
    </label>
  )
}

type AccountProfilePanelProps = {
  displayName: string
  email: string
  photoUrl?: string
  organization: string
}

export function AccountProfilePanel({
  displayName,
  email,
  photoUrl,
  organization,
}: AccountProfilePanelProps) {
  const { user } = useAuth()
  const profile = getMockAccountProfile(user?.planId)
  const initialJobTitle = profile.jobTitle

  const [savedName, setSavedName] = useState(displayName)
  const [savedJobTitle, setSavedJobTitle] = useState<string>(initialJobTitle)
  const [savedPhotoUrl, setSavedPhotoUrl] = useState(photoUrl)

  const [name, setName] = useState(displayName)
  const [jobTitle, setJobTitle] = useState<string>(initialJobTitle)
  const org = organization || profile.organization
  const username = profile.username
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(photoUrl)
  const [replacePhotoOpen, setReplacePhotoOpen] = useState(false)
  const uploadedPhotoUrlRef = useRef<string | undefined>(undefined)

  const isDirty =
    name !== savedName ||
    jobTitle !== savedJobTitle ||
    profilePhotoUrl !== savedPhotoUrl

  useEffect(() => {
    setName(displayName)
    setSavedName(displayName)
    setProfilePhotoUrl(photoUrl)
    setSavedPhotoUrl(photoUrl)
    if (uploadedPhotoUrlRef.current != null) {
      URL.revokeObjectURL(uploadedPhotoUrlRef.current)
      uploadedPhotoUrlRef.current = undefined
    }
  }, [displayName, photoUrl])

  useEffect(() => {
    return () => {
      if (uploadedPhotoUrlRef.current != null) {
        URL.revokeObjectURL(uploadedPhotoUrlRef.current)
      }
    }
  }, [])

  const handleReplacePhoto = (file: File) => {
    if (uploadedPhotoUrlRef.current != null) {
      URL.revokeObjectURL(uploadedPhotoUrlRef.current)
    }
    const nextUrl = URL.createObjectURL(file)
    uploadedPhotoUrlRef.current = nextUrl
    setProfilePhotoUrl(nextUrl)
    setReplacePhotoOpen(false)
  }

  const handleCancel = () => {
    setName(savedName)
    setJobTitle(savedJobTitle)
    if (uploadedPhotoUrlRef.current != null) {
      URL.revokeObjectURL(uploadedPhotoUrlRef.current)
      uploadedPhotoUrlRef.current = undefined
    }
    setProfilePhotoUrl(savedPhotoUrl)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavedName(name)
    setSavedJobTitle(jobTitle)
    setSavedPhotoUrl(profilePhotoUrl)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-label="Profile photo">
        <div className="group relative inline-flex w-fit">
          <UserAvatar photoUrl={profilePhotoUrl} size={80} />
          <button
            type="button"
            className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-stroke bg-panel text-fg-muted opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-fg-highlight focus-visible:text-fg-highlight focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
            aria-label="Edit profile photo"
            onClick={() => setReplacePhotoOpen(true)}
          >
            <PencilIcon />
          </button>
        </div>
      </section>

      {replacePhotoOpen ? (
        <ReplaceProfilePhotoModal
          onClose={() => setReplacePhotoOpen(false)}
          onReplace={handleReplacePhoto}
        />
      ) : null}

      <section className={accountSectionClass} aria-labelledby="profile-details">
        <div>
          <h2 id="profile-details" className={accountSectionTitleClass}>
            Profile details
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Update how you appear across OcuMap.
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className={accountFormGridClass}>
            <label className="block min-w-0">
              <span className={authFormLabelClass}>Name</span>
              <input
                type="text"
                className={featureMetadataInputClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block min-w-0">
              <span className={authFormLabelClass}>Job title / role</span>
              <input
                type="text"
                className={featureMetadataInputClassName}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                autoComplete="organization-title"
              />
            </label>
            <LockedInputField
              label="Organization"
              value={org}
              autoComplete="organization"
              className="sm:col-span-2"
            />
          </div>

          <div className="border-t border-stroke" role="separator" aria-hidden />

          <div className={accountFormGridClass}>
            <LockedInputField label="Username" value={username} autoComplete="username" />
            <LockedInputField label="Email" value={email} type="email" autoComplete="email" />
          </div>
          {isDirty ? (
            <div className={accountFormActionsClass + ' justify-end'}>
              <button type="button" onClick={handleCancel} className={featureMetadataFooterCancelButtonClass}>
                Cancel
              </button>
              <button type="submit" className={accountPrimaryButtonClass}>
                Save changes
              </button>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  )
}

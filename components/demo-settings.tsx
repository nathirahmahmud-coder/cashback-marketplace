'use client'

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Check, Copy, ImagePlus, Palette, RotateCcw, Settings2, X } from 'lucide-react'

export const THEME_PRESETS = {
  default: { name: 'Default Showcase', primary: '#3457E8', secondary: '#16B8AD', navy: '#142A55', soft: '#EDF2FF' },
  purple: { name: 'Purple Wallet', primary: '#7046D8', secondary: '#B58CF3', navy: '#351C63', soft: '#F2EDFF' },
  green: { name: 'Green Digital Bank', primary: '#087C55', secondary: '#B5DF56', navy: '#154B3C', soft: '#EAF7EE' },
  orange: { name: 'Orange Wallet', primary: '#C65314', secondary: '#F4B542', navy: '#4C2D20', soft: '#FFF3E6' },
} as const

export type PresetThemeId = keyof typeof THEME_PRESETS
export type ThemeId = PresetThemeId | 'custom'

export type BrandSettings = {
  themeId: ThemeId
  baseThemeId: PresetThemeId
  partnerName: string
  cashbackName: string
  primary: string
  secondary: string
  logoDataUrl: string
}

export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  themeId: 'default',
  baseThemeId: 'default',
  partnerName: 'Perks',
  cashbackName: 'Cashback',
  primary: THEME_PRESETS.default.primary,
  secondary: THEME_PRESETS.default.secondary,
  logoDataUrl: '',
}

export const BRAND_SETTINGS_STORAGE_KEY = 'cashback-demo-brand-settings'

export function isPresetThemeId(value: string | null): value is PresetThemeId {
  return value !== null && Object.hasOwn(THEME_PRESETS, value)
}

export function getPresetBrandSettings(themeId: PresetThemeId, current: BrandSettings = DEFAULT_BRAND_SETTINGS): BrandSettings {
  const theme = THEME_PRESETS[themeId]
  return { ...current, themeId, baseThemeId: themeId, primary: theme.primary, secondary: theme.secondary }
}

export function readBrandSettings(value: string | null): BrandSettings | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<BrandSettings>
    const baseThemeId: PresetThemeId = typeof parsed.baseThemeId === 'string' && isPresetThemeId(parsed.baseThemeId) ? parsed.baseThemeId : 'default'
    const themeId: ThemeId = parsed.themeId === 'custom' ? 'custom' : typeof parsed.themeId === 'string' && isPresetThemeId(parsed.themeId) ? parsed.themeId : 'default'
    const primary = typeof parsed.primary === 'string' && /^#[\da-f]{6}$/i.test(parsed.primary) ? parsed.primary : THEME_PRESETS[baseThemeId].primary
    const secondary = typeof parsed.secondary === 'string' && /^#[\da-f]{6}$/i.test(parsed.secondary) ? parsed.secondary : THEME_PRESETS[baseThemeId].secondary
    const logoDataUrl = typeof parsed.logoDataUrl === 'string' && parsed.logoDataUrl.length <= 1_500_000 && /^data:image\/(png|jpeg|webp);base64,/i.test(parsed.logoDataUrl) ? parsed.logoDataUrl : ''

    return {
      themeId,
      baseThemeId,
      partnerName: typeof parsed.partnerName === 'string' ? parsed.partnerName.trim().slice(0, 40) || 'Perks' : 'Perks',
      cashbackName: typeof parsed.cashbackName === 'string' ? parsed.cashbackName.trim().slice(0, 30) || 'Cashback' : 'Cashback',
      primary,
      secondary,
      logoDataUrl,
    }
  } catch {
    return null
  }
}

type DemoSettingsProps = {
  settings: BrandSettings
  storageAvailable: boolean | null
  onChange: Dispatch<SetStateAction<BrandSettings>>
  onReset: () => void
  onCopyDemoLink: () => Promise<boolean>
}

export default function DemoSettings({ settings, storageAvailable, onChange, onReset, onCopyDemoLink }: DemoSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && dialog && !dialog.open) dialog.showModal()
  }, [isOpen])

  function closeDialog() {
    dialogRef.current?.close()
    setIsOpen(false)
  }

  function updateColor(key: 'primary' | 'secondary', value: string) {
    onChange({ ...settings, themeId: 'custom', [key]: value })
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    setUploadMessage('')
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadMessage('Choose a PNG, JPEG or WebP image.')
      return
    }

    if (file.size > 512 * 1024) {
      setUploadMessage('Choose an image smaller than 512 KB to keep this demo local and lightweight.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange((current) => ({ ...current, logoDataUrl: reader.result as string }))
        setUploadMessage('Logo added. It stays in this browser only.')
      } else {
        setUploadMessage('That image could not be read. Please try another file.')
      }
    }
    reader.onerror = () => setUploadMessage('That image could not be read. Please try another file.')
    reader.readAsDataURL(file)
  }

  async function copyLink() {
    setCopyMessage('')
    const copied = await onCopyDemoLink()
    setCopyMessage(copied ? 'Preset link copied. Custom branding stays on this browser.' : 'Could not copy the link in this browser.')
  }

  return (
    <>
      <div className="demo-toolbar" aria-label="Presenter controls">
        <div className="demo-toolbar-caption">
          <span className="demo-toolbar-kicker">PRESENTATION PREVIEW</span>
          <span>{storageAvailable === false ? 'Browser storage unavailable' : 'Sample data · local branding'}</span>
        </div>
        <button className="demo-settings-trigger" type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog">
          <Settings2 size={16} aria-hidden="true" />
          Demo Settings
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="demo-settings-dialog"
        aria-labelledby="demo-settings-title"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}
      >
        <div className="demo-settings-panel">
          <header className="demo-settings-header">
            <div className="demo-settings-heading-icon"><Palette size={19} aria-hidden="true" /></div>
            <div>
              <p className="demo-settings-eyebrow">PRESENTER CONTROLS</p>
              <h2 id="demo-settings-title">Demo Settings</h2>
              <p>Make this showcase feel like your wallet.</p>
            </div>
            <button className="demo-settings-close" type="button" onClick={closeDialog} aria-label="Close Demo Settings"><X size={19} /></button>
          </header>

          <section className="demo-settings-section" aria-labelledby="theme-choice-title">
            <div className="demo-settings-section-title">
              <div><h3 id="theme-choice-title">Choose a colour theme</h3><p>Updates every customer screen instantly.</p></div>
              <span className="theme-choice-count">4 themes</span>
            </div>
            <div className="theme-choice-grid" role="group" aria-label="Predefined colour themes">
              {(Object.keys(THEME_PRESETS) as PresetThemeId[]).map((themeId) => {
                const theme = THEME_PRESETS[themeId]
                const selected = settings.baseThemeId === themeId && settings.themeId !== 'custom'
                return (
                  <button
                    key={themeId}
                    className={`theme-choice ${selected ? 'theme-choice-selected' : ''}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(getPresetBrandSettings(themeId, settings))}
                  >
                    <span className="theme-choice-swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${theme.primary} 0 57%, ${theme.secondary} 57% 100%)` }} />
                    <span>{theme.name}</span>
                    {selected && <Check size={15} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="demo-settings-section" aria-labelledby="brand-fields-title">
            <div className="demo-settings-section-title">
              <div><h3 id="brand-fields-title">Partner branding</h3><p>Shown in the wallet and cashback journey.</p></div>
            </div>
            <div className="demo-settings-fields">
              <label className="demo-settings-field">
                <span>Partner display name</span>
                <input value={settings.partnerName} maxLength={40} onChange={(event) => onChange({ ...settings, partnerName: event.currentTarget.value })} placeholder="Your wallet name" />
              </label>
              <label className="demo-settings-field">
                <span>Cashback feature name</span>
                <input value={settings.cashbackName} maxLength={30} onChange={(event) => onChange({ ...settings, cashbackName: event.currentTarget.value })} placeholder="Cashback" />
              </label>
            </div>
            <div className="demo-color-row">
              <label className="demo-color-field">
                <span>Primary colour</span>
                <span className="demo-color-control"><input aria-label="Primary colour" type="color" value={settings.primary} onChange={(event) => updateColor('primary', event.currentTarget.value)} /><code>{settings.primary.toUpperCase()}</code></span>
              </label>
              <label className="demo-color-field">
                <span>Secondary colour</span>
                <span className="demo-color-control"><input aria-label="Secondary colour" type="color" value={settings.secondary} onChange={(event) => updateColor('secondary', event.currentTarget.value)} /><code>{settings.secondary.toUpperCase()}</code></span>
              </label>
            </div>
            <div className="demo-logo-row">
              <div className="demo-logo-preview">
                {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt={`${settings.partnerName} logo preview`} /> : <span aria-hidden="true">{settings.partnerName.trim().slice(0, 2).toUpperCase() || 'P'}</span>}
              </div>
              <div className="demo-logo-copy"><strong>Partner logo</strong><span>PNG, JPEG or WebP · up to 512 KB</span></div>
              <label className="demo-logo-upload" htmlFor="partner-logo-upload"><ImagePlus size={16} aria-hidden="true" /><span>{settings.logoDataUrl ? 'Replace' : 'Upload'}</span></label>
              <input className="sr-only" id="partner-logo-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} />
              {settings.logoDataUrl && <button className="demo-logo-remove" type="button" onClick={() => onChange({ ...settings, logoDataUrl: '' })} aria-label="Remove partner logo"><X size={15} /></button>}
            </div>
            {(uploadMessage || storageAvailable === false) && <p className="demo-settings-message" aria-live="polite">{storageAvailable === false ? 'This browser blocks local storage. Changes will last for this tab only.' : uploadMessage}</p>}
          </section>

          <footer className="demo-settings-footer">
            <div className="demo-settings-footer-note">
              <span>Custom branding is saved in this browser only.</span>
              {copyMessage && <span role="status">{copyMessage}</span>}
            </div>
            <div className="demo-settings-actions">
              <button className="demo-reset-button" type="button" onClick={() => { onReset(); setUploadMessage(''); setCopyMessage('') }}><RotateCcw size={15} aria-hidden="true" />Reset theme</button>
              <button className="demo-copy-button" type="button" onClick={copyLink} disabled={settings.themeId === 'custom'}><Copy size={15} aria-hidden="true" />Copy demo link</button>
            </div>
          </footer>
        </div>
      </dialog>
    </>
  )
}

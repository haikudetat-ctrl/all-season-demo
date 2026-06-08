'use client'

import { useState, useRef } from 'react'
import type { CompanyProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  profile: CompanyProfile
  onSave: (profile: CompanyProfile) => void
}

const DEFAULT_REPS = ['Chris Miller', 'Tony DiGiacomo', 'Mike Sullivan', 'Dave Reynolds']

export default function SettingsDialog({ profile, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [companyName, setCompanyName] = useState(profile.companyName)
  const [ownerName, setOwnerName] = useState(profile.ownerName)
  const [tagline, setTagline] = useState(profile.tagline)
  const [logoDataUrl, setLogoDataUrl] = useState(profile.logoDataUrl || '')
  const [reps, setReps] = useState<string[]>(profile.companyName === 'AllSeason Solar' ? DEFAULT_REPS : [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setCompanyName(profile.companyName)
    setOwnerName(profile.ownerName)
    setTagline(profile.tagline)
    setLogoDataUrl(profile.logoDataUrl || '')
    setReps(profile.companyName === 'AllSeason Solar' ? DEFAULT_REPS : [])
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    onSave({
      companyName: companyName || 'My Company',
      ownerName: ownerName || 'Owner',
      tagline: tagline || 'Operations Center',
      logoDataUrl: logoDataUrl || undefined,
    })
    setOpen(false)
  }

  function addRep() {
    setReps(prev => [...prev, ''])
  }

  function updateRep(i: number, val: string) {
    setReps(prev => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  function removeRep(i: number) {
    setReps(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (v) handleOpen() }}>
      <DialogTrigger>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted cursor-pointer select-none">
          ⚙ Settings
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-navy">Company Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize the Operations Center for your demo. Changes apply immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. DiGiacomo Solar"
            />
          </div>

          {/* Owner Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Owner / Your Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Chris"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Operations Center"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-28 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="Company logo" className="max-h-12 max-w-24 object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo</span>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Logo
                </Button>
                {logoDataUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-muted-foreground"
                    onClick={() => setLogoDataUrl('')}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sales Reps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sales Reps
              </label>
              <Button variant="outline" size="sm" onClick={addRep}>
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {reps.map((rep, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rep}
                    onChange={e => updateRep(i, e.target.value)}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Rep name"
                  />
                  <button
                    onClick={() => removeRep(i)}
                    className="text-sm text-muted-foreground hover:text-red transition-colors px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-lime text-primary-foreground hover:opacity-90 shadow-solar"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

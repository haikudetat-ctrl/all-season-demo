'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AppData, Lead, InstallProject, Referral } from './types'
import { generateSeedData } from './seed-data'

const STORAGE_KEY = 'allseason-operations-data'

function loadFromStorage(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {}
  return null
}

function saveToStorage(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      const stored = loadFromStorage()
      if (stored) {
        setData(stored)
      } else {
        const seed = generateSeedData()
        saveToStorage(seed)
        setData(seed)
      }
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setData(prev => {
      if (!prev) return prev
      const newLeads = prev.leads.map(l => l.id === leadId ? { ...l, ...updates } : l)
      const newData = { ...prev, leads: newLeads }
      saveToStorage(newData)
      return newData
    })
  }, [])

  const updateInstall = useCallback((installId: string, updates: Partial<InstallProject>) => {
    setData(prev => {
      if (!prev) return prev
      const newInstalls = prev.installs.map(i => i.id === installId ? { ...i, ...updates } : i)
      const newData = { ...prev, installs: newInstalls }
      saveToStorage(newData)
      return newData
    })
  }, [])

  const updateReferral = useCallback((refId: string, updates: Partial<Referral>) => {
    setData(prev => {
      if (!prev) return prev
      const newRefs = prev.referrals.map(r => r.id === refId ? { ...r, ...updates } : r)
      const newData = { ...prev, referrals: newRefs }
      saveToStorage(newData)
      return newData
    })
  }, [])

  const resetData = useCallback(() => {
    const seed = generateSeedData()
    saveToStorage(seed)
    setData(seed)
  }, [])

  return { data, loaded, updateLead, updateInstall, updateReferral, resetData }
}

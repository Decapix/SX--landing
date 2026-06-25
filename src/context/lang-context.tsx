"use client"
import { createContext, useContext, useState, type ReactNode } from "react"
import { en } from "@/dictionaries/en"
import { it } from "@/dictionaries/it"

export type Lang = "en" | "it"
type Dict = typeof en

interface LangContextType {
  lang: Lang
  t: Dict
  toggle: () => void
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")
  const t = lang === "en" ? en : it
  const toggle = () => setLang((l) => (l === "en" ? "it" : "en"))
  return (
    <LangContext.Provider value={{ lang, t, toggle, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}

"use client"

import { useEffect } from "react"
import { load } from "@fingerprintjs/botd"

let botdChecked = false

export function BotDetectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (botdChecked) return
    botdChecked = true

    load({ monitoring: false })
      .then((botd) => botd.detect())
      .then((result) => {
        if (result.bot) {
          sessionStorage.setItem("bot_blocked", "1")
        }
      })
      .catch(() => {
        // BotD failure is non-fatal — do not block on error
      })
  }, [])

  return <>{children}</>
}

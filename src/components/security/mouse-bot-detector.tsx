"use client"

import { useEffect, useRef } from "react"
import { extractFeatures, scoreBotProbability, BOT_SCORE_THRESHOLD, type MouseSample } from "@/lib/mouse-bot-scorer"

const COLLECTION_WINDOW_MS = 5000
const MIN_SAMPLES = 20

export function MouseBotDetector() {
  const samples = useRef<MouseSample[]>([])
  const startTime = useRef<number | null>(null)
  const done = useRef(false)
  // Store the current onMove reference so analyse() always removes the right listener,
  // even under React StrictMode double-invocation where two effect runs can occur.
  const onMoveRef = useRef<((e: MouseEvent) => void) | null>(null)

  useEffect(() => {
    // Already blocked by BotD or a previous check
    if (sessionStorage.getItem("bot_blocked") === "1") return

    function analyse() {
      if (onMoveRef.current) {
        window.removeEventListener("mousemove", onMoveRef.current)
      }

      if (samples.current.length < MIN_SAMPLES) return

      const features = extractFeatures(samples.current)
      if (!features) return

      const score = scoreBotProbability(features)
      if (score >= BOT_SCORE_THRESHOLD) {
        sessionStorage.setItem("bot_blocked", "1")
      }
    }

    function onMove(e: MouseEvent) {
      if (done.current) return

      const now = Date.now()
      if (startTime.current === null) startTime.current = now

      samples.current.push({ x: e.clientX, y: e.clientY, t: now })

      if (now - startTime.current >= COLLECTION_WINDOW_MS) {
        done.current = true
        analyse()
      }
    }

    onMoveRef.current = onMove
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      onMoveRef.current = null
    }
  }, [])

  return null
}

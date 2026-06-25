"use client"

import { useEffect, useRef, useState } from "react"
import type { CapWidget } from "@cap.js/widget" // used for widgetRef typing

interface CaptchaGateProps {
  children: React.ReactNode
}

export function CaptchaGate({ children }: CaptchaGateProps) {
  // null = not yet determined (SSR / first hydration paint)
  // false = challenge required
  // true  = verified
  const [verified, setVerified] = useState<boolean | null>(null)
  const widgetRef = useRef<CapWidget | null>(null)

  // On mount: check sessionStorage (client-only, after hydration)
  useEffect(() => {
    if (sessionStorage.getItem("cap_verified") === "1") {
      setVerified(true)
    } else {
      setVerified(false)
    }
  }, [])

  // When the gate becomes visible, register the Cap widget and listen for solve.
  useEffect(() => {
    if (verified !== false) return

    const el = widgetRef.current
    if (!el) return

    let cancelled = false

    // Dynamic import so the module (browser-only, registers <cap-widget> custom
    // element via customElements.define) never runs on the server.
    import("@cap.js/widget").then(() => {
      if (cancelled) return

      // The custom element fires a "solve" event on itself when the PoW is done.
      // apiEndpoint is read by the element from its data-cap-api-endpoint attribute.
      el.addEventListener("solve", function handler() {
        sessionStorage.setItem("cap_verified", "1")
        setVerified(true)
        el.removeEventListener("solve", handler)
      })
    })

    return () => { cancelled = true }
  }, [verified])

  // Return null during SSR and the very first client render to avoid any
  // hydration mismatch (sessionStorage is unavailable on the server).
  if (verified === null) return null

  // Challenge passed — render the protected content directly
  if (verified) return <>{children}</>

  // Challenge required — show the full-screen blocking overlay
  return (
    <>
      {/* Fixed overlay that sits on top of everything */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
        role="status"
      >
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-zinc-200 bg-white px-8 py-10 shadow-xl">
          {/* Shield icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>

          <div className="text-center">
            <h2 className="text-base font-semibold text-zinc-800">Quick verification</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Please complete the check below to continue.
            </p>
          </div>

          {/* cap-widget reads data-cap-api-endpoint for all its fetch calls */}
          <cap-widget
            ref={widgetRef}
            data-cap-api-endpoint={process.env.NEXT_PUBLIC_CAP_API_URL ?? "/api/captcha/"}
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/*
        Render children in a visually-hidden, non-interactive container.
        This keeps the React tree mounted so Next.js can prefetch / stream
        without the user being able to see or interact with the content.
      */}
      <div aria-hidden="true" style={{ visibility: "hidden", pointerEvents: "none" }}>
        {children}
      </div>
    </>
  )
}

// Type declaration for the @cap.js/widget custom element used in JSX.
// The package declares HTMLElementTagNameMap["cap-widget"] in lib.dom terms but
// React's JSX.IntrinsicElements is a separate namespace that must be extended
// explicitly for custom elements.
import type { CapWidget } from "@cap.js/widget"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "cap-widget": React.DetailedHTMLProps<React.HTMLAttributes<CapWidget>, CapWidget> & {
        "data-cap-api-endpoint"?: string
        "data-cap-worker-count"?: string
        "data-cap-hidden-field-name"?: string
        "data-cap-i18n-initial-state"?: string
        "data-cap-i18n-verifying-label"?: string
        "data-cap-i18n-solved-label"?: string
        "data-cap-i18n-error-label"?: string
        "data-cap-troubleshooting-url"?: string
      }
    }
  }
}

import * as React from "react";

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accepted for API compatibility; no longer animated. */
  delay?: number;
  distance?: number;
  threshold?: number;
}

/**
 * No-op replacement for the old scroll-reveal. Content is shown immediately —
 * the fade/slide-in-on-scroll behaviour has been removed.
 */
export function Reveal({ delay, distance, threshold, className, children, ...props }: RevealProps) {
  void delay;
  void distance;
  void threshold;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

type Variant = "primary" | "ghost"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: Variant
}

const base = "inline-block font-medium tracking-wide transition-colors text-sm uppercase"
const variants: Record<Variant, string> = {
  primary: "bg-black text-white px-6 py-3 hover:bg-neutral-800",
  ghost: "border border-black text-black px-6 py-3 hover:bg-black hover:text-white",
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function LinkButton({ href, variant = "primary", className = "", children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  )
}

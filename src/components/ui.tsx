import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Button({
  className,
  variant = 'gold',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'ghost' | 'ink' | 'danger' | 'line' }) {
  const styles = {
    gold: 'bg-gold text-ink hover:bg-gold-2',
    ghost: 'bg-white/5 text-fog hover:bg-white/10',
    ink: 'bg-ink-3 text-fog hover:bg-ink-2 border border-white/10',
    danger: 'bg-bad/90 text-white hover:bg-bad',
    line: 'border border-gold/40 text-gold hover:bg-gold/10',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2.5 text-sm text-fog outline-none placeholder:text-mist/60 focus:border-gold/60',
        props.className,
      )}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2.5 text-sm text-fog outline-none focus:border-gold/60',
        props.className,
      )}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2.5 text-sm text-fog outline-none placeholder:text-mist/60 focus:border-gold/60',
        props.className,
      )}
    />
  )
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-white/10 bg-ink-2/80 shadow-[0_20px_60px_rgba(0,0,0,.25)]', className)} {...props} />
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mist">{children}</label>
}

export function Badge({ children, tone = 'fog' }: { children: ReactNode; tone?: 'fog' | 'ok' | 'warn' | 'bad' | 'gold' }) {
  const map = {
    fog: 'bg-white/10 text-fog',
    ok: 'bg-ok/20 text-ok',
    warn: 'bg-warn/20 text-warn',
    bad: 'bg-bad/20 text-bad',
    gold: 'bg-gold/20 text-gold-2',
  }
  return <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide', map[tone])}>{children}</span>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

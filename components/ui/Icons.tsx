/**
 * Inline SVG icons. Kept local so the site ships no icon library.
 * All of them inherit the current text colour and accept a className.
 */
type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function GithubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.22-3.37-1.22-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.570 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.4 8.94h3.2V21H3.4V8.94Zm5.63 0h3.07v1.65h.04c.43-.81 1.47-1.66 3.03-1.66 3.24 0 3.84 2.13 3.84 4.9V21h-3.2v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-3.2V8.94Z"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 8.2 5.5a1.5 1.5 0 0 0 1.6 0L21 7" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  );
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M12 20V4M6 10l6-6 6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M20 10.5c0 5.2-6.3 10.3-7.5 11.2a.8.8 0 0 1-1 0C10.3 20.8 4 15.7 4 10.5a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10.3" r="2.8" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M21.5 2.5 10.8 13.2M21.5 2.5l-6.8 19-3.9-8.3-8.3-3.9 19-6.8Z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 7.5v5.2M12 16.3h.01" />
    </svg>
  );
}

export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M4.5 17.5V6.8A2.3 2.3 0 0 1 6.8 4.5h10.4a2.3 2.3 0 0 1 2.3 2.3v7.4a2.3 2.3 0 0 1-2.3 2.3H9l-4.5 3.5v-2.5Z" />
      <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" strokeWidth={2.4} />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />
    </svg>
  );
}

export function CodeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false" {...stroke}>
      <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4" />
    </svg>
  );
}

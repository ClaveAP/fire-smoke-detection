export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="15" fill="#C94738" />
      <path d="M24.2 8.5c1.8 6-3.9 7.4-2.1 12.2 1.1-1.4 2.1-3.1 2.2-5.1 5.3 4.2 8.5 8.6 8.5 14 0 5.1-3.8 8.8-9 8.8s-9.2-3.8-9.2-9.1c0-3.7 1.8-6.7 5.2-10.3-.1 3.2.5 5.1 1.5 6.5 1.7-4.9 4.3-8.1 2.9-17Z" fill="#FFF9F5" />
      <path d="M24.1 32.5c1.5-1.8 1.7-3.3 1.4-4.8 2.1 1.7 3 3.4 3 5.2a4.3 4.3 0 0 1-8.6 0c0-1.5.7-2.8 2.1-4.3.1 1.6.8 2.9 2.1 3.9Z" fill="#F4A261" />
    </svg>
  );
}

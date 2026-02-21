// Badge SVG icons for the achievement system
import type { BadgeId } from './store';

export function BadgeIcon({ badge, size = 40, locked = false }: { badge: BadgeId; size?: number; locked?: boolean }) {
  const cls = locked ? 'badge-locked' : '';
  const s = size;
  switch (badge) {
    case 'first-trade':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1E3A5F" stroke="#3B82F6" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#2563EB" opacity="0.3"/>
          <path d="M24 14L27.09 20.26L34 21.24L29 26.14L30.18 33.02L24 29.77L17.82 33.02L19 26.14L14 21.24L20.91 20.26L24 14Z" fill="#3B82F6" stroke="#60A5FA" strokeWidth="1"/>
        </svg>
      );
    case 'streak-7':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#3B1F0B" stroke="#F59E0B" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#D97706" opacity="0.2"/>
          <path d="M24 10C24 10 18 18 18 24C18 27.31 20.69 30 24 30C27.31 30 30 27.31 30 24C30 18 24 10 24 10Z" fill="#F59E0B"/>
          <path d="M24 18C24 18 21 22 21 25C21 26.66 22.34 28 24 28C25.66 28 27 26.66 27 25C27 22 24 18 24 18Z" fill="#FBBF24"/>
          <text x="24" y="40" textAnchor="middle" fill="#F59E0B" fontSize="8" fontWeight="bold">7</text>
        </svg>
      );
    case 'streak-30':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1A0B3B" stroke="#A855F7" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#9333EA" opacity="0.2"/>
          <path d="M19 12L24 8L29 12L24 28L19 12Z" fill="#A855F7"/>
          <path d="M16 18L24 14L32 18L24 32L16 18Z" fill="#C084FC" opacity="0.6"/>
          <circle cx="24" cy="24" r="5" fill="#E9D5FF" opacity="0.3"/>
          <text x="24" y="42" textAnchor="middle" fill="#A855F7" fontSize="8" fontWeight="bold">30</text>
        </svg>
      );
    case 'scholar':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#0B2B1A" stroke="#22C55E" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#16A34A" opacity="0.2"/>
          <path d="M14 20L24 14L34 20L24 26L14 20Z" fill="#22C55E"/>
          <path d="M18 22V30L24 34L30 30V22" stroke="#22C55E" strokeWidth="2" fill="none"/>
          <line x1="34" y1="20" x2="34" y2="32" stroke="#22C55E" strokeWidth="2"/>
          <circle cx="34" cy="33" r="2" fill="#4ADE80"/>
        </svg>
      );
    case 'jg-certified':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1A0B0B" stroke="#EF4444" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#DC2626" opacity="0.15"/>
          <path d="M24 12L28 18H36L30 23L32 30L24 26L16 30L18 23L12 18H20L24 12Z" fill="#EF4444" stroke="#F87171" strokeWidth="0.5"/>
          <text x="24" y="27" textAnchor="middle" fill="#FFF" fontSize="7" fontWeight="900">JG</text>
        </svg>
      );
    case 'veteran':
      return (
        <svg className={cls} width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1A1A0B" stroke="#EAB308" strokeWidth="2"/>
          <circle cx="24" cy="24" r="16" fill="#CA8A04" opacity="0.2"/>
          {/* Trophy */}
          <path d="M18 14H30V20C30 24.42 27.31 28 24 28C20.69 28 18 24.42 18 20V14Z" fill="#EAB308"/>
          <path d="M18 16H14C14 20 16 22 18 22" stroke="#EAB308" strokeWidth="2" fill="none"/>
          <path d="M30 16H34C34 20 32 22 30 22" stroke="#EAB308" strokeWidth="2" fill="none"/>
          <rect x="21" y="28" width="6" height="4" fill="#EAB308"/>
          <rect x="18" y="32" width="12" height="3" rx="1" fill="#EAB308"/>
          <text x="24" y="42" textAnchor="middle" fill="#EAB308" fontSize="6" fontWeight="bold">100</text>
        </svg>
      );
  }
}

export function CrownIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z"/>
    </svg>
  );
}

export function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

export function SwordsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

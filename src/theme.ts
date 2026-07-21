export interface CustomTheme {
  id: string;
  nameKh: string;
  nameEn: string;
  primaryColor: string;
  primaryHover: string;
  bgColor: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  accentBg: string;
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono' | 'font-koh';
  borderRadius: string;
  glassBlur: string;
}

export const THEME_PRESETS: CustomTheme[] = [
  {
    id: 'amber-classic',
    nameKh: 'ទឹកឃ្មុំសាបាយ (Amber Sabaay - default)',
    nameEn: 'Amber Sabaay (Default)',
    primaryColor: '#f97316',
    primaryHover: '#ea580c',
    bgColor: '#0d0a08',
    cardBg: '#14100c',
    borderColor: 'rgba(249, 115, 22, 0.15)',
    textColor: '#f7f5f2',
    mutedTextColor: '#a8a29e',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    fontFamily: 'font-sans',
    borderRadius: '16px',
    glassBlur: '12px'
  },
  {
    id: 'royal-gold',
    nameKh: 'មាសរាជវង្ស (Royal Golden Velvet)',
    nameEn: 'Royal Gold & Velvet',
    primaryColor: '#d4af37',
    primaryHover: '#b8901c',
    bgColor: '#0a0907',
    cardBg: '#12100d',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    textColor: '#f9f6f0',
    mutedTextColor: '#cfc3b0',
    accentColor: '#f3e5ab',
    accentBg: 'rgba(212, 175, 55, 0.15)',
    fontFamily: 'font-sans',
    borderRadius: '24px',
    glassBlur: '16px'
  },
  {
    id: 'angkor-crimson',
    nameKh: 'ក្រហមប្រាសាទអង្គរ (Angkor Crimson)',
    nameEn: 'Angkor Old Crimson',
    primaryColor: '#b91c1c',
    primaryHover: '#991b1b',
    bgColor: '#0a0505',
    cardBg: '#120b0b',
    borderColor: 'rgba(185, 28, 28, 0.22)',
    textColor: '#fef2f2',
    mutedTextColor: '#fca5a5',
    accentColor: '#fbbf24',
    accentBg: 'rgba(251, 191, 36, 0.12)',
    fontFamily: 'font-koh',
    borderRadius: '12px',
    glassBlur: '8px'
  },
  {
    id: 'mekong-emerald',
    nameKh: 'បៃតងមរកត (Mekong Emerald)',
    nameEn: 'Mekong Jade Emerald',
    primaryColor: '#10b981',
    primaryHover: '#059669',
    bgColor: '#030806',
    cardBg: '#08120e',
    borderColor: 'rgba(16, 185, 129, 0.18)',
    textColor: '#ecfdf5',
    mutedTextColor: '#a7f3d0',
    accentColor: '#34d399',
    accentBg: 'rgba(52, 211, 153, 0.12)',
    fontFamily: 'font-sans',
    borderRadius: '20px',
    glassBlur: '12px'
  },
  {
    id: 'indigo-ocean',
    nameKh: 'ខៀវមហាសមុទ្រ (Indigo Ocean)',
    nameEn: 'Deep Indigo Ocean',
    primaryColor: '#3b82f6',
    primaryHover: '#2563eb',
    bgColor: '#030508',
    cardBg: '#0a0e17',
    borderColor: 'rgba(59, 130, 246, 0.18)',
    textColor: '#f8fafc',
    mutedTextColor: '#cbd5e1',
    accentColor: '#60a5fa',
    accentBg: 'rgba(96, 165, 250, 0.12)',
    fontFamily: 'font-sans',
    borderRadius: '16px',
    glassBlur: '16px'
  },
  {
    id: 'lotus-pink',
    nameKh: 'ស៊ីជម្ពូផ្កាឈូក (Lotus Pink)',
    nameEn: 'Lotus Sweet Pink',
    primaryColor: '#ec4899',
    primaryHover: '#db2777',
    bgColor: '#0a0507',
    cardBg: '#140c10',
    borderColor: 'rgba(236, 72, 153, 0.18)',
    textColor: '#fdf2f8',
    mutedTextColor: '#fbcfe8',
    accentColor: '#f472b6',
    accentBg: 'rgba(244, 114, 182, 0.12)',
    fontFamily: 'font-koh',
    borderRadius: '16px',
    glassBlur: '12px'
  },
  {
    id: 'midnight-cyber',
    nameKh: 'ខ្មៅរលោងទំនើប (Midnight Cyber)',
    nameEn: 'Cyber Midnight Glow',
    primaryColor: '#06b6d4',
    primaryHover: '#0891b2',
    bgColor: '#020306',
    cardBg: '#060c14',
    borderColor: 'rgba(6, 182, 212, 0.22)',
    textColor: '#f0fafd',
    mutedTextColor: '#a5f3fc',
    accentColor: '#22d3ee',
    accentBg: 'rgba(34, 211, 238, 0.15)',
    fontFamily: 'font-mono',
    borderRadius: '12px',
    glassBlur: '20px'
  }
];

export function generateThemeCSS(theme: CustomTheme): string {
  // Map font settings
  let fontValue = 'var(--font-sans)';
  if (theme.fontFamily === 'font-serif') fontValue = 'var(--font-moul)';
  if (theme.fontFamily === 'font-koh') fontValue = 'var(--font-koh)';
  if (theme.fontFamily === 'font-mono') fontValue = 'var(--font-mono)';

  return `
    :root {
      --theme-primary: ${theme.primaryColor};
      --theme-primary-hover: ${theme.primaryHover};
      --theme-bg: ${theme.bgColor};
      --theme-card: ${theme.cardBg};
      --theme-border: ${theme.borderColor};
      --theme-text: ${theme.textColor};
      --theme-text-muted: ${theme.mutedTextColor};
      --theme-accent: ${theme.accentColor};
      --theme-accent-bg: ${theme.accentBg};
      --theme-font: ${fontValue};
      --theme-radius: ${theme.borderRadius};
      --theme-glass-blur: ${theme.glassBlur};
    }

    /* Apply theme overrides globally */
    .app-theme-container {
      background-color: var(--theme-bg) !important;
      color: var(--theme-text) !important;
      font-family: var(--theme-font) !important;
    }

    /* Card customization */
    .theme-card {
      background-color: var(--theme-card) !important;
      border-color: var(--theme-border) !important;
      border-radius: var(--theme-radius) !important;
      backdrop-filter: blur(var(--theme-glass-blur)) !important;
      -webkit-backdrop-filter: blur(var(--theme-glass-blur)) !important;
    }

    /* Button Customization */
    .theme-btn-primary {
      background-color: var(--theme-primary) !important;
      color: #000000 !important;
      border-radius: var(--theme-radius) !important;
      transition: all 0.2s ease-in-out;
    }
    /* Contrast fix for dark text on bright primaries */
    .theme-btn-primary-text {
      color: #000000 !important;
    }
    .theme-btn-primary:hover {
      background-color: var(--theme-primary-hover) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    .theme-btn-primary:active {
      transform: translateY(0);
    }

    /* Secondary/Muted Buttons */
    .theme-btn-secondary {
      background-color: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid var(--theme-border) !important;
      color: var(--theme-text) !important;
      border-radius: var(--theme-radius) !important;
    }
    .theme-btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      border-color: var(--theme-primary) !important;
      color: var(--theme-accent) !important;
    }

    /* Interactive Borders */
    .theme-border-interactive {
      border-color: var(--theme-border) !important;
    }
    .theme-border-interactive:focus, .theme-border-interactive:focus-within {
      border-color: var(--theme-primary) !important;
      outline: none;
    }

    /* Badge Customization */
    .theme-badge {
      background-color: var(--theme-accent-bg) !important;
      color: var(--theme-accent) !important;
      border: 1px solid var(--theme-border) !important;
      border-radius: 9999px !important;
    }

    /* Input Fields */
    .theme-input {
      background-color: rgba(0, 0, 0, 0.25) !important;
      border: 1px solid var(--theme-border) !important;
      color: var(--theme-text) !important;
      border-radius: var(--theme-radius) !important;
      transition: all 0.2s ease;
    }
    .theme-input:focus {
      border-color: var(--theme-primary) !important;
      box-shadow: 0 0 0 2px rgba(var(--theme-primary), 0.1) !important;
      outline: none;
    }

    /* Scrollbars */
    .theme-scrollbar::-webkit-scrollbar-thumb {
      background-color: var(--theme-border) !important;
    }
    
    /* Utility colors */
    .theme-text-primary {
      color: var(--theme-primary) !important;
    }
    .theme-text-accent {
      color: var(--theme-accent) !important;
    }
    .theme-bg-primary {
      background-color: var(--theme-primary) !important;
    }
    .theme-bg-card {
      background-color: var(--theme-card) !important;
    }
  `;
}

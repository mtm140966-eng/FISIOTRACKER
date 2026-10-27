// Gerado por build_tokens.py a partir de tokens.json. Não editar à mão.
// Preset do Tailwind (painel) e do NativeWind (app). Cores via CSS vars de tokens.css.

module.exports = { theme: {
  "colors": {
    "bg": "var(--color-bg)",
    "surface": "var(--color-surface)",
    "surface-raised": "var(--color-surface-raised)",
    "border": "var(--color-border)",
    "border-input": "var(--color-border-input)",
    "text": "var(--color-text)",
    "text-muted": "var(--color-text-muted)",
    "accent": "var(--color-accent)",
    "accent-hover": "var(--color-accent-hover)",
    "on-accent": "var(--color-on-accent)",
    "accent-soft": "var(--color-accent-soft)",
    "focus": "var(--color-focus)",
    "danger": "var(--color-danger)",
    "danger-soft": "var(--color-danger-soft)",
    "success": "var(--color-success)",
    "warning": "var(--color-warning)",
    "warning-soft": "var(--color-warning-soft)",
    "evidence-strong": "var(--color-evidence-strong)",
    "evidence-strong-soft": "var(--color-evidence-strong-soft)",
    "evidence-moderate": "var(--color-evidence-moderate)",
    "evidence-moderate-soft": "var(--color-evidence-moderate-soft)",
    "evidence-weak": "var(--color-evidence-weak)",
    "evidence-weak-soft": "var(--color-evidence-weak-soft)",
    "favorite": "var(--color-favorite)",
    "transparent": "transparent",
    "current": "currentColor"
  },
  "fontFamily": {
    "sans": [
      "var(--font-sans)"
    ],
    "mono": [
      "var(--font-mono)"
    ]
  },
  "fontSize": {
    "xs": [
      "12px",
      {
        "lineHeight": "16px",
        "fontWeight": "500"
      }
    ],
    "sm": [
      "14px",
      {
        "lineHeight": "20px",
        "fontWeight": "400"
      }
    ],
    "base": [
      "16px",
      {
        "lineHeight": "24px",
        "fontWeight": "400"
      }
    ],
    "lg": [
      "18px",
      {
        "lineHeight": "26px",
        "fontWeight": "600"
      }
    ],
    "xl": [
      "22px",
      {
        "lineHeight": "28px",
        "fontWeight": "700"
      }
    ],
    "display": [
      "30px",
      {
        "lineHeight": "36px",
        "fontWeight": "700"
      }
    ]
  },
  "borderRadius": {
    "sm": "6px",
    "md": "10px",
    "lg": "14px",
    "pill": "999px",
    "none": "0"
  },
  "boxShadow": {
    "card": "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)",
    "pop": "0 12px 32px rgba(16,24,40,.18)",
    "none": "none"
  },
  "screens": {
    "sm": "640px",
    "lg": "1024px"
  },
  "extend": {
    "spacing": {
      "touch": "48px"
    },
    "minHeight": {
      "touch": "48px"
    },
    "minWidth": {
      "touch": "48px"
    },
    "maxWidth": {
      "panel": "1120px"
    },
    "transitionDuration": {
      "fast": "120ms",
      "base": "200ms"
    },
    "transitionTimingFunction": {
      "base": "cubic-bezier(.2,.8,.2,1)"
    }
  }
} };

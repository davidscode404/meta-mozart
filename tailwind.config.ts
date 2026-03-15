import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deep: "var(--bg-deep)",
        base: "var(--bg-base)",
        elevated: "var(--bg-elevated)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        "accent-glow": "var(--accent-glow)",
        border: "var(--border)",
        "border-active": "var(--border-active)",
        destructive: "var(--destructive)",
        warning: "var(--warning)",
        success: "var(--success)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-family)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      zIndex: {
        canvas: "0",
        "canvas-lanes": "10",
        "canvas-playhead": "20",
        "ai-layer": "30",
        "hover-card": "40",
        "context-rail": "50",
        "command-dock": "60",
        modal: "100",
        toast: "110",
      },
    },
  },
  plugins: [],
};

export default config;

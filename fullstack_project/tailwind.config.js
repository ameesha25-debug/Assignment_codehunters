/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",   // 16px gutters
        sm: "1.25rem",
        lg: "1.5rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        muted: "oklch(var(--muted))",
        "muted-foreground": "oklch(var(--muted-foreground))",
        primary: "oklch(var(--primary))",
        "primary-foreground": "oklch(var(--primary-foreground))",
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        destructive: "oklch(var(--destructive))",
        card: "oklch(var(--card))",
        "card-foreground": "oklch(var(--card-foreground))",
        popover: "oklch(var(--popover))",
        "popover-foreground": "oklch(var(--popover-foreground))",
        accent: "oklch(var(--accent))",
        "accent-foreground": "oklch(var(--accent-foreground))",
        secondary: "oklch(var(--secondary))",
        "secondary-foreground": "oklch(var(--secondary-foreground))",
      },
      borderRadius: { lg: "var(--radius)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

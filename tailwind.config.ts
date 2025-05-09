import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"], // Already set, good.
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Main background for dark theme
        foreground: "hsl(var(--foreground))", // Main text color for dark theme
        primary: {
          DEFAULT: "hsl(var(--primary))", // Woorkify Orange #FF5E00
          foreground: "hsl(var(--primary-foreground))", // Text on primary
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Accent color
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))", // Card background for dark theme
          foreground: "hsl(var(--card-foreground))", // Card text for dark theme
        },
        // Custom brand colors
        brand: {
          orange: "#FF5E00",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          green: "#22C55E",
          darkBlue: "#1E3A8A",
          // Dark theme specific shades
          gray: {
            900: "#111827", // Example: bg-gray-900
            800: "#1F2937", // Example: bg-gray-800
            700: "#374151", // Example: bg-gray-700
          }
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "bubble-float": {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '25%': { transform: 'translateY(-20px) translateX(10px) scale(1.05)' },
          '50%': { transform: 'translateY(10px) translateX(-15px) scale(0.95)' },
          '75%': { transform: 'translateY(-15px) translateX(20px) scale(1.1)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bubble-float": "bubble-float 15s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
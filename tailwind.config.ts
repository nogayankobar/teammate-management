import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tipalti: {
          navy: "#1B2B3E",
          "navy-dark": "#152233",
          "navy-hover": "#243447",
          orange: "#F5A623",
          "orange-hover": "#E8951A",
          blue: "#0052CC",
          "blue-light": "#EBF2FF",
          "text-primary": "#172B4D",
          "text-secondary": "#5E6C84",
          "text-muted": "#8993A4",
          border: "#DFE1E6",
          "bg-light": "#F4F5F7",
          "bg-white": "#FFFFFF",
          success: "#00875A",
          "success-bg": "#E3FCEF",
          warning: "#FF8B00",
          "warning-bg": "#FFFAE6",
          danger: "#DE350B",
          "danger-bg": "#FFEBE6",
          info: "#0065FF",
          "info-bg": "#DEEBFF",
          purple: "#5243AA",
          "purple-bg": "#EAE6FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(9,30,66,0.12), 0 0 0 1px rgba(9,30,66,0.08)",
        panel: "0 8px 24px rgba(9,30,66,0.16)",
        "side-panel": "-4px 0 16px rgba(9,30,66,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;

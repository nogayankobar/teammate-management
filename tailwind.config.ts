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
          navy: "#1A1A2E",
          "navy-dark": "#13132A",
          "navy-hover": "#232340",
          orange: "#F5A623",
          "orange-hover": "#E8951A",
          blue: "#0052CC",
          "blue-light": "#EBF2FF",
          "text-primary": "#1A1A2E",
          "text-secondary": "#5E6C84",
          "text-muted": "#97A0AF",
          border: "#E1E7EA",
          "bg-light": "#FFFFFF",
          "bg-white": "#FFFFFF",
          success: "#36B37E",
          "success-bg": "#E3FCEF",
          warning: "#FF8B00",
          "warning-bg": "#FFFAE6",
          danger: "#FF5630",
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
        card: "0 1px 2px rgba(0,0,0,0.04)",
        panel: "0 4px 16px rgba(0,0,0,0.08)",
        "side-panel": "-2px 0 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;

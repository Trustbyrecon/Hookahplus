// apps/hookahplus-next/lib/fonts.ts
import localFont from "next/font/local";

export const inter = localFont({
  src: [
    { path: "../public/fonts/Inter-VariableFont_slnt,wght.ttf", style: "normal" },
    { path: "../public/fonts/Inter-Italic-VariableFont_slnt,wght.ttf", style: "italic" }
  ],
  display: "swap",
  variable: "--font-inter"
});

export const raleway = localFont({
  src: [
    { path: "../public/fonts/Raleway-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Raleway-SemiBold.ttf", weight: "600", style: "normal" }
  ],
  display: "swap",
  variable: "--font-raleway"
});

export const unifraktur = localFont({
  src: [
    { path: "../public/fonts/UnifrakturCook-Bold.ttf", weight: "700", style: "normal" }
  ],
  display: "swap",
  variable: "--font-unifraktur"
});
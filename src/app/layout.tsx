import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "@/env";
import ThemeToggle from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }

                var savedColor = localStorage.getItem('aptitude_custom_brand_color');
                if (savedColor) {
                  document.documentElement.style.setProperty('--clr-primary', savedColor);
                  var adjustColorBrightness = function(hex, percent) {
                    var color = hex.startsWith('#') ? hex.slice(1) : hex;
                    var r = parseInt(color.substring(0, 2), 16);
                    var g = parseInt(color.substring(2, 4), 16);
                    var b = parseInt(color.substring(4, 6), 16);
                    r = Math.max(0, Math.min(255, r + Math.round(2.55 * percent)));
                    g = Math.max(0, Math.min(255, g + Math.round(2.55 * percent)));
                    b = Math.max(0, Math.min(255, b + Math.round(2.55 * percent)));
                    var rHex = r.toString(16).padStart(2, '0');
                    var gHex = g.toString(16).padStart(2, '0');
                    var bHex = b.toString(16).padStart(2, '0');
                    return '#' + rHex + gHex + bHex;
                  };
                  document.documentElement.style.setProperty('--clr-primary-dark', adjustColorBrightness(savedColor, -15));
                  document.documentElement.style.setProperty('--clr-primary-tint', savedColor + '20');

                  var cleanColor = savedColor.startsWith('#') ? savedColor.slice(1) : savedColor;
                  var r = parseInt(cleanColor.substring(0, 2), 16);
                  var g = parseInt(cleanColor.substring(2, 4), 16);
                  var b = parseInt(cleanColor.substring(4, 6), 16);
                  document.documentElement.style.setProperty('--clr-primary-rgb', r + ',' + g + ',' + b);
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
      </body>
    </html>
  );
}

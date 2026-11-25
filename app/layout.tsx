import "./globals.css";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CardSiderbar";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { Manrope, IBM_Plex_Mono, IBM_Plex_Sans, VT323 } from "next/font/google";
import { LanguageProvider } from "../context/LanguageContext";
import type { Metadata } from "next";
import ScrollToTop from "../components/ScrollToTop";
import { Suspense } from "react";
import MaintenanceGuard from "../components/MaintenanceGuard";
import ErrorBoundary from "../components/ErrorBoundary";

// Display: Manrope. Body: compact IBM Plex Sans with a mono terminal accent.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const terminal = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-terminal",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Encrypted | Menswear, decoded.",
    template: "%s | Encrypted",
  },
  description:
    "Encrypted is an Egyptian menswear brand: streetwear and everyday essentials designed in Cairo.",
  keywords: [
    "Encrypted",
    "Encrypted menswear",
    "Egyptian men's clothing",
    "Egyptian menswear brand",
    "streetwear Egypt",
    "men's clothing online",
    "shop men's fashion online",
  ],
  authors: [{ name: "Encrypted" }],
  creator: "Encrypted",
  publisher: "Encrypted",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Encrypted",
    title: "Encrypted | Menswear, decoded.",
    description:
      "Egyptian menswear, streetwear and everyday essentials from Encrypted.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Encrypted",
    description:
      "Egyptian menswear, streetwear and everyday essentials from Encrypted.",
    creator: "Encrypted",
  },
  category: "fashion",
};

export const viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en" dir="ltr" className={`${manrope.variable} ${plexMono.variable} ${plexSans.variable} ${terminal.variable}`}>
      <body className="font-body">
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <CheckoutProvider>
                    <Suspense fallback={null}>
                      <ScrollToTop />
                    </Suspense>
                    <MaintenanceGuard>
                      <main>{children}</main>
                    </MaintenanceGuard>
                    <CartSidebar />
                  </CheckoutProvider>
                </CartProvider>
              </FavoritesProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html >
  );
}


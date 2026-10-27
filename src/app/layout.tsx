import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdTheme } from "@/app/providers"; // adjust to where you created it
import { ThemeProvider } from "@/components/ThemeProvider";
import IntroGate from "@/components/layout/intro-gate";
import { MarketProvider } from "@/components/providers/market-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { getStorefrontProducts } from "@/lib/storefront-queries";
import { AuthLoadingProvider } from "@/components/AuthLoadingProvider";
const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "../fonts/CormorantGaramond-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CormorantGaramond-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/CormorantGaramond-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/CormorantGaramond-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CormorantGaramond-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/CormorantGaramond-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/CormorantGaramond-SemiBoldItalic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/CormorantGaramond-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: "../fonts/Inter-Variable.woff2",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Finasto — Premium Bali Botanical Tea",
  description:
    "Finasto is a premium Bali-born botanical tea brand. Discover Velora and Blue Moon, thoughtfully presented for modern everyday rituals.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const products = await getStorefrontProducts();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
     
      <body className="min-h-full flex flex-col bg-cream text-espresso font-sans">
        <ThemeProvider>
          <AntdRegistry>
            <AntdTheme>
              <IntroGate />
                            <AuthLoadingProvider>
                <MarketProvider>
                  <CartProvider>
                    {children}
                    <CartDrawer products={products} />
                  </CartProvider>
                </MarketProvider>
              </AuthLoadingProvider>
              <ScrollToTop />
            </AntdTheme>
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}

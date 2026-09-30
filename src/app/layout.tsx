import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdTheme } from "@/app/providers"; // adjust to where you created it
import IntroGate from "@/components/layout/intro-gate";
import { MarketProvider } from "@/components/providers/market-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { getStorefrontProducts } from "@/lib/storefront-queries";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-espresso font-sans">
        <AntdRegistry>
          <AntdTheme>
            <IntroGate />
            <MarketProvider>
              <CartProvider>
                {children}
                <CartDrawer products={products} />
              </CartProvider>
            </MarketProvider>
            <ScrollToTop />
          </AntdTheme>
        </AntdRegistry>
      </body>
    </html>
  );
}

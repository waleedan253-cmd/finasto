import type { Metadata } from "next";
import { BrandPage } from "@/components/brand/brand-page";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "FINASTO™ — Signature of Nature, Rooted in Indonesia",
  description:
    "FINASTO™ is a premium Indonesian tea and coffee brand built on an appreciation for nature, a commitment to quality, and a vision to create a distinctive collection for a global audience.",
};

export default function Page() {
  
    return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <BrandPage />
       <SiteFooter />
    </>
  );
  
}
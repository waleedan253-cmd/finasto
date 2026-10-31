import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact page";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Contact — Finasto",
  description:
    "Get in touch with Finasto about an order, our collection or working together. We’ll get back to you as soon as we can.",
};

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <ContactPage />
    </>
  );
}
// Admin Announcement page. A server component: it loads the list on the
// server and hands it to the client table. No "use client" here, so the
// data fetch never ships to the browser.

import { listAnnouncements } from "@/lib/admin/announcement-queries";
import { AnnouncementTable } from "@/components/admin/announcement/announcement-table";

export const metadata = { title: "Announcements — Finasto Admin" };

export default async function AdminAnnouncementPage() {
  // listAnnouncements() re-checks requireRole("admin") itself, so this page
  // stays safe even if it is ever moved out from under admin/layout.tsx.
  const items = await listAnnouncements();

  return <AnnouncementTable items={items} />;
}

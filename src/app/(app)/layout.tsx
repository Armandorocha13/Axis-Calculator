import type { ReactNode } from "react";
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { AtelierSettingsProvider } from "@/components/settings/atelier-settings-context";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await getCurrentUserAndProfile();

  const isAdmin = profile?.role === "admin";

  return (
    <AtelierSettingsProvider profile={profile}>
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar businessName={profile?.business_name} isAdmin={isAdmin} profile={profile} />
        <div className="flex flex-1 flex-col md:flex-row">
          <aside className="hidden shrink-0 border-r border-border p-4 md:flex md:w-60 md:flex-col md:sticky md:top-[73px] md:h-[calc(100vh-73px)]">
            <SidebarNav isAdmin={isAdmin} profile={profile} />
          </aside>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AtelierSettingsProvider>
  );
}

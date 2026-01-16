"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/admin"
            className="font-semibold hover:opacity-80 transition-opacity"
          >
            Admin Dashboard
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ClipboardList, LoaderCircle, LogOut, MapPin, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiErrorMessage } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function AccountPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { user, status, logout, logoutAll } = useAuth();
  const [action, setAction] = useState<"logout" | "logoutAll" | null>(null);

  async function handleLogout(allDevices: boolean) {
    setAction(allDevices ? "logoutAll" : "logout");

    try {
      if (allDevices) {
        await logoutAll();
        toast.success(t("signOutAllSuccess"));
      } else {
        await logout();
        toast.success(t("signOutSuccess"));
      }

      router.replace("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setAction(null);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted-foreground">
        <LoaderCircle className="me-2 size-4 animate-spin" />
        {t("accountLoading")}
      </main>
    );
  }

  if (!user) {
    return (
      <AuthCard
        eyebrow={t("accountEyebrow")}
        title={t("accountSessionExpired")}
        description={t("loginDescription")}
        footer={
          <Button onClick={() => router.replace("/login")} className="rounded-xl">
            {t("signIn")}
          </Button>
        }
      >
        <div className="flex justify-center py-2 text-primary">
          <ShieldCheck className="size-10" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow={t("accountEyebrow")}
      title={t("accountTitle")}
      description={t("accountDescription")}
      footer={
        <Button
          type="button"
          variant="ghost"
          onClick={() => void handleLogout(true)}
          disabled={action !== null}
          className="text-xs text-muted-foreground"
        >
          {action === "logoutAll" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {t("signOutAll")}
        </Button>
      }
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Button asChild type="button" className="mt-5 h-10 w-full rounded-xl">
        <Link href="/orders">
          <ClipboardList className="size-4" />
          {t("myOrders")}
        </Link>
      </Button>

      <Button asChild type="button" variant="outline" className="mt-2 h-10 w-full rounded-xl">
        <Link href="/reviews">
          <MessageSquareText className="size-4" />
          {t("myReviews")}
        </Link>
      </Button>

      <Button asChild type="button" variant="outline" className="mt-2 h-10 w-full rounded-xl">
        <Link href="/addresses">
          <MapPin className="size-4" />
          {t("manageAddresses")}
        </Link>
      </Button>

      <p className="mt-4 text-[11px] text-muted-foreground">{t("signedInAs")}</p>
      <p className="mt-1 text-sm font-semibold">{user.username}</p>

      <Button
        type="button"
        variant="outline"
        onClick={() => void handleLogout(false)}
        disabled={action !== null}
        className="mt-6 h-11 w-full rounded-xl"
      >
        {action === "logout" ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        {t("signOut")}
      </Button>
    </AuthCard>
  );
}

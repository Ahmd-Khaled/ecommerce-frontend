"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, Mail } from "lucide-react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { authApi } from "@/features/auth/api/auth.api";
import { apiErrorMessage } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(t("forgotPasswordSuccess"));
      router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("forgotPasswordTitle")}
      description={t("forgotPasswordDescription")}
      footer={
        <>
          {t("rememberPassword")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">{t("signIn")}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="forgot-email" className="text-xs font-semibold">{t("email")}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="forgot-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} className="h-11 rounded-xl ps-10" />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl font-bold">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? t("sendingCode") : t("sendResetCode")}
        </Button>
      </form>
    </AuthCard>
  );
}

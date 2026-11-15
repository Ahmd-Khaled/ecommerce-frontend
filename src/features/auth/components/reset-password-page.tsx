"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { authApi } from "@/features/auth/api/auth.api";
import { apiErrorMessage } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { OtpInput } from "@/features/auth/components/otp-input";
import { PasswordGenerator } from "@/features/auth/components/password-generator";

function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error(t("invalidOtpLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });
      toast.success(t("resetPasswordSuccess"));
      router.replace("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("resetPasswordTitle")}
      description={t("resetPasswordDescription")}
      footer={
        <>
          {t("rememberPassword")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">{t("signIn")}</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="reset-email" className="text-xs font-semibold">{t("email")}</label>
          <Input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="reset-otp" className="text-xs font-semibold">{t("verificationCode")}</label>
          <OtpInput value={otp} onChange={setOtp} label={t("verificationCode")} />
        </div>
        <PasswordGenerator onGenerate={(generated) => {
          setNewPassword(generated);
          setConfirmPassword(generated);
        }} />
        <div className="space-y-2">
          <label htmlFor="reset-password" className="text-xs font-semibold">{t("newPassword")}</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="reset-password" type={showPasswords ? "text" : "password"} required autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder={t("passwordPlaceholder")} className="h-11 rounded-xl ps-10 pe-11" />
            <button type="button" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? t("hidePassword") : t("showPassword")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="reset-confirm-password" className="text-xs font-semibold">{t("confirmPassword")}</label>
          <Input id="reset-confirm-password" type={showPasswords ? "text" : "password"} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 rounded-xl" />
        </div>
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl font-bold">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? t("resettingPassword") : t("resetPassword")}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted-foreground">Loading...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, MailCheck } from "lucide-react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { authApi } from "@/features/auth/api/auth.api";
import { apiErrorMessage } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/features/auth/components/otp-input";
import { Link } from "@/i18n/navigation";

function VerifyEmailForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6) {
      toast.error(t("invalidOtpLength"));
      return;
    }

    setIsVerifying(true);

    try {
      await authApi.verifyEmail({ email: email.trim().toLowerCase(), otp: otp.trim() });
      toast.success(t("verificationSuccess"));
      router.replace("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      toast.error(t("emailRequiredForResend"));
      return;
    }

    setIsResending(true);

    try {
      await authApi.resendVerification({ email: email.trim().toLowerCase() });
      toast.success(t("resendSuccess"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("verifyTitle")}
      description={t("verifyDescription")}
      footer={
        <>
          {t("alreadyVerified")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">{t("signIn")}</Link>
        </>
      }
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="size-7" />
        </div>
        <div className="space-y-2">
          <label htmlFor="verify-email" className="text-xs font-semibold">{t("email")}</label>
          <Input id="verify-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="verify-otp" className="text-xs font-semibold">{t("verificationCode")}</label>
          <OtpInput value={otp} onChange={setOtp} label={t("verificationCode")} />
        </div>
        <Button type="submit" disabled={isVerifying} className="h-11 w-full rounded-xl font-bold">
          {isVerifying ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isVerifying ? t("verifying") : t("verifyEmail")}
        </Button>
        <Button type="button" variant="outline" disabled={isResending} onClick={handleResend} className="h-11 w-full rounded-xl">
          {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isResending ? t("sendingCode") : t("resendCode")}
        </Button>
      </form>
    </AuthCard>
  );
}

export function VerifyEmailPage() {
  return <VerifyEmailForm />;
}

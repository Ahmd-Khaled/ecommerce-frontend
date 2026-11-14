"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiErrorMessage } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      toast.success(t("registrationSuccess"));
      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("registerTitle")}
      description={t("registerDescription")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t("signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="register-first-name" className="text-xs font-semibold">{t("firstName")}</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="register-first-name" required minLength={2} maxLength={30} autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-11 rounded-xl ps-10" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="register-last-name" className="text-xs font-semibold">{t("lastName")}</label>
            <Input id="register-last-name" required minLength={2} maxLength={30} autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-xs font-semibold">{t("email")}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="register-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} className="h-11 rounded-xl ps-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-xs font-semibold">{t("password")}</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="register-password" type={showPasswords ? "text" : "password"} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordPlaceholder")} className="h-11 rounded-xl ps-10 pe-11" />
            <button type="button" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? t("hidePassword") : t("showPassword")} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-confirm-password" className="text-xs font-semibold">{t("confirmPassword")}</label>
          <Input id="register-confirm-password" type={showPasswords ? "text" : "password"} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t("confirmPasswordPlaceholder")} className="h-11 rounded-xl" />
        </div>

        <p className="text-[11px] leading-5 text-muted-foreground">{t("passwordHint")}</p>

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl text-sm font-bold">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>
    </AuthCard>
  );
}

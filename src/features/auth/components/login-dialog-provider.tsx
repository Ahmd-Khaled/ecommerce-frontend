"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiErrorMessage } from "@/lib/api/axios";

type LoginDialogReason = "cart" | "protected";

interface LoginDialogRequest {
  reason: LoginDialogReason;
  onAuthenticated?: () => Promise<void> | void;
}

interface LoginDialogContextValue {
  requestLogin: (
    reason: LoginDialogReason,
    onAuthenticated?: () => Promise<void> | void,
  ) => void;
}

const LoginDialogContext = createContext<LoginDialogContextValue | null>(null);
const protectedPaths = ["/account", "/addresses", "/cart", "/checkout"];

export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { login, status } = useAuth();
  const [request, setRequest] = useState<LoginDialogRequest | null>(null);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
  const protectedRequest: LoginDialogRequest | null =
    status === "unauthenticated" && isProtectedPath
      ? { reason: "protected" }
      : null;
  const activeRequest =
    status === "authenticated" ? null : protectedRequest ?? request;
  const shouldBlockProtectedContent =
    isProtectedPath && status !== "authenticated";

  const requestLogin = useCallback(
    (
      reason: LoginDialogReason,
      onAuthenticated?: () => Promise<void> | void,
    ) => {
      setRequest({ reason, onAuthenticated });
      setShowQuickLogin(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
    },
    [],
  );

  async function handleQuickLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success(t("loginSuccess"));

      try {
        await activeRequest?.onAuthenticated?.();
      } catch (actionError) {
        toast.error(apiErrorMessage(actionError));
        return;
      }

      setRequest(null);
      window.location.reload();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const value = useMemo(() => ({ requestLogin }), [requestLogin]);

  const title =
    activeRequest?.reason === "protected"
      ? t("protectedLoginTitle")
      : t("cartLoginTitle");
  const description =
    activeRequest?.reason === "protected"
      ? t("protectedLoginDescription")
      : t("cartLoginDescription");

  return (
    <LoginDialogContext.Provider value={value}>
      {shouldBlockProtectedContent ? (
        <div
          className="flex min-h-dvh items-center justify-center bg-background"
          aria-busy={status === "loading"}
          aria-hidden="true"
        >
          {status === "loading" ? (
            <LoaderCircle className="size-6 animate-spin text-primary" />
          ) : null}
        </div>
      ) : (
        children
      )}

      <Dialog
        open={activeRequest !== null}
        onOpenChange={(open) => {
          if (!open && !isProtectedPath) {
            setRequest(null);
            setShowQuickLogin(false);
            setEmail("");
            setPassword("");
            setShowPassword(false);
          }
        }}
      >
        <DialogContent
          dir={locale === "ar" ? "rtl" : "ltr"}
          showCloseButton={!isProtectedPath}
          className="max-h-[min(90dvh,720px)] overflow-y-auto rounded-2xl p-5 sm:max-w-[430px] sm:p-6"
        >
          {!showQuickLogin ? (
            <>
              <DialogHeader className="items-center text-center">
                <span className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {activeRequest?.reason === "protected" ? (
                    <ShieldCheck className="size-7" />
                  ) : (
                    <ShoppingCart className="size-7" />
                  )}
                </span>
                <DialogTitle className="text-lg font-bold">
                  {title}
                </DialogTitle>
                <DialogDescription className="max-w-sm text-center leading-6">
                  {description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => setShowQuickLogin(true)}
                  className="h-11 w-full rounded-xl font-semibold"
                >
                  {t("continueToLogin")}
                </Button>
                {!isProtectedPath ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRequest(null)}
                    className="h-10 w-full rounded-xl text-muted-foreground"
                  >
                    {t("cancel")}
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  {t("quickLoginTitle")}
                </DialogTitle>
                <DialogDescription className="leading-6">
                  {t("quickLoginDescription")}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuickLogin} className="mt-3 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="quick-login-email"
                    className="mb-2 block text-xs font-semibold"
                  >
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="quick-login-email"
                      type="email"
                      autoComplete="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="h-11 rounded-xl ps-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="quick-login-password"
                    className="mb-2 block text-xs font-semibold"
                  >
                    {t("password")}
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="quick-login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t("passwordPlaceholder")}
                      className="h-11 rounded-xl ps-10 pe-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || status === "loading"}
                    className="h-11 w-full rounded-xl font-semibold"
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : null}
                    {isSubmitting ? t("signingIn") : t("signIn")}
                  </Button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    {t("noAccount")}{" "}
                    <Link
                      href="/register"
                      onClick={() => {
                        setRequest(null);
                        setShowQuickLogin(false);
                      }}
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {t("createAccount")}
                    </Link>
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => setShowQuickLogin(false)}
                    className="h-9 w-full rounded-xl text-xs text-muted-foreground"
                  >
                    {t("backToMessage")}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </LoginDialogContext.Provider>
  );
}

export function useLoginDialog() {
  const context = useContext(LoginDialogContext);

  if (!context) {
    throw new Error("useLoginDialog must be used within LoginDialogProvider.");
  }

  return context;
}

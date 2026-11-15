"use client";

import { useState } from "react";
import { Copy, Dices, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type PasswordGeneratorProps = {
  onGenerate: (password: string) => void;
};

function createStrongPassword(length = 20) {
  const groups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%^&*_-+="];
  const all = groups.join("");
  const random = new Uint32Array(length);
  crypto.getRandomValues(random);
  const characters = groups.map((group, index) => group[random[index] % group.length]);
  for (let index = groups.length; index < length; index += 1) {
    characters.push(all[random[index] % all.length]);
  }
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = random[index] % (index + 1);
    [characters[index], characters[swap]] = [characters[swap], characters[index]];
  }
  return characters.join("");
}

export function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const t = useTranslations("Auth");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    const password = createStrongPassword();
    setGeneratedPassword(password);
    onGenerate(password);
    setCopied(false);
  }

  async function copyPassword() {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast.success(t("passwordCopied"));
    } catch {
      toast.error(t("copyPasswordFailed"));
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold">{t("passwordGenerator")}</p>
        <Button type="button" variant="outline" size="sm" onClick={generate} className="h-8 rounded-lg text-xs">
          <Dices className="size-3.5" />
          {t("generatePassword")}
        </Button>
      </div>
      {generatedPassword ? (
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-background px-2.5 py-2 text-xs tracking-wide">{generatedPassword}</code>
          <Button type="button" variant="ghost" size="icon" onClick={copyPassword} aria-label={t("copyPassword")} title={t("copyPassword")} className="size-9 shrink-0 rounded-lg">
            {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          </Button>
        </div>
      ) : (
        <p className="text-[11px] leading-5 text-muted-foreground">{t("passwordGeneratorHint")}</p>
      )}
    </div>
  );
}

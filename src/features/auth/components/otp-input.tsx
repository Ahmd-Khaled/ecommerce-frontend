"use client";

import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoComplete?: string;
};

export function OtpInput({ value, onChange, label, autoComplete = "one-time-code" }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.replace(/\D/g, "").slice(0, 6).split("");

  function update(nextValue: string, focusIndex?: number) {
    const next = nextValue.replace(/\D/g, "").slice(0, 6);
    onChange(next);
    if (focusIndex !== undefined && focusIndex >= 0 && focusIndex < 6) {
      inputRefs.current[focusIndex]?.focus();
    }
  }

  return (
    <div role="group" aria-label={label} dir="ltr" className="grid grid-cols-6 gap-2 sm:gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(node) => { inputRefs.current[index] = node; }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? autoComplete : "off"}
          aria-label={`${label} ${index + 1}`}
          value={digits[index] ?? ""}
          onChange={(event) => {
            const typed = event.target.value.replace(/\D/g, "");
            if (!typed) {
              const next = [...digits];
              next[index] = "";
              update(next.join(""));
              return;
            }
            if (typed.length > 1) {
              const pasted = typed.slice(0, 6);
              update(pasted, Math.min(pasted.length, 5));
              return;
            }
            const next = [...digits];
            next[index] = typed.slice(-1);
            update(next.join(""), index < 5 ? index + 1 : undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              const next = [...digits];
              next[index - 1] = "";
              update(next.join(""), index - 1);
            } else if (event.key === "ArrowLeft" && index > 0) {
              inputRefs.current[index - 1]?.focus();
            } else if (event.key === "ArrowRight" && index < 5) {
              inputRefs.current[index + 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (pasted) update(pasted, Math.min(pasted.length, 5));
          }}
          onFocus={(event) => event.currentTarget.select()}
          className="h-12 min-w-0 rounded-xl border border-input bg-background text-center text-xl font-bold tabular-nums shadow-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      ))}
    </div>
  );
}

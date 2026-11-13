type CurrencyFormatOptions = {
  locale: string;
  currency: string;
  currencyExponent?: number;
};

function resolveLocale(locale: string) {
  return locale === "ar" || locale.startsWith("ar-") ? "ar-EG" : "en-EG";
}

function createCurrencyFormatter({
  locale,
  currency,
  currencyExponent,
}: CurrencyFormatOptions) {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency.toUpperCase(),
  };

  if (currencyExponent !== undefined) {
    if (
      !Number.isInteger(currencyExponent) ||
      currencyExponent < 0 ||
      currencyExponent > 6
    ) {
      throw new RangeError("currencyExponent must be an integer from 0 to 6");
    }

    options.minimumFractionDigits = currencyExponent;
    options.maximumFractionDigits = currencyExponent;
  }

  return new Intl.NumberFormat(resolveLocale(locale), options);
}

/**
 * Formats a catalog amount already expressed in major currency units.
 * Example: 125.5 EGP must be passed as 125.5, not 12550.
 */
export function formatMajorMoney(
  amount: number,
  options: CurrencyFormatOptions,
) {
  return createCurrencyFormatter(options).format(amount);
}

/**
 * Formats an amount expressed in minor units (for example, piasters/cents).
 * The backend-provided exponent defines the conversion and display precision.
 */
export function formatMinorMoney(
  amountMinor: number,
  options: CurrencyFormatOptions & { currencyExponent: number },
) {
  const divisor = 10 ** options.currencyExponent;

  return createCurrencyFormatter(options).format(amountMinor / divisor);
}

/**
 * Backward-compatible EGP formatter for existing call sites.
 * New API-driven UI should use formatMajorMoney with the backend currency.
 */
export function formatCurrency(value: number, locale: string) {
  return formatMajorMoney(value, {
    locale,
    currency: "EGP",
    currencyExponent: 0,
  });
}

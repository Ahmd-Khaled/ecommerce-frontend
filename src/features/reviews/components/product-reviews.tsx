"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LoaderCircle, MessageSquareText, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-context";
import { useMyReviews, useProductReviews, useReviewMutations } from "@/features/reviews/hooks/use-reviews";
import type { CustomerReview, PublicReview } from "@/features/reviews/types/review.types";
import { apiErrorMessage } from "@/lib/api/axios";

function Stars({ value, label }: { value: number; label: string }) {
  return <div className="flex items-center gap-1" aria-label={label}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>;
}

export function ProductReviews({ productId }: { productId: string }) {
  const t = useTranslations("ProductReviews");
  const { status, user } = useAuth();
  const publicQuery = useProductReviews(productId);
  const mineQuery = useMyReviews();
  const mutations = useReviewMutations(productId);
  const publicReviews = useMemo(() => publicQuery.data?.pages.flatMap((page) => page.reviews) ?? [], [publicQuery.data]);
  const ownReview = useMemo<CustomerReview | undefined>(() => mineQuery.data?.pages.flatMap((page) => page.reviews).find((review) => review.productId === productId), [mineQuery.data, productId]);
  const rating = publicQuery.data?.pages[0]?.rating;
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    setScore(ownReview?.rating ?? 5);
    setText(ownReview?.text ?? "");
  }, [ownReview?.id, ownReview?.rating, ownReview?.text]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { rating: score, ...(text.trim() ? { text: text.trim() } : {}) };
    try {
      if (ownReview) {
        await mutations.update.mutateAsync({ reviewId: ownReview.id, payload });
        toast.success(t("reviewUpdated"));
      } else {
        const result = await mutations.create.mutateAsync(payload);
        toast.success(result.state === "published" ? t("reviewPublished") : t("reviewSubmitted"));
      }
    } catch (error) { toast.error(apiErrorMessage(error)); }
  }

  const isSaving = mutations.create.isPending || mutations.update.isPending;

  return (
    <section aria-labelledby="product-reviews-title" className="mt-12 border-t border-border/70 pt-9 sm:mt-16 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p><h2 id="product-reviews-title" className="mt-2 text-2xl font-bold tracking-tight">{t("title")}</h2></div>
        {rating ? <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"><div className="text-center"><p className="text-2xl font-bold tabular-nums">{rating.average.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">{t("average")}</p></div><div><Stars value={rating.average} label={`${rating.average} / 5`} /><p className="mt-1 text-[11px] text-muted-foreground">{t("basedOn", { count: rating.count })}</p></div></div> : null}
      </div>

      {publicQuery.isError ? <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm"><p className="text-destructive">{t("loadError")}</p><Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={() => void publicQuery.refetch()}>{t("retry")}</Button></div>
      : publicQuery.isLoading ? <div className="mt-7 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("loading")}</div>
      : publicReviews.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{publicReviews.map((review: PublicReview) => <article key={review.id} className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{review.reviewer?.firstName || t("reviewer")}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(review.createdAt))}</p></div><Stars value={review.rating} label={`${review.rating} / 5`} /></div><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{review.text || t("noText")}</p></article>)}</div>
      : <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center"><MessageSquareText className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">{t("noReviews")}</p><p className="mt-1 text-sm text-muted-foreground">{t("beFirst")}</p></div>}

      {publicQuery.hasNextPage ? <div className="mt-5 text-center"><Button variant="outline" className="rounded-xl" disabled={publicQuery.isFetchingNextPage} onClick={() => void publicQuery.fetchNextPage()}>{publicQuery.isFetchingNextPage ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("loadMore")}</Button></div> : null}

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{ownReview ? t("editReview") : t("writeReview")}</h3><p className="mt-1 text-xs text-muted-foreground">{t("verifiedOnly")}</p></div>{ownReview ? <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold">{t(ownReview.state)}</span> : null}</div>
        {status === "loading" || (status === "authenticated" && mineQuery.isLoading) ? <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("loading")}</div>
        : !user ? <Button asChild className="mt-4 rounded-xl"><Link href="/login">{t("signIn")}</Link></Button>
        : ownReview?.state === "removed" ? <p className="mt-4 text-sm text-muted-foreground">{t("removedNotice")}</p>
        : <form onSubmit={(event) => void submitReview(event)} className="mt-5 space-y-4"><fieldset disabled={isSaving} className="space-y-4"><legend className="mb-2 text-sm font-semibold">{t("rating")}</legend><div className="flex items-center gap-1" role="radiogroup" aria-label={t("rating")}>{Array.from({ length: 5 }, (_, index) => { const value = index + 1; return <button key={value} type="button" role="radio" aria-checked={score === value} aria-label={String(value)} onClick={() => setScore(value)} className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Star className={`size-7 ${value <= score ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} /></button>; })}</div><label className="block text-sm font-semibold" htmlFor={`review-text-${productId}`}>{t("reviewText")}</label><textarea id={`review-text-${productId}`} value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} rows={4} placeholder={t("reviewPlaceholder")} className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" /><p className="text-end text-[11px] text-muted-foreground">{text.length}/2000</p><Button type="submit" disabled={isSaving} className="rounded-xl">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}{ownReview ? t("save") : t("submit")}</Button></fieldset></form>}
        {user ? <Link href="/reviews" className="mt-4 inline-flex text-xs font-semibold text-primary underline-offset-4 hover:underline">{t("historyLink")}</Link> : null}
      </div>
    </section>
  );
}

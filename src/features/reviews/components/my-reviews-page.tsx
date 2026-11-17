"use client";

import { useState } from "react";
import { LoaderCircle, MessageSquareText, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useMyReviews, useReviewMutations } from "@/features/reviews/hooks/use-reviews";
import { apiErrorMessage } from "@/lib/api/axios";
import type { CustomerReview } from "@/features/reviews/types/review.types";

function ReviewEditor({ review, onSave, saving, labels }: { review: CustomerReview; onSave: (payload: { rating: number; text?: string | null }) => void; saving: boolean; labels: { rating: string; text: string; placeholder: string; save: string } }) {
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text ?? "");
  return <form onSubmit={(event) => { event.preventDefault(); onSave({ rating, text: text.trim() || null }); }} className="mt-4 space-y-3"><fieldset disabled={saving}><legend className="text-xs font-semibold">{labels.rating}</legend><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <button key={value} type="button" aria-label={String(value)} aria-pressed={rating === value} onClick={() => setRating(value)} className="rounded p-1"><Star className={`size-5 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} /></button>)}</div><label htmlFor={`edit-review-${review.id}`} className="mt-3 block text-xs font-semibold">{labels.text}</label><textarea id={`edit-review-${review.id}`} rows={3} maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} placeholder={labels.placeholder} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /><Button type="submit" disabled={saving} size="sm" className="mt-3 rounded-lg">{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}{labels.save}</Button></fieldset></form>;
}

export function MyReviewsPage() {
  const t = useTranslations("ProductReviews");
  const { user, status } = useAuth();
  const query = useMyReviews();
  const mutations = useReviewMutations();
  const reviews = query.data?.pages.flatMap((page) => page.reviews) ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save(reviewId: string, payload: { rating: number; text?: string | null }) {
    try { await mutations.update.mutateAsync({ reviewId, payload }); setEditingId(null); toast.success(t("reviewUpdated")); }
    catch (error) { toast.error(apiErrorMessage(error) || t("editFailed")); }
  }
  async function withdraw(reviewId: string) {
    if (!window.confirm(t("confirmWithdraw"))) return;
    try { await mutations.withdraw.mutateAsync(reviewId); toast.success(t("reviewWithdrawn")); }
    catch (error) { toast.error(apiErrorMessage(error) || t("withdrawFailed")); }
  }

  if (status === "loading" || (status === "authenticated" && query.isLoading)) return <main className="flex min-h-[55vh] items-center justify-center px-4"><LoaderCircle className="me-2 size-5 animate-spin" />{t("loading")}</main>;
  if (!user) return <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-bold">{t("signInTitle")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("signInDescription")}</p><Button asChild className="mt-5 rounded-xl"><Link href="/login">{t("signIn")}</Link></Button></main>;

  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><header className="mb-7"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("historyTitle")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("historyDescription")}</p></header>
    {query.isError ? <section className="rounded-2xl border border-border p-6 text-center"><p className="text-sm text-destructive">{t("loadHistoryFailed")}</p><Button onClick={() => void query.refetch()} variant="outline" className="mt-3 rounded-xl">{t("retry")}</Button></section>
    : reviews.length === 0 ? <section className="rounded-2xl border border-dashed border-border p-8 text-center"><MessageSquareText className="mx-auto size-9 text-muted-foreground" /><h2 className="mt-3 font-bold">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("emptyDescription")}</p><Button asChild className="mt-5 rounded-xl"><Link href="/products">{t("shopNow")}</Link></Button></section>
    : <div className="space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] text-muted-foreground">{t("product")}</p><p className="mt-1 text-xs font-semibold">{review.productId}</p></div><span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold">{t(review.state)}</span></div><div className="mt-3 flex items-center gap-1">{[1,2,3,4,5].map((value) => <Star key={value} className={`size-4 ${value <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{review.text || t("noText")}</p><p className="mt-3 text-[11px] text-muted-foreground">{t("date")}: {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(review.createdAt))}</p>{review.state !== "removed" ? <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-3"><Button size="sm" variant="outline" className="rounded-lg" onClick={() => setEditingId(editingId === review.id ? null : review.id)}>{t("edit")}</Button><Button size="sm" variant="ghost" className="rounded-lg text-destructive hover:text-destructive" disabled={mutations.withdraw.isPending} onClick={() => void withdraw(review.id)}>{mutations.withdraw.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("withdraw")}</Button></div> : null}{editingId === review.id && review.state !== "removed" ? <ReviewEditor review={review} onSave={(payload) => void save(review.id, payload)} saving={mutations.update.isPending} labels={{ rating: t("rating"), text: t("reviewText"), placeholder: t("reviewPlaceholder"), save: t("save") }} /> : null}</article>)}</div>}
    {query.hasNextPage ? <div className="mt-6 text-center"><Button variant="outline" className="rounded-xl" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("loadMore")}</Button></div> : null}
  </main>;
}

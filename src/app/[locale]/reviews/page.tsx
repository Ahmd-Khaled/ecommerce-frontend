import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My reviews",
  robots: { index: false, follow: false },
};

export { MyReviewsPage as default } from "@/features/reviews/components/my-reviews-page";

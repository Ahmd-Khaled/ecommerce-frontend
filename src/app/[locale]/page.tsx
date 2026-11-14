import { Suspense } from "react";
import { HomeContent } from "@/features/home/components/home-content";
import { HomeLoading } from "@/features/home/components/home-loading";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

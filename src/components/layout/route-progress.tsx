"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}

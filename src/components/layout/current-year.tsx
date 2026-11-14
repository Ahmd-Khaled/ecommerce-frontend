"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return new Date().getFullYear().toString();
}

function getServerSnapshot() {
  return "";
}

export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return <>{year}</>;
}

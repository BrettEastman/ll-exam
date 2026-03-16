"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/state/AuthProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

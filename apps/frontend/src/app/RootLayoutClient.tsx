"use client";

import React from "react";
import "./globals.css";
import { registerServiceWorker } from "@/lib/utils";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  return <div>{children}</div>;
}

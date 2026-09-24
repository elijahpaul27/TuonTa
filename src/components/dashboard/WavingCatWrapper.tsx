"use client";

import dynamic from "next/dynamic";

const WebGLWavingCat = dynamic(
  () => import("@/components/dashboard/WebGLWavingCat").then((mod) => ({
    default: mod.WebGLWavingCat,
  })),
  { ssr: false }
);

interface WavingCatWrapperProps {
  className?: string;
}

export function WavingCatWrapper({ className }: WavingCatWrapperProps) {
  return <WebGLWavingCat className={className} />;
}

"use client";

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PersonalizedReviewerOutput } from '@/lib/ai/prompts';
import { ExamPerformanceResult } from '@/lib/scoring';
import { ReviewerPDF } from '../reviewer/ReviewerPDF';

// Dynamically import PDFDownloadLink with ssr: false to prevent Next.js hydration crashes
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Type for the PDFDownloadLink children render prop
type BlobRenderProps = { loading: boolean; url: string | null; error: Error | null; blob: Blob | null };

interface PDFExportButtonProps {
  reviewer: PersonalizedReviewerOutput;
  performance: ExamPerformanceResult;
}

export function PDFExportButton({ reviewer, performance }: PDFExportButtonProps) {
  return (
    <div className="mt-4 sm:mt-0">
      <PDFDownloadLink
        document={<ReviewerPDF reviewer={reviewer} performance={performance} />}
        fileName={`CSC_Reviewer_${new Date().getTime()}.pdf`}
      >
        {/* @ts-expect-error — dynamic import of PDFDownloadLink loses its render-prop type */}
        {({ loading }: BlobRenderProps) => (
          <Button
            className="w-full sm:w-auto bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-md flex items-center gap-2"
            disabled={loading}
          >
            <Download className="w-4 h-4" />
            {loading ? 'Preparing PDF...' : 'Download Offline Reviewer'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}

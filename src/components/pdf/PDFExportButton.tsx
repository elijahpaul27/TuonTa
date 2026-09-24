"use client";

import dynamic from 'next/dynamic';
import { PersonalizedReviewerOutput } from '@/lib/ai/prompts';
import { StudyGuidePDF } from './StudyGuidePDF';
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// Safe dynamic import to bypass Next.js SSR constraints for @react-pdf/renderer
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
) as any;

interface PDFExportButtonProps {
  payload: PersonalizedReviewerOutput;
}

export function PDFExportButton({ payload }: PDFExportButtonProps) {
  return (
    <HoverInteractWrapper scaleAmt={1.05} className="w-auto">
      <PDFDownloadLink
        document={<StudyGuidePDF payload={payload} />}
        fileName="AI_Study_Guide_CSC_Reviewer.pdf"
        className="inline-block"
      >
        {({ loading }: { loading: boolean }) => (
          <Button
            variant="outline"
            className="flex items-center gap-2 border-csc-blue-mid/50 text-csc-blue-dark hover:bg-csc-blue-light/30 transition-colors shadow-sm bg-white/70 backdrop-blur-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Study Guide
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </HoverInteractWrapper>
  );
}

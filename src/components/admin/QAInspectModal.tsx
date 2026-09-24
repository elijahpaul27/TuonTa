"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QAInspectModalProps {
  question: any | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => Promise<void>;
}

export function QAInspectModal({ question, isOpen, onClose, onVerify }: QAInspectModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  if (!question) return null;

  const handleAction = async (status: 'VERIFIED' | 'REJECTED') => {
    setIsSubmitting(true);
    await onVerify(question.id, status, notes);
    router.refresh();
    setIsSubmitting(false);
    setNotes("");
    onClose();
  };

  let parsedOptions: any[] = [];
  try {
    parsedOptions = typeof question.options === 'string' 
      ? JSON.parse(question.options) 
      : question.options || [];
  } catch (e) {
    console.error("Failed to parse options", e);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border border-csc-blue-mid max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <div className="p-6 border-b shrink-0 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-csc-blue-dark">QA Inspect Question</DialogTitle>
            <DialogDescription className="text-slate-500">
              {question.subject} &gt; {question.topic} | Difficulty: {question.difficulty}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-csc-blue-mid/30">
            <h4 className="font-semibold text-slate-800 mb-2">Question Text:</h4>
            <p className="text-slate-900 text-lg">{question.questionText}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Options:</h4>
            <ul className="space-y-2">
              {parsedOptions.map((opt: { id: string; text: string }, idx: number) => (
                <li key={idx} className="p-3 bg-white border border-slate-200 rounded-md text-slate-700">
                  <strong>{opt.id})</strong> {opt.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-1">Correct Answer:</h4>
            <p className="text-green-900">{question.correctAnswer}</p>
            <h4 className="font-bold text-green-800 mt-2 mb-1">Explanation:</h4>
            <p className="text-green-900">{question.explanation}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">QA Notes (Required if Rejecting)</label>
            <Textarea 
              placeholder="Leave feedback for the content author if rejecting..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-csc-blue-mid focus-visible:ring-csc-blue-dark"
            />
          </div>
        </div>

        <div className="p-6 border-t bg-white sticky bottom-0 flex justify-end gap-3 shrink-0">
          <Button 
            variant="destructive" 
            onClick={() => handleAction('REJECTED')}
            disabled={isSubmitting || (notes.trim().length === 0)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleAction('VERIFIED')}
            disabled={isSubmitting}
            className="bg-csc-yellow text-slate-900 font-bold hover:brightness-95"
          >
            Approve & Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

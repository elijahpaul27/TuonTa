"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Question } from "@prisma/client";

interface QuestionQATableProps {
  questions: Question[];
  onInspect: (question: Question) => void;
  onBulkVerify?: (ids: string[]) => Promise<void>;
}

export function QuestionQATable({ questions, onInspect, onBulkVerify }: QuestionQATableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border border-csc-blue-mid/30 text-slate-500">
        No DRAFT questions pending QA at this moment.
      </div>
    );
  }

  const allSelected = questions.length > 0 && selectedIds.length === questions.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      if (onBulkVerify) {
        await onBulkVerify(selectedIds);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error doing bulk verify:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex justify-between items-center bg-csc-blue-light/30 p-4 rounded-lg border border-csc-blue-mid">
          <span className="text-csc-blue-dark font-semibold">
            {selectedIds.length} question(s) selected
          </span>
          <Button 
            onClick={handleBulkApprove} 
            disabled={isSubmitting}
            className="bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-sm"
          >
            Bulk Approve & Verify ({selectedIds.length})
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-csc-blue-mid/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-csc-blue-light/20">
            <TableRow className="border-b-csc-blue-mid">
              <TableHead className="w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-csc-blue-mid text-csc-blue-dark focus:ring-csc-blue-light cursor-pointer"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold text-csc-blue-dark">Subject</TableHead>
              <TableHead className="font-bold text-csc-blue-dark">Topic</TableHead>
              <TableHead className="font-bold text-csc-blue-dark">Difficulty</TableHead>
              <TableHead className="font-bold text-csc-blue-dark">Snippet</TableHead>
              <TableHead className="font-bold text-csc-blue-dark text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id} className="hover:bg-slate-50 border-b-slate-100">
                <TableCell className="text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-csc-blue-mid text-csc-blue-dark focus:ring-csc-blue-light cursor-pointer"
                    checked={selectedIds.includes(q.id)}
                    onChange={() => toggleSelectRow(q.id)}
                  />
                </TableCell>
                <TableCell className="font-medium text-slate-700">{q.subject}</TableCell>
                <TableCell className="text-slate-600">{q.topic}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-semibold">
                    {q.difficulty}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 truncate max-w-[200px]">
                  {q.questionText}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={() => onInspect(q)}
                    className="bg-csc-blue-mid text-white hover:bg-csc-blue-dark shadow-sm"
                  >
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

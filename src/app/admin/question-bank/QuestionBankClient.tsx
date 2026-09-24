"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionBankClientProps {
  initialQuestions: Question[];
  totalCount: number;
  currentPage: number;
  limit: number;
}

export function QuestionBankClient({ initialQuestions, totalCount, currentPage, limit }: QuestionBankClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const totalPages = Math.ceil(totalCount / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/admin/question-bank?page=${newPage}`);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingQuestion) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      questionText: formData.get("questionText") as string,
      correctAnswer: formData.get("correctAnswer") as string,
      explanation: formData.get("explanation") as string,
      options: [
        { id: "A", text: formData.get("optionA") as string },
        { id: "B", text: formData.get("optionB") as string },
        { id: "C", text: formData.get("optionC") as string },
        { id: "D", text: formData.get("optionD") as string },
      ],
    };

    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast.success("Question updated successfully");
      
      // Optimistically update the UI
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, ...updatedData, options: updatedData.options as any } 
          : q
      ));
      
      setEditingQuestion(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update question");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <HoverInteractWrapper scaleAmt={1.02} className="w-full">
        <div className="!bg-white/70 !backdrop-blur-md rounded-xl border border-csc-blue-mid/50 overflow-hidden shadow-lg p-2">
          <Table>
            <TableHeader className="bg-csc-blue-light/30">
              <TableRow className="border-b-csc-blue-mid">
                <TableHead className="font-bold text-csc-blue-dark">Question Text</TableHead>
                <TableHead className="font-bold text-csc-blue-dark w-48">Subject</TableHead>
                <TableHead className="font-bold text-csc-blue-dark w-32">Status</TableHead>
                <TableHead className="font-bold text-csc-blue-dark text-right w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id} className="hover:bg-white/50 border-b-csc-blue-mid/30 transition-colors">
                  <TableCell className="text-slate-700 truncate max-w-sm" title={q.questionText}>
                    {q.questionText}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{q.subject}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                      q.status === 'VERIFIED' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {q.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <HoverInteractWrapper scaleAmt={1.05} className="inline-block">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingQuestion(q)}
                        className="text-csc-blue-dark hover:bg-csc-blue-light/50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </HoverInteractWrapper>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-8 text-slate-500">
                    No questions found in the bank.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </HoverInteractWrapper>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <HoverInteractWrapper scaleAmt={1.05}>
            <Button 
              variant="outline" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="!bg-white/70 !backdrop-blur-md border-csc-blue-mid/50 text-csc-blue-dark shadow-sm"
            >
              Previous
            </Button>
          </HoverInteractWrapper>
          
          <span className="text-slate-700 font-semibold bg-white/50 px-4 py-2 rounded-full border border-csc-blue-mid/30">
            Page {currentPage} of {totalPages}
          </span>
          
          <HoverInteractWrapper scaleAmt={1.05}>
            <Button 
              variant="outline" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="!bg-white/70 !backdrop-blur-md border-csc-blue-mid/50 text-csc-blue-dark shadow-sm"
            >
              Next
            </Button>
          </HoverInteractWrapper>
        </div>
      )}

      {/* Edit Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !bg-white/95 !backdrop-blur-xl border-csc-blue-mid/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-csc-blue-dark">Edit Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="questionText" className="font-bold text-slate-700">Question Text</Label>
                <Textarea 
                  id="questionText" 
                  name="questionText" 
                  defaultValue={editingQuestion.questionText} 
                  required 
                  className="min-h-[100px] border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  // Safely extract option text
                  let options = [];
                  if (typeof editingQuestion.options === 'string') {
                    try { options = JSON.parse(editingQuestion.options); } catch (e) {}
                  } else if (Array.isArray(editingQuestion.options)) {
                    options = editingQuestion.options;
                  }
                  
                  const option = options.find((o: any) => o.id === letter);
                  return (
                    <div key={letter} className="space-y-2">
                      <Label htmlFor={`option${letter}`} className="font-bold text-slate-700">Option {letter}</Label>
                      <Input 
                        id={`option${letter}`} 
                        name={`option${letter}`} 
                        defaultValue={option?.text || ""} 
                        required 
                        className="border-slate-300"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correctAnswer" className="font-bold text-slate-700">Correct Answer (A, B, C, or D)</Label>
                <Input 
                  id="correctAnswer" 
                  name="correctAnswer" 
                  defaultValue={editingQuestion.correctAnswer} 
                  required 
                  pattern="[A-D]"
                  maxLength={1}
                  className="uppercase border-slate-300 w-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation" className="font-bold text-slate-700">Explanation</Label>
                <Textarea 
                  id="explanation" 
                  name="explanation" 
                  defaultValue={editingQuestion.explanation || ""} 
                  required 
                  className="min-h-[100px] border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" type="button" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

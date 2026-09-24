"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

export function AIGeneratorModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [level, setLevel] = useState("Professional");
  const [subject, setSubject] = useState("");

  const handleGenerate = async () => {
    if (!subject) {
      toast.error("Select a subject first.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, subject }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate questions.");
      }

      toast.success("Questions generated!", {
        description: "5 new AI-generated questions added to the DRAFT queue.",
      });

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error("Generation failed", {
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <HoverInteractWrapper scaleAmt={1.05}>
          <Button className="bg-csc-yellow text-slate-900 font-bold hover:brightness-95 h-9 px-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generator
          </Button>
        </HoverInteractWrapper>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-csc-blue-mid">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-csc-blue-dark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Question Generator
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Generate 5 DRAFT questions using Groq (openai/gpt-oss-20b).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="level" className="text-csc-blue-dark font-semibold">
              Exam Level
            </Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger id="level" className="bg-white border-csc-blue-mid">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Sub-Professional">Sub-Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-csc-blue-dark font-semibold">
              Subject Focus
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject" className="bg-white border-csc-blue-mid">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="General Information">General Information</SelectItem>
                {level === "Sub-Professional" && (
                  <SelectItem value="Clerical Operations">Clerical Operations</SelectItem>
                )}
                {level === "Professional" && (
                  <SelectItem value="Logic and Reasoning">Logic and Reasoning</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !subject}
          className="w-full bg-csc-yellow text-slate-900 font-bold hover:brightness-95 h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate 5 Questions"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

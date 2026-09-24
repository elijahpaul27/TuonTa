"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  "Mathematics",
  "English",
  "General Information",
  "Clerical Operations",
  "Analytical Ability",
];

const DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const OPTION_IDS = ["A", "B", "C", "D"];

// ── Types ─────────────────────────────────────────────────────────────────────

interface OptionField {
  id: string;
  text: string;
}

interface FormState {
  subject: string;
  topic: string;
  difficulty: string;
  questionText: string;
  options: OptionField[];
  correctAnswer: string;
  explanation: string;
}

const EMPTY_FORM: FormState = {
  subject: "",
  topic: "",
  difficulty: "MEDIUM",
  questionText: "",
  options: OPTION_IDS.map((id) => ({ id, text: "" })),
  correctAnswer: "",
  explanation: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function QuestionUploadForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "options_text", string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setOptionText = (index: number, text: string) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], text };
      return { ...prev, options };
    });
    setErrors((prev) => ({ ...prev, options_text: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!form.subject) newErrors.subject = "Subject is required.";
    if (!form.topic.trim()) newErrors.topic = "Topic is required.";
    if (!form.difficulty) newErrors.difficulty = "Difficulty is required.";
    if (!form.questionText.trim()) newErrors.questionText = "Question text is required.";
    if (form.options.some((o) => !o.text.trim()))
      newErrors.options_text = "All 4 option texts are required.";
    if (!form.correctAnswer) newErrors.correctAnswer = "Please select the correct answer.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          topic: form.topic.trim(),
          difficulty: form.difficulty,
          questionText: form.questionText.trim(),
          options: form.options.map((o) => ({ id: o.id, text: o.text.trim() })),
          correctAnswer: form.correctAnswer,
          explanation: form.explanation.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create question.");
      }

      toast.success("Question submitted for review!", {
        description: "It will appear in the DRAFT queue above for QA approval.",
      });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err: unknown) {
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────

  return (
    <Card className="!bg-white/70 !backdrop-blur-md border-slate-200/60 shadow-sm border-2">
      <CardHeader className="border-b border-csc-blue-mid/30 pb-4">
        <div className="flex items-center gap-2 text-csc-blue-dark">
          <PlusCircle className="w-5 h-5" />
          <CardTitle className="text-xl font-bold">Add New Question</CardTitle>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Questions are saved as <span className="font-semibold text-amber-600">DRAFT</span> and
          must be approved in the QA table before serving to users.
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Row 1: Subject + Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-csc-blue-dark font-semibold">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select value={form.subject} onValueChange={(v) => setField("subject", v)}>
                <SelectTrigger
                  id="subject"
                  className={`bg-white border-csc-blue-mid focus:ring-csc-blue-dark ${errors.subject ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty" className="text-csc-blue-dark font-semibold">
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select value={form.difficulty} onValueChange={(v) => setField("difficulty", v)}>
                <SelectTrigger
                  id="difficulty"
                  className={`bg-white border-csc-blue-mid focus:ring-csc-blue-dark ${errors.difficulty ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Select difficulty..." />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && <p className="text-xs text-red-500">{errors.difficulty}</p>}
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-csc-blue-dark font-semibold">
              Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g. Subject-Verb Agreement, Ratios, Philippine History"
              value={form.topic}
              onChange={(e) => setField("topic", e.target.value)}
              className={`bg-white border-csc-blue-mid focus-visible:ring-csc-blue-dark ${errors.topic ? "border-red-400" : ""}`}
            />
            {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <Label htmlFor="questionText" className="text-csc-blue-dark font-semibold">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="questionText"
              placeholder="Enter the full question here..."
              value={form.questionText}
              onChange={(e) => setField("questionText", e.target.value)}
              rows={3}
              className={`bg-white border-csc-blue-mid focus-visible:ring-csc-blue-dark resize-none ${errors.questionText ? "border-red-400" : ""}`}
            />
            {errors.questionText && (
              <p className="text-xs text-red-500">{errors.questionText}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-csc-blue-dark font-semibold">
              Answer Options <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-500 -mt-1">
              Fill in all 4 options, then select the correct one.
            </p>
            <div className="space-y-2">
              {form.options.map((option, idx) => (
                <div key={option.id} className="flex items-center gap-3">
                  {/* Correct answer selector */}
                  <button
                    type="button"
                    onClick={() => setField("correctAnswer", option.id)}
                    title={`Mark option ${option.id} as correct`}
                    className={`flex-none w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                      form.correctAnswer === option.id
                        ? "bg-csc-blue-dark border-csc-blue-dark text-white"
                        : "bg-white border-csc-blue-mid text-csc-blue-dark hover:border-csc-blue-dark"
                    }`}
                  >
                    {form.correctAnswer === option.id ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      option.id
                    )}
                  </button>
                  <Input
                    placeholder={`Option ${option.id}`}
                    value={option.text}
                    onChange={(e) => setOptionText(idx, e.target.value)}
                    className={`bg-white border-csc-blue-mid focus-visible:ring-csc-blue-dark ${
                      errors.options_text && !option.text.trim() ? "border-red-400" : ""
                    }`}
                  />
                </div>
              ))}
            </div>
            {errors.options_text && (
              <p className="text-xs text-red-500">{errors.options_text}</p>
            )}
            {errors.correctAnswer && (
              <p className="text-xs text-red-500">{errors.correctAnswer}</p>
            )}
            <p className="text-xs text-slate-400">
              💡 Click the letter circle to mark the correct answer.
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label htmlFor="explanation" className="text-csc-blue-dark font-semibold">
              Explanation{" "}
              <span className="text-slate-400 font-normal">(optional but recommended)</span>
            </Label>
            <Textarea
              id="explanation"
              placeholder="Explain why the correct answer is correct..."
              value={form.explanation}
              onChange={(e) => setField("explanation", e.target.value)}
              rows={3}
              className="bg-white border-csc-blue-mid focus-visible:ring-csc-blue-dark resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <HoverInteractWrapper scaleAmt={1.05}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-sm h-11 px-8 flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Submit Question
                  </>
                )}
              </Button>
            </HoverInteractWrapper>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}
              className="text-slate-500 hover:text-red-500 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

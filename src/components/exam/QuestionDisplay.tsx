import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  questionText: string;
  options: { id: string; text: string }[] | string; // Allow string in case it comes unparsed
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerChange: (answerId: string) => void;
}

export function QuestionDisplay({ question, selectedAnswer, onAnswerChange }: QuestionDisplayProps) {
  let parsedOptions: { id: string; text: string }[] = [];
  try {
    if (Array.isArray(question.options)) {
      parsedOptions = question.options;
    } else if (typeof question.options === "string") {
      let parsed = JSON.parse(question.options);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed); // handle double-stringified JSON
      }
      if (Array.isArray(parsed)) {
        parsedOptions = parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse options for question:", question.id, err);
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-csc-blue-mid/30 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
        {question.questionText}
      </h2>

      {parsedOptions.length === 0 ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-semibold">Error loading options.</p>
          <p className="text-sm">The options for this question are malformed.</p>
        </div>
      ) : (
        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={onAnswerChange}
          className="space-y-4"
        >
          {parsedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-csc-blue-mid/50 transition-colors"
            >
              <RadioGroupItem value={option.id} id={option.id} className="border-csc-blue-dark text-csc-blue-dark" />
              <Label htmlFor={option.id} className="text-base text-slate-800 cursor-pointer flex-1">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}</div>

  );
}

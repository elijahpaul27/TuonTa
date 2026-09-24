import { Button } from "@/components/ui/button";

interface ExamControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmitClick: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ExamControls({ onPrevious, onNext, onSubmitClick, hasPrevious, hasNext }: ExamControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
      <div className="flex space-x-4 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex-1 sm:flex-none border-csc-blue-mid text-csc-blue-dark hover:bg-csc-blue-light/30"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!hasNext}
          className="flex-1 sm:flex-none border-csc-blue-mid text-csc-blue-dark hover:bg-csc-blue-light/30 bg-csc-blue-light/10"
        >
          Next
        </Button>
      </div>
      
      <Button
        onClick={onSubmitClick}
        className="w-full sm:w-auto bg-csc-yellow text-slate-900 font-semibold hover:brightness-95 shadow-md px-8 py-2 h-auto text-lg"
      >
        Submit Exam
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Plus, X, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";

export function AdminPolls() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selectType, setSelectType] = useState<"single" | "multi">("single");
  const [resultsPublic, setResultsPublic] = useState(true);
  const [closeTime, setCloseTime] = useState("2");

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto lg:mx-0">
      <Toaster position="top-center" richColors />

      <h2 className="text-[20px] text-foreground mb-1">Poll Builder</h2>
      <p className="text-[12px] text-muted-foreground mb-5">Create a poll post</p>

      <div className="bg-white rounded-2xl border border-border/50 p-4 space-y-5">
        {/* Question */}
        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Question</label>
          <input
            type="text"
            placeholder="What would you like to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {/* Options */}
        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Options</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground w-4 text-center tabular-nums">{i + 1}</span>
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption} className="flex items-center gap-1 mt-2 text-[12px] text-primary hover:text-green-700 transition">
            <Plus className="w-3.5 h-3.5" /> Add option
          </button>
        </div>

        {/* Select type */}
        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Selection</label>
          <div className="flex gap-2">
            {(["single", "multi"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectType(type)}
                className={`flex-1 py-2 rounded-xl text-[13px] transition ${
                  selectType === type ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {type === "single" ? "Single" : "Multi"} select
              </button>
            ))}
          </div>
        </div>

        {/* Close time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[13px] text-foreground">Close after</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="168"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-16 h-9 px-2 rounded-xl bg-input-background border border-border text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-center tabular-nums"
            />
            <span className="text-[13px] text-muted-foreground">hours</span>
          </div>
        </div>

        {/* Results public */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-foreground">Results public</span>
          <button
            onClick={() => setResultsPublic(!resultsPublic)}
            className={`w-10 h-[22px] rounded-full transition relative ${resultsPublic ? "bg-primary" : "bg-switch-background"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${resultsPublic ? "translate-x-[18px]" : ""}`} />
          </button>
        </div>
      </div>

      <button
        onClick={() => toast.success("Poll published!")}
        className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition text-[14px]"
      >
        Publish poll
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, CheckSquare, List, AlignLeft, Save, Copy, Loader2, Highlighter } from "lucide-react";
import { 
  useExplainText, 
  useGenerateTest, 
  useGenerateNotes, 
  useSummarizeText,
  useCreateNote,
  McqQuestion
} from "@workspace/api-client-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/beautiful-components";

interface AiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  bookId?: number;
}

export function AiPanel({ isOpen, onClose, selectedText, bookId }: AiPanelProps) {
  const [activeTab, setActiveTab] = useState<"explain" | "test" | "notes" | "summary" | null>(null);
  const [resultText, setResultText] = useState<string>("");
  const [testQuestions, setTestQuestions] = useState<McqQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  const explainMut = useExplainText();
  const testMut = useGenerateTest();
  const notesMut = useGenerateNotes();
  const summaryMut = useSummarizeText();
  const saveNoteMut = useCreateNote();

  // Reset when text changes
  useEffect(() => {
    if (isOpen && selectedText) {
      setActiveTab(null);
      setResultText("");
      setTestQuestions([]);
      setUserAnswers({});
    }
  }, [selectedText, isOpen]);

  const isProcessing = explainMut.isPending || testMut.isPending || notesMut.isPending || summaryMut.isPending;

  const handleAction = (action: "explain" | "test" | "notes" | "summary") => {
    setActiveTab(action);
    setResultText("");
    setTestQuestions([]);
    
    const payload = { data: { text: selectedText, bookId } };

    if (action === "explain") {
      explainMut.mutate(payload, { onSuccess: (res) => setResultText(res.result) });
    } else if (action === "test") {
      testMut.mutate(payload, { onSuccess: (res) => setTestQuestions(res.questions) });
    } else if (action === "notes") {
      notesMut.mutate(payload, { onSuccess: (res) => setResultText(res.result) });
    } else if (action === "summary") {
      summaryMut.mutate(payload, { onSuccess: (res) => setResultText(res.result) });
    }
  };

  const handleSaveNote = () => {
    if (!resultText && testQuestions.length === 0) return;
    
    let content = resultText;
    if (activeTab === "test" && testQuestions.length > 0) {
      content = testQuestions.map((q, i) => `**Q${i+1}: ${q.question}**\n- A: ${q.options[0]}\n- B: ${q.options[1]}\n- C: ${q.options[2]}\n- D: ${q.options[3]}\n\n*Answer: ${q.options[q.correctIndex]}*`).join('\n\n');
    }

    saveNoteMut.mutate({
      data: {
        title: `${activeTab?.charAt(0).toUpperCase()}${activeTab?.slice(1)} - ${new Date().toLocaleDateString()}`,
        content,
        sourceText: selectedText,
        bookId,
        aiAction: activeTab
      }
    }, {
      onSuccess: () => {
        alert("Note saved successfully!");
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-white border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between bg-sidebar/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg">AI Assistant</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {/* Selected Text Preview */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Highlighter className="w-3 h-3" /> Selected Text
                </p>
                <p className="text-sm text-amber-900/80 italic line-clamp-4">"{selectedText}"</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant={activeTab === "explain" ? "primary" : "secondary"} 
                  leftIcon={<Brain className="w-4 h-4" />}
                  onClick={() => handleAction("explain")}
                  disabled={isProcessing}
                >
                  Explain (UZ)
                </Button>
                <Button 
                  size="sm" 
                  variant={activeTab === "test" ? "primary" : "secondary"} 
                  leftIcon={<CheckSquare className="w-4 h-4" />}
                  onClick={() => handleAction("test")}
                  disabled={isProcessing}
                >
                  Create MCQ
                </Button>
                <Button 
                  size="sm" 
                  variant={activeTab === "notes" ? "primary" : "secondary"} 
                  leftIcon={<List className="w-4 h-4" />}
                  onClick={() => handleAction("notes")}
                  disabled={isProcessing}
                >
                  To Notes
                </Button>
                <Button 
                  size="sm" 
                  variant={activeTab === "summary" ? "primary" : "secondary"} 
                  leftIcon={<AlignLeft className="w-4 h-4" />}
                  onClick={() => handleAction("summary")}
                  disabled={isProcessing}
                >
                  Summarize
                </Button>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-primary">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium animate-pulse">Processing clinical text...</p>
                </div>
              )}

              {/* Results Area */}
              {!isProcessing && activeTab && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col bg-white rounded-xl border border-border shadow-sm overflow-hidden"
                >
                  <div className="bg-sidebar px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Result</span>
                    <div className="flex gap-1">
                      {resultText && (
                        <button onClick={copyToClipboard} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Copy">
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={handleSaveNote} disabled={saveNoteMut.isPending} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Save to Notes">
                        {saveNoteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 overflow-y-auto max-h-[50vh] prose prose-sm prose-teal max-w-none">
                    {activeTab !== "test" && resultText && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{resultText}</ReactMarkdown>
                    )}

                    {activeTab === "test" && testQuestions.length > 0 && (
                      <div className="space-y-6">
                        {testQuestions.map((q, qIndex) => (
                          <div key={qIndex} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-800 mb-3">{qIndex + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, oIndex) => {
                                const isSelected = userAnswers[qIndex] === oIndex;
                                const showCorrect = userAnswers[qIndex] !== undefined;
                                const isCorrect = q.correctIndex === oIndex;
                                
                                let btnClass = "border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-700";
                                if (showCorrect) {
                                  if (isCorrect) btnClass = "bg-emerald-100 border-emerald-300 text-emerald-800 font-medium";
                                  else if (isSelected) btnClass = "bg-red-100 border-red-300 text-red-800";
                                  else btnClass = "opacity-50 border-slate-200";
                                }

                                return (
                                  <button
                                    key={oIndex}
                                    disabled={showCorrect}
                                    onClick={() => setUserAnswers(prev => ({...prev, [qIndex]: oIndex}))}
                                    className={`w-full text-left px-4 py-2 rounded-lg border transition-all text-sm ${btnClass}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {userAnswers[qIndex] !== undefined && q.explanation && (
                              <div className="mt-3 text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-600">
                                <span className="font-bold text-primary">Explanation:</span> {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetBook, useCreateHighlight } from "@workspace/api-client-react";
import { AiPanel } from "@/components/ai-panel";
import { Loader2, ArrowLeft, Brain, Highlighter, LayoutList } from "lucide-react";
// react-pdf setup
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from "framer-motion";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Reader() {
  const { id } = useParams();
  const bookId = parseInt(id || "0");
  const { data: book, isLoading } = useGetBook(bookId);
  const createHighlightMut = useCreateHighlight();
  
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  
  // Selection state
  const [selectionText, setSelectionText] = useState("");
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0, show: false });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if clicking inside the popover itself
      if ((e.target as HTMLElement).closest('.selection-popover')) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        
        if (text && text.length > 5 && selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionText(text);
          setPopoverPos({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
        } else {
          setPopoverPos({ show: false, x: 0, y: 0 });
        }
      }, 50);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const openAiPanel = () => {
    setAiPanelOpen(true);
    setPopoverPos({ show: false, x: 0, y: 0 });
  };

  const saveHighlight = () => {
    createHighlightMut.mutate({
      data: {
        bookId,
        selectedText: selectionText,
        pageNumber,
        color: '#14b8a6' // Teal
      }
    }, {
      onSuccess: () => {
        setPopoverPos({ show: false, x: 0, y: 0 });
        // Visual feedback could be added here
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="p-8">Book not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full relative bg-slate-50">
        
        {/* Left Toolbar (Minimal) */}
        <div className="hidden lg:flex w-16 flex-col items-center py-4 bg-white border-r border-border shadow-sm z-10">
          <Link href="/" className="p-3 text-muted-foreground hover:bg-black/5 rounded-xl hover:text-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-4">
            <button className="p-3 bg-primary/10 text-primary rounded-xl" title="Document Structure">
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Reader Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative" ref={contentRef}>
          {/* Header */}
          <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <Link href="/" className="lg:hidden p-2 -ml-2 text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="font-display font-bold text-lg truncate max-w-md">{book.title}</h2>
            </div>
            
            {book.fileType === 'pdf' && numPages && (
              <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <button 
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(p => p - 1)}
                  className="px-2 font-medium hover:text-primary disabled:opacity-50"
                >-</button>
                <span className="text-sm font-semibold">Page {pageNumber} of {numPages}</span>
                <button 
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(p => p + 1)}
                  className="px-2 font-medium hover:text-primary disabled:opacity-50"
                >+</button>
              </div>
            )}
          </header>

          {/* Reader Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center hide-scrollbar">
            {book.fileType === 'pdf' ? (
              <div className="shadow-2xl rounded-xl overflow-hidden bg-white max-w-full">
                <Document
                  file={book.fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div className="p-20 flex flex-col items-center"><Loader2 className="w-8 h-8 animate-spin text-primary mb-4" /> Loading PDF...</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={true} 
                    renderAnnotationLayer={true}
                    className="max-w-full"
                    width={Math.min(window.innerWidth - 100, 800)}
                  />
                </Document>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-border max-w-4xl w-full prose prose-teal prose-lg">
                {/* Fallback for non-pdf in MVP */}
                <div className="p-8 bg-amber-50 border border-amber-200 rounded-xl mb-8">
                  <p className="text-amber-800 m-0">Non-PDF content preview. In a full implementation, the actual text content of DOCX/TXT would be rendered here.</p>
                </div>
                <h2>Chapter 1: Introduction to Clinical Anatomy</h2>
                <p>Clinical anatomy is the practical application of anatomical knowledge to diagnosis and treatment. It highlights the structure and function of the body, specifically as it relates to the practice of medicine and other health sciences.</p>
                <p>Try highlighting this text to see the AI integration tools appear. The AI can summarize, explain in simple terms, or generate test questions based on the selected passage.</p>
                <p>The human body consists of various systems, including the cardiovascular system, respiratory system, nervous system, and musculoskeletal system. Each system has a specific function but they all work synergistically.</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Selection Popover */}
        <AnimatePresence>
          {popoverPos.show && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="selection-popover fixed z-50 flex items-center gap-1 bg-foreground text-background px-2 py-1.5 rounded-xl shadow-2xl shadow-black/20 border border-white/10"
              style={{ left: popoverPos.x, top: popoverPos.y, transform: 'translate(-50%, -100%)' }}
            >
              <button 
                onClick={openAiPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-sm font-semibold whitespace-nowrap"
              >
                <Brain className="w-4 h-4 text-emerald-400" />
                Ask AI
              </button>
              <div className="w-[1px] h-4 bg-white/20 mx-1" />
              <button 
                onClick={saveHighlight}
                disabled={createHighlightMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-sm font-semibold whitespace-nowrap text-teal-300"
              >
                <Highlighter className="w-4 h-4" />
                Highlight
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right AI Panel */}
        <AiPanel 
          isOpen={aiPanelOpen} 
          onClose={() => setAiPanelOpen(false)} 
          selectedText={selectionText}
          bookId={book.id}
        />
      </div>
    </Layout>
  );
}

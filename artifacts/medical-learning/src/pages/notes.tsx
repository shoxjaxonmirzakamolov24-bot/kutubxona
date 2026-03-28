import { Layout } from "@/components/layout";
import { useGetNotes, useDeleteNote } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/ui/beautiful-components";
import { formatDate } from "@/lib/utils";
import { Trash2, FileText, Brain, LayoutList, AlignLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Notes() {
  const { data: notes, isLoading } = useGetNotes();
  const deleteMut = useDeleteNote();

  const getActionIcon = (action: string | null | undefined) => {
    switch(action) {
      case 'explain': return <Brain className="w-4 h-4" />;
      case 'test': return <LayoutList className="w-4 h-4" />;
      case 'summary': return <AlignLeft className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const actionLabels: Record<string, string> = {
    explain: "Tushuntirish",
    test: "Test",
    summary: "Xulosa",
    notes: "Eslatmalar"
  };

  const getActionBadge = (action: string | null | undefined) => {
    if (!action) return null;
    const variants: Record<string, "success"|"warning"|"purple"|"default"> = {
      explain: "purple",
      test: "warning",
      summary: "success",
      notes: "default"
    };
    return (
      <Badge variant={variants[action] || "default"} className="flex items-center gap-1">
        {getActionIcon(action)} <span className="ml-1">{actionLabels[action] || action}</span>
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="p-8 h-full flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Eslatmalarim</h1>
          <p className="text-muted-foreground mt-1">AI yordamida saqlangan tushuntirishlar, xulosalar va testlar</p>
        </header>

        {isLoading ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-border" />)}
          </div>
        ) : notes?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <img src={`${import.meta.env.BASE_URL}images/empty-notes.png`} alt="Eslatmalar yo'q" className="w-64 h-64 object-contain mb-6 drop-shadow-xl" />
            <h3 className="text-2xl font-display font-bold text-foreground">Hali eslatmalar yo'q</h3>
            <p className="text-muted-foreground mt-2 max-w-md">Kitob oching, matnni tanlang va AI yordamida tushuntirishlar, xulosalar yoki testlar yarating. Ularni keyinchalik o'rganish uchun bu yerda saqlang.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {notes?.map((note) => (
              <Card key={note.id} className="break-inside-avoid shadow-md border-border/60 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">{note.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getActionBadge(note.aiAction)}
                      <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMut.mutate({ id: note.id })}
                    disabled={deleteMut.isPending}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {note.sourceText && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-xs text-slate-500 italic border-l-2 border-l-primary/50">
                    "{note.sourceText}"
                  </div>
                )}

                <div className="prose prose-sm prose-teal max-w-none text-foreground/80">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

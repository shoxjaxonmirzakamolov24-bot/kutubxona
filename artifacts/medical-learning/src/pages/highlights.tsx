import { Layout } from "@/components/layout";
import { useGetHighlights, useDeleteHighlight, useGetBooks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/beautiful-components";
import { formatDate } from "@/lib/utils";
import { Trash2, BookOpen, MapPin } from "lucide-react";

export default function Highlights() {
  const { data: highlights, isLoading } = useGetHighlights();
  const { data: books } = useGetBooks();
  const deleteMut = useDeleteHighlight();

  const getBookTitle = (bookId: number) => {
    return books?.find(b => b.id === bookId)?.title || `Book #${bookId}`;
  };

  return (
    <Layout>
      <div className="p-8 h-full flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Highlights</h1>
          <p className="text-muted-foreground mt-1">Important text marked across your library</p>
        </header>

        {isLoading ? (
          <div className="flex-1 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-border" />)}
          </div>
        ) : highlights?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <Highlighter className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground">No highlights found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">Open a book and select text to highlight important passages.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 space-y-4 max-w-4xl">
            {highlights?.map((highlight) => (
              <Card key={highlight.id} className="flex gap-4 p-5 hover:border-primary/30 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: highlight.color }} />
                
                <div className="flex-1">
                  <p className="text-lg text-foreground font-medium mb-3 leading-relaxed">
                    "{highlight.selectedText}"
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> {getBookTitle(highlight.bookId)}</span>
                    {highlight.pageNumber && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Page {highlight.pageNumber}</span>
                    )}
                    <span>{formatDate(highlight.createdAt)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => deleteMut.mutate({ id: highlight.id })}
                  disabled={deleteMut.isPending}
                  className="self-start p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

// Needed local import since we used it in empty state
import { Highlighter } from "lucide-react";

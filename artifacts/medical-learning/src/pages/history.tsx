import { Layout } from "@/components/layout";
import { useGetAiHistory } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/ui/beautiful-components";
import { formatDate } from "@/lib/utils";
import { Brain, History as HistoryIcon } from "lucide-react";

const actionLabels: Record<string, string> = {
  explain: "Tushuntirish",
  test: "Test",
  summary: "Xulosa",
  notes: "Eslatmalar"
};

export default function History() {
  const { data: history, isLoading } = useGetAiHistory();

  return (
    <Layout>
      <div className="p-8 h-full flex flex-col bg-slate-50/50">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">AI Tarixi</h1>
          <p className="text-muted-foreground mt-1">Sun'iy intellekt bilan barcha muloqotlar jurnali</p>
        </header>

        {isLoading ? (
          <div className="flex-1 space-y-6 max-w-3xl border-l-2 border-border ml-4 pl-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-border" />)}
          </div>
        ) : history?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <HistoryIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground">Tarix mavjud emas</h3>
            <p className="text-muted-foreground mt-2 max-w-md">AI yordamchisi bilan muloqotlaringiz bu yerda ko'rsatiladi.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 max-w-4xl">
            <div className="relative border-l-2 border-primary/20 ml-6 pl-8 space-y-8 py-4">
              {history?.map((entry) => (
                <div key={entry.id} className="relative">
                  <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full bg-white border-4 border-primary shadow-sm" />

                  <Card className="shadow-sm border-border hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="purple" className="flex items-center gap-1.5 shadow-sm">
                          <Brain className="w-3 h-3" /> {actionLabels[entry.action] || entry.action.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                      <p className="text-sm font-medium text-slate-700 italic">" {entry.inputText.length > 150 ? entry.inputText.substring(0, 150) + '...' : entry.inputText} "</p>
                    </div>

                    <div className="text-sm text-foreground/80 line-clamp-3">
                      {entry.result}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

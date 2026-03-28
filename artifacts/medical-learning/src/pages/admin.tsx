import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetBooks, useUploadBook, useDeleteBook, useProcessBook, useGetCurrentUser } from "@workspace/api-client-react";
import { Card, Button, Input, Badge } from "@/components/ui/beautiful-components";
import { Upload, Trash2, Cpu, FileUp, Settings, AlertCircle } from "lucide-react";

export default function Admin() {
  const { data: user } = useGetCurrentUser();
  const { data: books, isLoading, refetch } = useGetBooks();
  const uploadMut = useUploadBook();
  const deleteMut = useDeleteBook();
  const processMut = useProcessBook();

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", author: "", category: "", description: ""
  });
  const [file, setFile] = useState<File | null>(null);

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold font-display text-foreground">Kirish taqiqlangan</h2>
          <p className="text-muted-foreground mt-2">Faqat administratorlar bu panelga kira oladi.</p>
        </div>
      </Layout>
    );
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title) return alert("Sarlavha va fayl majburiy");

    uploadMut.mutate({
      data: {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        description: formData.description,
        file: file as unknown as Blob
      }
    }, {
      onSuccess: () => {
        setIsUploading(false);
        setFormData({ title: "", author: "", category: "", description: "" });
        setFile(null);
        refetch();
      }
    });
  };

  return (
    <Layout>
      <div className="p-8 h-full flex flex-col overflow-y-auto hide-scrollbar">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" /> Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Kutubxona hujjatlarini boshqarish va AI ishlovini boshqarish</p>
          </div>
          <Button onClick={() => setIsUploading(!isUploading)} leftIcon={isUploading ? <Trash2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}>
            {isUploading ? "Bekor qilish" : "Kitob yuklash"}
          </Button>
        </header>

        {isUploading && (
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="font-display font-bold text-xl mb-4 text-primary">Yangi hujjat yuklash</h3>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Sarlavha *" value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))} required />
              <Input label="Muallif" value={formData.author} onChange={e => setFormData(f => ({...f, author: e.target.value}))} />
              <Input label="Toifa" value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value}))} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground/90">Hujjat fayli *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border-2 border-border bg-white px-4 py-2.5 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" isLoading={uploadMut.isPending} leftIcon={<FileUp className="w-4 h-4" />}>
                  Yuklash va saqlash
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-sidebar border-b border-border text-xs uppercase text-muted-foreground font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Kitob ma'lumotlari</th>
                  <th className="px-6 py-4">Toifa / Turi</th>
                  <th className="px-6 py-4 text-center">Holat</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : books?.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Kutubxonada kitoblar yo'q.</td></tr>
                ) : (
                  books?.map((book) => (
                    <tr key={book.id} className="border-b border-border last:border-0 hover:bg-black/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{book.title}</div>
                        <div className="text-muted-foreground mt-0.5">{book.author || 'Noma\'lum'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge>{book.fileType.toUpperCase()}</Badge>
                        {book.category && <span className="ml-2 text-xs font-medium text-muted-foreground">{book.category}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {book.processed ? (
                          <Badge variant="success">Ishlangan</Badge>
                        ) : (
                          <Badge variant="warning">Kutilmoqda</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            processMut.mutate({ id: book.id }, {
                              onSuccess: () => refetch()
                            });
                          }}
                          disabled={book.processed || processMut.isPending}
                          className={`p-2 rounded-lg transition-colors ${book.processed ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'text-primary hover:bg-primary/10'}`}
                          title="AI bilan ishlash"
                        >
                          <Cpu className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if(confirm("Bu kitobni o'chirishni tasdiqlaysizmi?")) {
                              deleteMut.mutate({ id: book.id }, { onSuccess: () => refetch() });
                            }
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

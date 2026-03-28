import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetBooks } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/ui/beautiful-components";
import { Search, Filter, FileText, File } from "lucide-react";
import { motion } from "framer-motion";

export default function Library() {
  const [search, setSearch] = useState("");
  const { data: books, isLoading } = useGetBooks();

  const filteredBooks = books?.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 h-full flex flex-col">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Talabaning AI Kutubxonasi</h1>
            <p className="text-muted-foreground mt-1">Darsliklar va klinik hujjatlarga kirish</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Kitob, muallif qidirish..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white border border-border rounded-xl text-foreground hover:bg-black/5 transition-colors shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border animate-pulse h-64">
                <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6" />
                <div className="h-10 bg-slate-200 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredBooks?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <img src={`${import.meta.env.BASE_URL}images/empty-library.png`} alt="Bo'sh kutubxona" className="w-64 h-64 object-contain mb-6 drop-shadow-xl" />
            <h3 className="text-2xl font-display font-bold text-foreground">Kitob topilmadi</h3>
            <p className="text-muted-foreground mt-2 max-w-md">Qidiruvingizga mos hujjat topilmadi. Boshqa so'z bilan qidiring yoki administrator kitob yuklashini so'rang.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks?.map((book, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={book.id}
                >
                  <Card className="h-full flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 z-10">
                      <Badge variant={book.fileType === 'pdf' ? 'error' : book.fileType === 'docx' ? 'primary' as any : 'default'}>
                        {book.fileType.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform duration-300">
                      {book.fileType === 'pdf' ? <FileText className="w-7 h-7" /> : <File className="w-7 h-7" />}
                    </div>

                    <h3 className="font-display font-bold text-lg text-foreground line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{book.author || 'Noma\'lum muallif'}</p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                      <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/5 rounded-md">
                        {book.category || 'Umumiy'}
                      </span>
                      <Link href={`/books/${book.id}`} className="px-4 py-2 bg-foreground text-background font-semibold text-sm rounded-lg hover:bg-primary transition-colors hover:shadow-lg hover:shadow-primary/30 active:scale-95">
                        Ochish
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

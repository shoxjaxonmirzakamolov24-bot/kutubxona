import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import {
  BookOpen,
  Stethoscope,
  Highlighter,
  History,
  Settings,
  LogOut,
  User,
  Activity,
  Menu,
  X
} from "lucide-react";
import { removeAuthToken } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: user, isLoading, isError } = useGetCurrentUser();
  const logoutMut = useLogout({
    mutation: {
      onSuccess: () => {
        removeAuthToken();
        window.location.href = "/login";
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Activity className="w-12 h-12 text-primary animate-pulse mb-4" />
        <h2 className="text-xl font-display font-semibold text-primary">MedLearn AI</h2>
        <p className="text-muted-foreground mt-2 text-sm">Yuklanmoqda...</p>
      </div>
    );
  }

  if (isError || !user) {
    window.location.href = "/login";
    return null;
  }

  const navItems = [
    { href: "/", label: "Kutubxona", icon: BookOpen },
    { href: "/notes", label: "Eslatmalarim", icon: Stethoscope },
    { href: "/highlights", label: "Belgilanganlar", icon: Highlighter },
    { href: "/history", label: "AI Tarixi", icon: History },
  ];

  if (user.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: Settings });
  }

  const handleLogout = () => {
    logoutMut.mutate(undefined);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">MedLearn</h1>
          <p className="text-xs font-medium text-primary">Tibbiy Ta'lim AI</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive
                  ? "bg-white text-primary shadow-sm shadow-black/5 border border-border/50"
                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground"}
              `}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role === "admin" ? "Administrator" : "Talaba"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-sidebar border-r border-sidebar-border z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* Mobil sarlavha */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">MedLearn</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-primary/10 rounded-lg text-primary">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r z-40 shadow-2xl flex flex-col md:hidden pt-16"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asosiy kontent */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        {children}
      </main>
    </div>
  );
}

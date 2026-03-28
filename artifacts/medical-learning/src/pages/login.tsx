import { useState } from "react";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/utils";
import { Activity, Stethoscope, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button, Input } from "@/components/ui/beautiful-components";
import { motion } from "framer-motion";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMut = useLogin();
  const registerMut = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isRegister) {
      if (!name || !email || !password) return setErrorMsg("Barcha maydonlarni to'ldiring");
      registerMut.mutate({ data: { name, email, password } }, {
        onSuccess: (data) => {
          setAuthToken(data.token);
          window.location.href = "/";
        },
        onError: (err: any) => setErrorMsg(err.data?.error || "Ro'yxatdan o'tishda xatolik yuz berdi")
      });
    } else {
      if (!email || !password) return setErrorMsg("Barcha maydonlarni to'ldiring");
      loginMut.mutate({ data: { email, password } }, {
        onSuccess: (data) => {
          setAuthToken(data.token);
          window.location.href = "/";
        },
        onError: (err: any) => setErrorMsg(err.data?.error || "Email yoki parol noto'g'ri")
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white selection:bg-primary/20">
      {/* Chap tomon - rasm */}
      <div className="hidden lg:flex w-1/2 relative bg-sidebar overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <img
          src={`${import.meta.env.BASE_URL}images/auth-side.png`}
          alt="Tibbiy"
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 p-12 text-white max-w-xl mt-auto self-end">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Sun'iy intellekt bilan tibbiy bilimlarni tez o'rganing.</h1>
          <p className="text-lg text-white/80">Tibbiy darsliklarni yuklang, murakkab mavzularni belgilang va tezkor tushuntirishlar, testlar va tizimli eslatmalar oling.</p>
        </div>
      </div>

      {/* O'ng tomon - forma */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">MedLearn</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {isRegister ? "Hisob yaratish" : "Xush kelibsiz"}
            </h2>
            <p className="text-muted-foreground">
              {isRegister ? "Tibbiy o'quv platformasiga qo'shiling" : "Tibbiy kutubxonangizga kirish"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <Input
                label="To'liq ism"
                icon={<UserIcon className="w-5 h-5" />}
                placeholder="Sherzod Karimov"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            )}
            <Input
              label="Email manzil"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="siz@university.uz"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Parol"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              isLoading={loginMut.isPending || registerMut.isPending}
            >
              {isRegister ? "Hisob yaratish" : "Kirish"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              {isRegister ? "Hisobingiz bormi?" : "Hisobingiz yo'qmi?"}
              <button
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }}
                className="ml-2 text-primary font-bold hover:underline"
                type="button"
              >
                {isRegister ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground text-center">
            <strong>Demo hisoblar:</strong><br />
            Admin: admin@medical.uz / admin123<br />
            Talaba: student@medical.uz / student123
          </div>
        </motion.div>
      </div>
    </div>
  );
}

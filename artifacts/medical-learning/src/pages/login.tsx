import { useState } from "react";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/utils";
import { Mail, Lock, User as UserIcon } from "lucide-react";
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
      {/* Chap tomon - KUAF branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#0a2640] to-[#0d3d6b]">
        {/* Background image */}
        <img
          src={`${import.meta.env.BASE_URL}images/auth-side.png`}
          alt="Tibbiy"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />

        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-accent/20 blur-3xl" />

        {/* Main KUAF branding - center */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12">
          {/* KUAF logo text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="text-[96px] font-black leading-none tracking-widest text-white drop-shadow-2xl select-none"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.18em" }}>
              KUAF
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mt-2 mb-6" />
            <p className="text-white/80 text-lg font-medium tracking-wide">
              Qo'qon universiteti Andijon filiali
            </p>
          </motion.div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 text-white/60 text-sm leading-relaxed max-w-xs"
          >
            <p>Sun'iy intellekt yordamida tibbiy bilimlarni chuqurlashtiring. Darsliklarni yuklang, matnlarni belgilang va AI tahlilini oling.</p>
          </motion.div>
        </div>
      </div>

      {/* O'ng tomon - forma */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Mobil logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <span className="font-black text-2xl tracking-widest text-primary" style={{ letterSpacing: "0.18em" }}>KUAF</span>
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
              {isRegister ? "Talabaning AI Kutubxonasiga qo'shiling" : "Talabaning AI Kutubxonasiga kirish"}
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
              placeholder="siz@gmail.com"
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
        </motion.div>
      </div>
    </div>
  );
}

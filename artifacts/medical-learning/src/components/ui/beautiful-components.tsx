import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  leftIcon, 
  rightIcon, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-border bg-transparent hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-muted-foreground hover:bg-black/5 hover:text-foreground",
    destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-white shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={cn(baseClass, variants[variant], sizes[size], disabled || isLoading ? "opacity-60 cursor-not-allowed transform-none hover:transform-none shadow-none" : "", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ className, label, error, icon, ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-foreground/90">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input 
          className={cn(
            "w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
            icon ? "pl-11" : "",
            error ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-destructive mt-1">{error}</p>}
    </div>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode, className?: string, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={onClick ? { y: -4 } : {}}
      className={cn(
        "bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 transition-all duration-300",
        onClick ? "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/30" : "",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, variant = "default", className }: { children: ReactNode, variant?: "default" | "success" | "warning" | "error" | "purple", className?: string }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200"
  };
  
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
}

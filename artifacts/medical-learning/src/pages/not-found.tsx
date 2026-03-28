import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/beautiful-components";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="text-4xl font-display font-bold text-foreground mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        The clinical document or interface you are looking for does not exist in this environment.
      </p>
      <Link href="/">
        <Button size="lg">Return to Library</Button>
      </Link>
    </div>
  );
}

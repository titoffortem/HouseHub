import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          HomeView
        </h1>
      </div>
    </header>
  );
}

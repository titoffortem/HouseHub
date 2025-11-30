import { LogIn, LogOut } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { Button } from "../ui/button";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { PropertySearch } from "./property-search";

interface HeaderProps {
  onSearch: (searchTerm: string, filters: { rooms: number | null; minPrice: number; maxPrice: number }) => void;
}


export function Header({ onSearch }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Image src="https://sun9-20.userapi.com/s/v1/ig2/uIdtH8WL93WBwVCjfTiSSkbYOzSbkBJsjhGAEtVCLKCqghZhVWGJHZb1uDrCDEfXHVPdJCfaqZOcpDG4S_Yrt4LD.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,308x308&from=bu&cs=308x0" alt="Логотип HomeView" width={40} height={40} className="rounded-md" />
        <span className="font-headline text-xl font-bold">HomeView</span>
      </div>
      <div className="flex-1 flex justify-center px-8">
        <PropertySearch onSearch={onSearch} />
      </div>
      <div>
        {isUserLoading ? (
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback>
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4" />
            Вход для администратора
          </Button>
        )}
      </div>
    </header>
  );
}

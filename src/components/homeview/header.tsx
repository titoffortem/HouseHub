
import { LogOut } from "lucide-react";
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
  onSearch: (searchTerm: string) => void;
}


export function Header({ onSearch }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogin = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(error => {
      console.error("Error signing in with Google: ", error);
    });
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
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="relative -left-px">
          <Image src="https://sun9-8.userapi.com/s/v1/ig2/rmZGJAqMA5y7TrFTYnndwLrcU7wb72mnvv6Z2LUgpsMdCNL097Kn9gvW9w__rsBMEY20A4Tt-ecLIPEq4qCWPtPx.jpg?quality=95&as=32x10,48x15,72x22,108x34,160x50,240x75,360x112,448x140&from=bu&cs=448x0" alt="Логотип HouseHub" width={140} height={40} />
        </div>
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
              <DropdownMenuLabel className="font-normal py-2">
                 <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium leading-none text-muted-foreground">User ID</p>
                    <p className="text-xs leading-none text-foreground font-mono select-all">{user.uid}</p>
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
            Авторизация/Регистрация
          </Button>
        )}
      </div>
    </header>
  );
}

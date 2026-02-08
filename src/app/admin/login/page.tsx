
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminLoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If user is loaded and is logged in, redirect to home page
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // After successful login, the useEffect will trigger the redirect
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Всплывающее окно заблокировано",
          description: "Браузер заблокировал окно входа. Разрешите всплывающие окна для этого сайта и попробуйте снова.",
          variant: "destructive",
          duration: 10000,
        });
      } else if (error.code === 'auth/popup-closed-by-user') {
        const hostname = window.location.hostname;
        toast({
          title: "Окно входа было закрыто",
          description: `Это может быть вызвано проблемой с конфигурацией. Проверьте: 1) Домен "${hostname}" добавлен в Authorized Domains в Firebase. 2) Настроен OAuth Consent Screen в Google Cloud. 3) Если статус публикации "Testing", ваш email добавлен в список тестовых пользователей.`,
          variant: "destructive",
          duration: 20000,
        });
        console.error(`Popup closed by user. This can happen if the domain "${hostname}" is not in the Firebase Auth authorized domains list, or if there's a GCP OAuth configuration issue.`);
      } else {
        toast({
          title: "Ошибка аутентификации",
          description: "Не удалось войти. Возможная причина: домен сайта не авторизован в Firebase. Проверьте консоль для деталей.",
          variant: "destructive",
          duration: 10000,
        });
        console.error("Error signing in with Google: ", error);
      }
    }
  };
  
  // Don't render anything while checking auth state or if user is already logged in
  if (isUserLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>Загрузка...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center gap-6 p-8 border rounded-lg shadow-md bg-card max-w-sm w-full">
            <div className="overflow-hidden">
              <Image className="-ml-1" src="https://sun9-8.userapi.com/s/v1/ig2/rmZGJAqMA5y7TrFTYnndwLrcU7wb72mnvv6Z2LUgpsMdCNL097Kn9gvW9w__rsBMEY20A4Tt-ecLIPEq4qCWPtPx.jpg?quality=95&as=32x10,48x15,72x22,108x34,160x50,240x75,360x112,448x140&from=bu&cs=448x0" alt="Логотип HouseHub" width={140} height={40} />
            </div>
            <h1 className="text-2xl font-headline text-center">Вход для администратора</h1>
            <p className="text-sm text-center text-muted-foreground">
                Эта страница предназначена только для зарегистрированных администраторов.
            </p>
            <Button onClick={handleLogin} size="lg" className="w-full">
                Войти через Google
            </Button>
        </div>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import i18n from '@/context/messages/i18n';

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const locale = pathname.split('/')[1];
    if (["id", "en"].includes(locale)) {
      i18n.changeLanguage(locale);
    } else {
      i18n.changeLanguage("id");
    }
  }, [pathname]);

  return <>{children}</>;
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { exigirEditor } from '@/lib/acesso';
import { sair } from './acoes';

export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const { usuario } = await exigirEditor();
  return (
    <div className="lg:flex">
      <nav aria-label="Painel" className="flex items-center gap-4 border-b border-border bg-bg px-4 py-3 lg:min-h-screen lg:w-[240px] lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r">
        <span className="font-bold lg:mb-4">Painel do editor</span>
        <Link href="/testes" className="font-semibold text-accent">Testes</Link>
        <Link href="/publicar" className="font-semibold text-accent">Publicar</Link>
        <div className="ml-auto text-xs text-text-muted lg:ml-0 lg:mt-auto">
          <p className="truncate">{usuario.email}</p>
          <form action={sair}><button className="font-semibold text-accent">Sair</button></form>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-panel px-4 py-6">{children}</main>
    </div>
  );
}

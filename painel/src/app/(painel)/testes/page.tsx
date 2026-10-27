import Link from 'next/link';
import { SeloStatus } from '@/componentes/form';
import { exigirEditor } from '@/lib/acesso';

export default async function Testes({ searchParams }: { searchParams: Promise<{ regiao?: string }> }) {
  const { supabase } = await exigirEditor();
  const { regiao } = await searchParams;
  const { data: regioes } = await supabase.from('regioes').select('id, slug, nome').order('ordem');
  let consulta = supabase.from('testes').select('id, nome, status, updated_at, regioes(nome, slug), propriedades(count)').order('updated_at', { ascending: false });
  const filtro = regioes?.find((r) => r.slug === regiao);
  if (filtro) consulta = consulta.eq('regiao_id', filtro.id);
  const { data: testes } = await consulta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-xl">Testes</h1>
        <Link href="/testes/novo" className="inline-flex min-h-touch items-center rounded-md bg-accent px-5 font-semibold text-on-accent">Novo teste</Link>
      </div>
      <nav aria-label="Filtrar por região" className="flex flex-wrap gap-2 text-sm">
        <Link href="/testes" className={!filtro ? 'font-semibold text-accent' : 'text-text-muted'}>Todas</Link>
        {regioes?.map((r) => (
          <Link key={r.id} href={`/testes?regiao=${r.slug}`} className={filtro?.id === r.id ? 'font-semibold text-accent' : 'text-text-muted'}>{r.nome}</Link>
        ))}
      </nav>
      {!testes?.length ? (
        <p className="rounded-md bg-bg p-6 text-center text-text-muted">Nenhum teste aqui ainda. Comece por “Novo teste”.</p>
      ) : (
        <table className="w-full overflow-hidden rounded-md bg-bg text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-text-muted">
            <tr><th className="p-3">Teste</th><th className="p-3">Região</th><th className="p-3">Estudos</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {testes.map((t) => {
              const reg = Array.isArray(t.regioes) ? t.regioes[0] : t.regioes;
              const estudos = (t.propriedades as unknown as { count: number }[])[0]?.count ?? 0;
              return (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="p-3"><Link href={`/testes/${t.id}`} className="font-semibold text-accent">{t.nome}</Link></td>
                  <td className="p-3">{reg?.nome}</td>
                  <td className="p-3 tabular-nums">{estudos}</td>
                  <td className="p-3"><SeloStatus status={t.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FormEstudo } from '@/componentes/FormEstudo';
import { FormTeste } from '@/componentes/FormTeste';
import { exigirEditor } from '@/lib/acesso';
import { excluirEstudo } from '../../acoes';

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 1000) / 10}%`.replace('.', ','));
const num = (v: number | null) => (v == null ? '—' : String(v).replace('.', ','));

export default async function EditarTeste({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await exigirEditor();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [{ data: teste }, { data: regioes }] = await Promise.all([
    supabase.from('testes')
      .select('*, teste_categorias(categorias(nome)), propriedades(*, referencias(citacao, pmid))')
      .eq('id', id).maybeSingle(),
    supabase.from('regioes').select('id, nome').order('ordem'),
  ]);
  if (!teste) notFound();
  const categorias = (teste.teste_categorias as { categorias: { nome: string } | null }[]).map((c) => c.categorias?.nome).filter(Boolean);
  const estudos = teste.propriedades as {
    id: string; condicao_alvo: string; n: number | null; sensibilidade: number | null; especificidade: number | null;
    lr_positiva: number | null; lr_negativa: number | null; referencias: { citacao: string; pmid: string | null } | null;
  }[];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/testes" className="text-sm text-accent">← Testes</Link>
      <h1 className="text-xl">{teste.nome}</h1>
      <FormTeste id={teste.id} regioes={regioes ?? []} valores={{
        regiaoId: teste.regiao_id, nome: teste.nome, nomeEn: teste.nome_en, sinonimos: (teste.sinonimos as string[]).join('; '),
        categorias: categorias.join('; '), posicaoPaciente: teste.posicao_paciente, execucao: teste.execucao,
        resultadoPositivo: teste.resultado_positivo, observacoes: teste.observacoes, status: teste.status,
      }} />

      <section aria-labelledby="estudos" className="flex flex-col gap-3">
        <h2 id="estudos" className="text-lg">Estudos de acurácia ({estudos.length})</h2>
        {estudos.length === 0 ? (
          <p className="text-text-muted">Nenhum estudo ainda. No app, este teste aparece como “Sem dados”.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {estudos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start gap-3 rounded-md bg-bg p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.condicao_alvo}{p.n ? ` · n=${p.n}` : ''}</p>
                  <p className="text-sm tabular-nums">Sens {pct(p.sensibilidade)} · Esp {pct(p.especificidade)} · LR+ {num(p.lr_positiva)} · LR− {num(p.lr_negativa)}</p>
                  <p className="text-xs text-text-muted">{p.referencias?.citacao}{p.referencias?.pmid ? ` PMID ${p.referencias.pmid}` : ''}</p>
                </div>
                <form action={excluirEstudo}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="testeId" value={teste.id} />
                  <button className="text-sm font-semibold text-danger">Remover</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <FormEstudo testeId={teste.id} />
      </section>
    </div>
  );
}

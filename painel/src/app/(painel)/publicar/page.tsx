import { BotaoPublicar } from '@/componentes/BotaoPublicar';
import { exigirEditor } from '@/lib/acesso';

export default async function Publicar() {
  const { supabase } = await exigirEditor();
  const [{ count: prontos }, { count: revisao }, { data: ultimo }] = await Promise.all([
    supabase.from('testes').select('id', { count: 'exact', head: true }).eq('status', 'publicado'),
    supabase.from('testes').select('id', { count: 'exact', head: true }).eq('status', 'revisao'),
    supabase.from('ultimo_pacote').select('versao, total_testes, created_at').maybeSingle(),
  ]);
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-xl">Publicar para o app</h1>
      <p>Publicar junta todos os testes com status <b>Publicado</b> numa nova versão. Os aparelhos baixam essa versão na próxima vez que abrirem o app com internet.</p>
      <dl className="grid grid-cols-2 gap-3 rounded-md bg-bg p-4 text-sm">
        <dt className="text-text-muted">Prontos para publicar</dt><dd className="font-semibold tabular-nums">{prontos ?? 0}</dd>
        <dt className="text-text-muted">Em revisão (não entram)</dt><dd className="font-semibold tabular-nums">{revisao ?? 0}</dd>
        <dt className="text-text-muted">Versão no ar</dt>
        <dd className="font-semibold tabular-nums">{ultimo ? `${ultimo.versao} (${ultimo.total_testes} testes, ${new Date(ultimo.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})` : 'nenhuma ainda'}</dd>
      </dl>
      <BotaoPublicar prontos={prontos ?? 0} />
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import { salvarTeste, type EstadoForm } from '@/app/(painel)/acoes';
import { AreaTexto, Aviso, Botao, Campo, Entrada, Selecao } from './form';

export type ValoresTeste = {
  regiaoId: string; nome: string; nomeEn: string; sinonimos: string; categorias: string;
  posicaoPaciente: string; execucao: string; resultadoPositivo: string; observacoes: string; status: string;
};

export function FormTeste({ id, regioes, valores }: {
  id: string | null; regioes: { id: string; nome: string }[]; valores: ValoresTeste;
}) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(salvarTeste.bind(null, id), {});
  const e = estado.erros ?? {};
  return (
    <form action={acao} className="flex flex-col gap-4 rounded-md bg-bg p-4 sm:p-6">
      {estado.erro ? <Aviso tom="erro">{estado.erro}</Aviso> : null}
      {estado.ok ? <Aviso>{estado.ok}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome" nome="nome" erro={e.nome}><Entrada nome="nome" defaultValue={valores.nome} required erro={e.nome} /></Campo>
        <Campo rotulo="Nome em inglês" nome="nomeEn" erro={e.nomeEn}><Entrada nome="nomeEn" defaultValue={valores.nomeEn} erro={e.nomeEn} /></Campo>
        <Campo rotulo="Região" nome="regiaoId" erro={e.regiaoId}>
          <Selecao nome="regiaoId" defaultValue={valores.regiaoId} required erro={e.regiaoId}>
            <option value="">Escolha…</option>
            {regioes.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Status" nome="status" erro={e.status} ajuda="Só testes publicados vão para o app, na próxima publicação.">
          <Selecao nome="status" defaultValue={valores.status} erro={e.status}>
            <option value="rascunho">Rascunho</option>
            <option value="revisao">Em revisão</option>
            <option value="publicado">Publicado</option>
            <option value="arquivado">Arquivado</option>
          </Selecao>
        </Campo>
      </div>
      <Campo rotulo="Sinônimos e epônimos" nome="sinonimos" erro={e.sinonimos} ajuda="Separe com ponto e vírgula. Ajudam a busca do app (ex.: Sinal de Neer; Neer impingement sign).">
        <Entrada nome="sinonimos" defaultValue={valores.sinonimos} erro={e.sinonimos} />
      </Campo>
      <Campo rotulo="Suspeitas diagnósticas" nome="categorias" erro={e.categorias} ajuda="Separe com ponto e vírgula (ex.: Impacto subacromial; Lesão do supraespinal).">
        <Entrada nome="categorias" defaultValue={valores.categorias} erro={e.categorias} />
      </Campo>
      <Campo rotulo="Posição do paciente" nome="posicaoPaciente" erro={e.posicaoPaciente}><AreaTexto nome="posicaoPaciente" defaultValue={valores.posicaoPaciente} rows={2} erro={e.posicaoPaciente} /></Campo>
      <Campo rotulo="Execução" nome="execucao" erro={e.execucao}><AreaTexto nome="execucao" defaultValue={valores.execucao} erro={e.execucao} /></Campo>
      <Campo rotulo="Positivo quando" nome="resultadoPositivo" erro={e.resultadoPositivo}><AreaTexto nome="resultadoPositivo" defaultValue={valores.resultadoPositivo} rows={2} erro={e.resultadoPositivo} /></Campo>
      <Campo rotulo="Observações" nome="observacoes" erro={e.observacoes}><AreaTexto nome="observacoes" defaultValue={valores.observacoes} rows={2} erro={e.observacoes} /></Campo>
      <div><Botao type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar teste'}</Botao></div>
    </form>
  );
}

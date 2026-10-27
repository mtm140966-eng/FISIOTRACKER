'use client';

import { useActionState, useRef, useState } from 'react';
import { buscarCitacao, salvarEstudo, type EstadoForm } from '@/app/(painel)/acoes';
import { AreaTexto, Aviso, Botao, Campo, Entrada, Selecao } from './form';

export function FormEstudo({ testeId }: { testeId: string }) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(salvarEstudo.bind(null, testeId), {});
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const e = estado.erros ?? {};

  const preencher = async () => {
    const campos = form.current?.elements as unknown as Record<string, HTMLInputElement>;
    if (!campos) return;
    setBuscando(true);
    setAviso(null);
    const r = await buscarCitacao(campos.pmid.value);
    setBuscando(false);
    if ('erro' in r) return setAviso(r.erro);
    campos.citacao.value = r.citacao;
    campos.ano.value = r.ano ? String(r.ano) : '';
    campos.doi.value = r.doi ?? '';
    setAviso('Citação preenchida pelo PubMed. Confira antes de salvar.');
  };

  const num = (nome: string, rotulo: string, ajuda?: string) => (
    <Campo rotulo={rotulo} nome={nome} erro={e[nome]} ajuda={ajuda}>
      <Entrada nome={nome} inputMode="decimal" erro={e[nome]} />
    </Campo>
  );

  return (
    <form ref={form} action={acao} key={estado.ok ? String(Date.now()) : 'form'} className="flex flex-col gap-4 rounded-md bg-bg p-4 sm:p-6">
      <h3 className="text-lg">Adicionar estudo</h3>
      {estado.erro ? <Aviso tom="erro">{estado.erro}</Aviso> : null}
      {estado.ok ? <Aviso>{estado.ok}</Aviso> : null}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40"><Campo rotulo="PMID" nome="pmid" erro={e.pmid}><Entrada nome="pmid" inputMode="numeric" erro={e.pmid} /></Campo></div>
        <Botao type="button" variante="secundario" onClick={preencher} disabled={buscando}>{buscando ? 'Buscando…' : 'Buscar no PubMed'}</Botao>
      </div>
      {aviso ? <p role="status" className="text-sm text-text-muted">{aviso}</p> : null}
      <Campo rotulo="Citação" nome="citacao" erro={e.citacao}><AreaTexto nome="citacao" rows={2} required erro={e.citacao} /></Campo>
      <div className="grid gap-4 sm:grid-cols-3">
        {num('ano', 'Ano')}
        <Campo rotulo="DOI" nome="doi" erro={e.doi}><Entrada nome="doi" erro={e.doi} /></Campo>
        {num('n', 'Pacientes (n)')}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo rotulo="Condição-alvo" nome="condicaoAlvo" erro={e.condicaoAlvo}><Entrada nome="condicaoAlvo" required erro={e.condicaoAlvo} /></Campo>
        <Campo rotulo="Padrão-ouro" nome="padraoOuro" erro={e.padraoOuro}><Entrada nome="padraoOuro" erro={e.padraoOuro} /></Campo>
        <Campo rotulo="População" nome="populacao" erro={e.populacao}><Entrada nome="populacao" erro={e.populacao} /></Campo>
      </div>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Sensibilidade e especificidade, em %</legend>
        {num('sensibilidade', 'Sensibilidade (%)')}
        {num('sensIcInf', 'IC 95% inferior')}
        {num('sensIcSup', 'IC 95% superior')}
        {num('especificidade', 'Especificidade (%)')}
        {num('espIcInf', 'IC 95% inferior')}
        {num('espIcSup', 'IC 95% superior')}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-4">
        {num('lrPositiva', 'LR+', 'Deixe vazio se o estudo não informou; o app calcula.')}
        {num('lrNegativa', 'LR−')}
        {num('confiabilidade', 'Confiabilidade', 'De −1 a 1')}
        <Campo rotulo="Tipo" nome="confiabilidadeTipo" erro={e.confiabilidadeTipo}>
          <Selecao nome="confiabilidadeTipo" erro={e.confiabilidadeTipo}>
            <option value="">—</option>
            <option value="kappa">Kappa</option>
            <option value="icc">ICC</option>
          </Selecao>
        </Campo>
      </div>
      <div><Botao type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Adicionar estudo'}</Botao></div>
    </form>
  );
}

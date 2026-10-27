'use client';

import { useActionState } from 'react';
import { publicar, type EstadoForm } from '@/app/(painel)/acoes';
import { Aviso, Botao } from './form';

export function BotaoPublicar({ prontos }: { prontos: number }) {
  const [estado, acao, publicando] = useActionState<EstadoForm, FormData>(publicar, {});
  return (
    <form
      action={acao}
      onSubmit={(ev) => {
        if (!confirm(`Publicar ${prontos} testes para todos os aparelhos?`)) ev.preventDefault();
      }}
      className="flex flex-col items-start gap-3"
    >
      {estado.erro ? <Aviso tom="erro">{estado.erro}</Aviso> : null}
      {estado.ok ? <Aviso>{estado.ok}</Aviso> : null}
      <Botao type="submit" disabled={publicando}>{publicando ? 'Publicando…' : 'Publicar agora'}</Botao>
    </form>
  );
}

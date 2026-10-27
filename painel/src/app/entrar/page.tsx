'use client';

import { useActionState } from 'react';
import { Aviso, Botao, Campo, Entrada } from '@/componentes/form';
import { enviarLink, type EstadoEntrar } from './acoes';

export default function Entrar() {
  const [estado, acao, enviando] = useActionState<EstadoEntrar, FormData>(enviarLink, {});
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-xl">Painel do editor</h1>
        <p className="text-sm text-text-muted">Entre com o e-mail da sua conta de editor. Enviamos um link de acesso.</p>
      </div>
      {estado.enviado ? (
        <Aviso>Se este e-mail for de um editor, o link de acesso chega em instantes. Pode fechar esta página.</Aviso>
      ) : (
        <form action={acao} className="flex flex-col gap-4">
          <Campo rotulo="E-mail" nome="email" erro={estado.erro}>
            <Entrada nome="email" type="email" autoComplete="email" required erro={estado.erro} />
          </Campo>
          <Botao type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar link de acesso'}</Botao>
        </form>
      )}
    </main>
  );
}

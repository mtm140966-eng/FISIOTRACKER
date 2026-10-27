import { sair } from '../(painel)/acoes';

export default function SemAcesso() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-xl">Esta conta não é de editor</h1>
      <p className="text-text-muted">Peça a quem administra o painel para liberar o acesso de editor ao seu e-mail.</p>
      <form action={sair}><button className="font-semibold text-accent">Sair</button></form>
    </main>
  );
}

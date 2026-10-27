// Peças de formulário do painel (replica/design/components.md, seção Painel).
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base = 'w-full rounded-md border border-border-input bg-bg px-3 text-base text-text focus:border-focus';

export function Campo({ rotulo, nome, erro, ajuda, children }: {
  rotulo: string; nome: string; erro?: string; ajuda?: string; children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nome} className="text-sm font-semibold">{rotulo}</label>
      {children}
      {ajuda && !erro ? <p id={`${nome}-ajuda`} className="text-xs text-text-muted">{ajuda}</p> : null}
      {erro ? <p id={`${nome}-erro`} role="alert" className="text-sm text-danger">{erro}</p> : null}
    </div>
  );
}

const aria = (nome: string, erro?: string) => ({
  id: nome, name: nome, 'aria-invalid': erro ? true : undefined, 'aria-describedby': erro ? `${nome}-erro` : `${nome}-ajuda`,
});

export function Entrada({ nome, erro, ...props }: InputHTMLAttributes<HTMLInputElement> & { nome: string; erro?: string }) {
  return <input {...aria(nome, erro)} {...props} className={`${base} min-h-touch ${erro ? 'border-danger' : ''}`} />;
}

export function AreaTexto({ nome, erro, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { nome: string; erro?: string }) {
  return <textarea rows={4} {...aria(nome, erro)} {...props} className={`${base} py-2 ${erro ? 'border-danger' : ''}`} />;
}

export function Selecao({ nome, erro, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { nome: string; erro?: string }) {
  return <select {...aria(nome, erro)} {...props} className={`${base} min-h-touch ${erro ? 'border-danger' : ''}`}>{children}</select>;
}

export function Botao({ children, variante = 'primario', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'perigo' }) {
  const estilo = {
    primario: 'bg-accent text-on-accent hover:bg-accent-hover',
    secundario: 'border border-border-input bg-surface-raised text-text hover:bg-surface',
    perigo: 'bg-danger text-bg',
  }[variante];
  return (
    <button {...props} className={`min-h-touch rounded-md px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${estilo} ${props.className ?? ''}`}>
      {children}
    </button>
  );
}

export function Aviso({ tom = 'ok', children }: { tom?: 'ok' | 'erro'; children: ReactNode }) {
  return (
    <p role="status" className={`rounded-md px-4 py-3 text-sm font-medium ${tom === 'ok' ? 'bg-evidence-strong-soft text-evidence-strong' : 'bg-danger-soft text-danger'}`}>
      {children}
    </p>
  );
}

export function SeloStatus({ status }: { status: string }) {
  const tom = status === 'publicado' ? 'bg-evidence-strong-soft text-evidence-strong'
    : status === 'revisao' ? 'bg-evidence-moderate-soft text-evidence-moderate' : 'bg-evidence-weak-soft text-evidence-weak';
  const rotulo = { rascunho: 'Rascunho', revisao: 'Em revisão', publicado: 'Publicado', arquivado: 'Arquivado' }[status] ?? status;
  return <span className={`inline-flex h-6 items-center rounded-pill px-2.5 text-xs font-semibold ${tom}`}>{rotulo}</span>;
}

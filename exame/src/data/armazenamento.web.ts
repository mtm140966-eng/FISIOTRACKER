// Versão web do armazenamento: localStorage. Pode faltar (aba anônima,
// dados bloqueados), então toda leitura e escrita é protegida.

export async function lerTexto(nome: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(nome);
  } catch {
    return null;
  }
}

export async function gravarTexto(nome: string, texto: string): Promise<void> {
  try {
    window.localStorage.setItem(nome, texto);
  } catch {
    // sem armazenamento: o app segue com o conteúdo embutido
  }
}

// Na web, outra aba pode gravar o mesmo arquivo: avisa quando isso acontece.
export function observar(nome: string, aoMudar: (texto: string | null) => void): () => void {
  const ouvir = (e: StorageEvent) => {
    if (e.key === nome) aoMudar(e.newValue);
  };
  window.addEventListener('storage', ouvir);
  return () => window.removeEventListener('storage', ouvir);
}

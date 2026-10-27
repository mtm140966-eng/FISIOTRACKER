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

// Arquivos do app no aparelho (Android e iPhone). A versão web fica em
// armazenamento.web.ts. A gravação é atômica: escreve num arquivo
// temporário e só então troca, para nunca deixar um arquivo pela metade.

import { File, Paths } from 'expo-file-system';

export async function lerTexto(nome: string): Promise<string | null> {
  try {
    const arquivo = new File(Paths.document, nome);
    return arquivo.exists ? await arquivo.text() : null;
  } catch {
    return null;
  }
}

export async function gravarTexto(nome: string, texto: string): Promise<void> {
  const temporario = new File(Paths.document, `${nome}.tmp`);
  if (temporario.exists) temporario.delete();
  temporario.create();
  await temporario.write(texto);
  await temporario.move(new File(Paths.document, nome), { overwrite: true });
}

// No celular só existe uma instância do app: nada a observar.
export function observar(_nome: string, _aoMudar: (texto: string | null) => void): () => void {
  return () => {};
}

// Busca a citação de um artigo pelo PMID na API pública do NCBI (E-utilities,
// esummary). Sem chave, o NCBI aceita até 3 pedidos por segundo: o painel só
// pede quando o editor clica em "Buscar".

export type ArtigoPubmed = { citacao: string; ano: number | null; doi: string | null };

type Resumo = {
  authors?: { name: string }[];
  title?: string;
  source?: string;
  pubdate?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  articleids?: { idtype: string; value: string }[];
  error?: string;
};

// Estilo Vancouver: até 6 autores, depois "et al."
export function montarCitacao(r: Resumo): ArtigoPubmed {
  const autores = (r.authors ?? []).map((a) => a.name).filter(Boolean);
  const listaAutores = autores.length > 6 ? `${autores.slice(0, 6).join(', ')}, et al` : autores.join(', ');
  const ano = Number.parseInt((r.pubdate ?? '').slice(0, 4), 10);
  const titulo = (r.title ?? '').trim().replace(/\.$/, '');
  let local = `${r.source ?? ''}${Number.isFinite(ano) ? `. ${ano}` : ''}`;
  if (r.volume) local += `;${r.volume}`;
  if (r.issue) local += `(${r.issue})`;
  if (r.pages) local += `:${r.pages}`;
  const partes = [listaAutores, titulo, local.trim()].filter(Boolean);
  const doi = r.articleids?.find((i) => i.idtype === 'doi')?.value ?? null;
  return { citacao: `${partes.join('. ')}.`, ano: Number.isFinite(ano) ? ano : null, doi };
}

export async function buscarPubmed(pmid: string): Promise<ArtigoPubmed> {
  if (!/^\d{1,10}$/.test(pmid)) throw new Error('PMID inválido');
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=painel-exame&id=${pmid}`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!resposta.ok) throw new Error(`PubMed respondeu ${resposta.status}`);
  const corpo = (await resposta.json()) as { result?: Record<string, Resumo> };
  const resumo = corpo.result?.[pmid];
  if (!resumo || resumo.error) throw new Error('PMID não encontrado no PubMed');
  return montarCitacao(resumo);
}

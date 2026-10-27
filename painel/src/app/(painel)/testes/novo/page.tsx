import Link from 'next/link';
import { FormTeste } from '@/componentes/FormTeste';
import { exigirEditor } from '@/lib/acesso';

export default async function NovoTeste() {
  const { supabase } = await exigirEditor();
  const { data: regioes } = await supabase.from('regioes').select('id, nome').order('ordem');
  return (
    <div className="flex flex-col gap-4">
      <Link href="/testes" className="text-sm text-accent">← Testes</Link>
      <h1 className="text-xl">Novo teste</h1>
      <FormTeste id={null} regioes={regioes ?? []} valores={{
        regiaoId: '', nome: '', nomeEn: '', sinonimos: '', categorias: '', posicaoPaciente: '',
        execucao: '', resultadoPositivo: '', observacoes: '', status: 'rascunho',
      }} />
    </div>
  );
}

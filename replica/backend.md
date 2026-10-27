# Backend

Três peças:

| peça | pasta | o que faz |
| --- | --- | --- |
| banco | `supabase/` | migrações, regras de acesso (RLS), publicação do conteúdo, bucket de vídeos, dados iniciais, testes |
| app | `exame/` | baixa o pacote publicado, confere sha256 e formato, guarda no aparelho; favoritos no aparelho |
| painel | `painel/` | login de editor, testes, estudos com busca no PubMed, publicar |

Sem pagamentos na v1 (decisão no /replica-launch; venda dentro do app teria de
passar pela loja). Sem e-mail próprio: só o do Supabase Auth, para o link de login.
Sem tarefas agendadas.

## Como ligar ao seu Supabase (passos seus)

1. **Criar o projeto** no painel do Supabase: novo projeto, região São Paulo (`sa-east-1`). Guarde a senha do banco num gerenciador de senhas.
2. **Rodar o banco.** No SQL Editor do projeto, rode na ordem:
   `supabase/migrations/20261027000001_esquema.sql`,
   `20261027000002_publicacao.sql`,
   `20261027000003_videos.sql` e depois `supabase/seed.sql`.
   (Ou, com a Supabase CLI: `supabase link` e `supabase db push`.)
3. **Criar o seu usuário editor.** Em Authentication → Users → "Add user" → "Send invitation" com o seu e-mail. Depois, no SQL Editor:
   ```sql
   update perfis set papel = 'admin'
   where id = (select id from auth.users where email = 'SEU-EMAIL');
   ```
   Só quem tiver papel `editor` ou `admin` entra no painel. O login não cria contas.
4. **Endereço de retorno do link.** Em Authentication → URL Configuration, coloque o endereço do painel em "Site URL" e acrescente `https://SEU-PAINEL/auth/confirmar` (e `http://localhost:3010/auth/confirmar` para testar no computador) em "Redirect URLs".
5. **Chaves.** Em Settings → API, copie a URL do projeto e a chave pública (publishable ou anon):
   - `painel/.env.local` a partir de `painel/.env.example`;
   - `exame/.env` a partir de `exame/.env.example`.
   Nunca use a chave `service_role` em nenhum dos dois.
6. **Backups.** Em Database → Backups, confira que os backups diários estão ligados (no plano gratuito não há; no Pro, sim).

Depois disso: `cd painel && npm install && npm run dev`, abra `http://localhost:3010`,
entre com o seu e-mail, revise os 3 testes do ombro, mude para "Publicado" e
clique em Publicar. O app baixa a versão na próxima abertura com internet.

## Banco

- Migrações em `supabase/migrations/`, dados iniciais em `supabase/seed.sql` (só regiões e 3 testes com texto provisório, em revisão; nenhuma pessoa real).
- `publicar_pacote()`: só editor; trava a tabela para duas publicações não pegarem a mesma versão; grava o JSON como texto e o sha256 desse texto.
- `ultimo_pacote`: visão leve para o app saber se há versão nova.
- Vídeos: bucket `videos`, leitura pública, escrita só de editor, até 50 MB, só mp4.
- **Testes:** `supabase/testes/rodar.sh <banco vazio>` roda as migrações, o seed e 22 verificações (acesso de anônimo, clínico, segundo usuário e editor; publicação; sha256; vídeos; apagar conta). Rodado num Postgres 16 local com uma simulação mínima do Supabase: 22 de 22.

## App

- `exame/src/data/sincronizar.ts`: pergunta a última versão, baixa só se for mais nova, confere sha256 contra o banco e contra o anúncio, valida o formato (`src/lib/pacote.ts`), e só então grava (gravação atômica) e troca.
- Ao abrir, o app usa o pacote guardado; se ele estiver ilegível, usa o embutido. Procura atualização ao abrir e ao voltar para o app (no máximo a cada 30 min) e pelo botão em Mais.
- Conferido de ponta a ponta contra o banco local (com um servidor que imita a API do Supabase): baixou a versão 1, mostrou o estudo novo, sumiram os testes não publicados, o favorito sobreviveu ao recarregar. Com o conteúdo da versão 2 adulterado no banco, o app recusou e manteve o que tinha.

## Painel

- Next.js 16, sessão em cookies http-only pelo `@supabase/ssr`, renovada no `src/proxy.ts`.
- Login por link no e-mail, **só para contas existentes** (`shouldCreateUser: false`); resposta igual para e-mail cadastrado ou não.
- Toda página e ação chama `exigirEditor()` (login conferido no servidor do Supabase + papel no banco). E o banco confere de novo pelas regras de acesso.
- Formulários validados no servidor com zod (`src/lib/esquemas.ts`): % vira fração, IC coerente, publicar exige execução e resultado positivo. 8 testes.
- Citação pelo PMID na API pública do NCBI (E-utilities), só ao clicar. 2 testes com resumo fictício (sem rede).
- Conferido: build de produção, página de login sem erros, páginas internas mandando para o login, cabeçalhos de segurança.
- **Não conferido:** o fluxo logado (salvar teste, estudo, publicar), porque precisa do Supabase de verdade (login). Fazer no primeiro uso, depois dos passos acima.

## Integrações

| integração | API | chave | limites | revisão do provedor |
| --- | --- | --- | --- | --- |
| PubMed | NCBI E-utilities `esummary` (pública) | nenhuma | 3 pedidos/s sem chave | nenhuma |
| Supabase | Auth, PostgREST, Storage | URL + chave pública | os do plano | nenhuma |

## Checklist de segurança

- [x] segredos só em variáveis de ambiente; `.env*` no `.gitignore` do app e do painel; nenhuma chave secreta no app nem no painel
- [x] entrada validada no servidor (zod) em toda ação do painel
- [x] autorização em toda leitura e escrita (RLS), testada com um segundo usuário
- [x] limite de envio do link de login (o do Supabase Auth); login não cria contas
- [ ] webhooks com assinatura: não há webhooks na v1
- [x] uploads: limite de tamanho e tipo no bucket; vídeos num bucket separado
- [x] sem dados de usuário em URLs ou logs; o app não guarda dado de paciente
- [~] dependências auditadas: painel 0 alertas. App: 5 alertas "altos" em ferramentas de desenvolvimento do Expo (`@expo/cli`, assinatura de código: `node-forge`, `zod` interno). Não vão no app instalado. A única "correção" do npm seria voltar ao Expo 44; acompanhar as próximas versões do SDK 58
- [ ] política de privacidade listando os processadores (Supabase, hospedagem do painel): fica para o /replica-launch

## Pendências

- Upload de vídeo no painel e player no app.
- Login no app para sincronizar favoritos (tabela pronta).
- Exclusão de conta pelo próprio app: necessária na Apple só se o app tiver cadastro; hoje não tem. O banco já apaga perfil e favoritos junto com a conta.
- Modelo de e-mail do link em português (Authentication → Email Templates), texto novo.

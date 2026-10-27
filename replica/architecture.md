# Arquitetura: app de exame ortopédico (reconstrução das funcionalidades do CORE)

Base: `replica/recon.md` e `replica/features.csv`.
Duas peças: o **app** (Android e iPhone), que o clínico usa, e o **painel**
(site), onde você escreve os testes e sobe os vídeos.

## Stack

| camada | escolha | por quê |
| --- | --- | --- |
| app | Expo (React Native) + TypeScript | um código só para Android e iPhone; builds de loja pelo EAS |
| dados no aparelho | expo-sqlite + expo-file-system | tudo funciona offline; vídeos baixados ficam no aparelho |
| busca | local, com Fuse.js | 400 testes cabem no aparelho; busca instantânea e offline, tolerante a acento e grafia |
| painel | Next.js (App Router) + TypeScript + Tailwind | formulário para escrever testes sem programar |
| banco | Postgres no Supabase | você já tem o Supabase conectado; um banco só |
| acesso | RLS do Postgres (`supabase/migrations/`) | a regra fica no banco, vale para o app e para o painel |
| login | Supabase Auth, link mágico por e-mail | editores entram no painel; no app o login é opcional (só para sincronizar favoritos) |
| arquivos | Supabase Storage: bucket `videos` | vídeos saem pelo CDN do Supabase; o pacote de conteúdo fica numa tabela (cabe folgado) |
| referências | API pública do PubMed (NCBI E-utilities) | preenche a citação a partir do PMID |
| hospedagem do painel | Vercel | você já tem o Vercel conectado |
| pagamentos | nenhum na v1 | se for vender dentro do app, Apple e Google exigem a compra pela loja (RevenueCat); decisão no `/replica-launch` |
| e-mail | o do Supabase Auth | só para o link de login |
| tarefas agendadas | nenhuma na v1 | a publicação gera o pacote na hora |

Nada de dados de pacientes: o app não guarda nenhum. Isso deixa a LGPD
simples (só e-mail de quem cria conta).

## Como o conteúdo chega ao aparelho

```
Painel: você escreve o teste -> "revisão" -> "publicado"
        botão "Publicar pacote" -> publicar_pacote() no banco: monta o JSON de todo
                                   o conteúdo publicado e grava texto + sha256 em `pacotes`
App:    ao abrir, já tem um pacote embutido (abre mesmo sem internet)
        com internet, consulta a última versão em `pacotes`
        se for nova: baixa, confere o sha256, troca de uma vez
        se algo falhar: continua com o pacote anterior, sem travar
Vídeos: baixados sob demanda (streaming) ou por região (offline), do bucket `videos`
```

## Banco de dados

Tabelas: 10. Acesso: RLS. Arquivos: `supabase/migrations/` (testes em `supabase/testes/`).

| tabela | o que guarda |
| --- | --- |
| perfis | usuário e papel (clínico, editor, admin) |
| regioes | ombro, joelho... e a área na figura do corpo |
| categorias | suspeitas diagnósticas por região |
| testes | nome, sinônimos, posição, execução, resultado positivo, status editorial |
| teste_categorias | quais suspeitas cada teste investiga |
| referencias | citação, PMID, DOI |
| propriedades | sensibilidade, especificidade (com IC 95%), LR+, LR−, confiabilidade; uma linha por estudo, sempre com referência |
| videos | caminho no Storage, duração, tamanho, se tem áudio |
| pacotes | versões publicadas do conteúdo para o app (texto JSON + sha256) |
| favoritos | favoritos sincronizados de quem tem conta |

Regras garantidas pelo banco (testadas num Postgres local, 12 de 12 passaram):
- quem não é editor só vê teste **publicado** e nunca edita conteúdo;
- ninguém se promove a editor sozinho;
- cada usuário só vê e mexe nos próprios favoritos;
- teste publicado precisa ter execução e resultado positivo escritos;
- sensibilidade e especificidade só entre 0 e 1; IC inferior ≤ superior;
- toda propriedade diagnóstica tem uma referência; uma referência em uso não pode ser apagada.

## API

O app quase não conversa com servidor: lê o pacote e os vídeos. As rotas
são as do Supabase (PostgREST e Storage) mais as ações do painel.

### App

| método e caminho | faz | quem | entrada | saída | fluxo |
| --- | --- | --- | --- | --- | --- |
| GET `rest/v1/ultimo_pacote?select=versao,sha256` | última versão do conteúdo | qualquer um | — | versão, sha256 | F01–F05 |
| GET `rest/v1/pacotes?select=conteudo,sha256&versao=eq.N` | baixa o conteúdo | qualquer um | versão | texto JSON + sha256 | F01–F05 |
| GET `storage/v1/object/public/videos/{caminho}` | vídeo (streaming ou download) | qualquer um | caminho | mp4 | F04, F07 |
| GET `rest/v1/favoritos` | lista favoritos | dono | — | testes | F06 |
| POST `rest/v1/favoritos` | favorita | dono | teste_id | ok | F06 |
| DELETE `rest/v1/favoritos?teste_id=eq.X` | desfavorita | dono | teste_id | ok | F06 |
| POST `auth/v1/otp` | envia link de login | qualquer um | e-mail | — | F06 |

### Painel (ações no servidor do Next.js)

| ação | faz | quem | entrada | saída |
| --- | --- | --- | --- | --- |
| `salvarTeste` | cria ou edita teste, sinônimos e categorias | editor | campos do teste | teste |
| `mudarStatus` | rascunho → revisão → publicado / arquivado | editor | id, status | teste |
| `salvarPropriedade` | adiciona ou edita linha de acurácia | editor | números + referência | propriedade |
| `buscarPubmed` | preenche a citação pelo PMID (NCBI E-utilities) | editor | PMID | citação, ano, DOI |
| `salvarReferencia` | grava referência | editor | citação, PMID, DOI | referência |
| `urlUploadVideo` | gera link assinado para subir o vídeo | editor | teste_id, arquivo | URL de upload |
| `salvarVideo` | registra o vídeo enviado | editor | caminho, duração, tamanho | vídeo |
| `publicarPacote` | chama `publicar_pacote()` no banco | editor | — | versão N |

Rotas: 15 (7 do app, 8 do painel). Webhooks: nenhum na v1. Tarefas agendadas: nenhuma na v1.

## Onde mora o perigo

- **Offline e abertura:** o app nunca depende da internet para abrir. O pacote vem embutido, e a troca de pacote só acontece depois de conferir o sha256. É a principal falha do CORE.
- **Exatidão do conteúdo:** um número errado de sensibilidade vira uma decisão clínica errada. Cada número tem referência, o teste passa por "revisão" antes de publicar, e o app mostra sempre de onde veio o dado. LR ausente pode ser calculada a partir de Sens/Esp, mas aparece marcada como "calculada".
- **Calculadora pós-teste:** é matemática simples (odds × LR), mas precisa de um aviso claro de que é apoio, não diagnóstico.
- **Tamanho dos vídeos:** 720p, H.264, 30 a 60 s, entre 2 e 5 MB cada. 300 vídeos dão cerca de 1 GB, por isso o download é por região, retomável, e confere o espaço livre antes.
- **Busca:** nomes com epônimos e grafias variadas ("Neer's", "Lachmann", "teste de Jobe" / "empty can"). A busca normaliza acento, apóstrofo e "teste de", e usa os sinônimos.
- **Publicações simultâneas:** `versao` é única; se dois editores publicarem juntos, um falha e tenta de novo com N+1.
- **Fusos horários:** só há datas de criação e publicação, todas em UTC. Sem risco.
- **Apagar conta (LGPD):** apagar o usuário no Auth apaga o perfil e os favoritos em cascata.
- **Lojas:** a Apple pede referências em apps médicos (diretriz 1.4.1); já estão no modelo. Venda de conteúdo dentro do app tem de passar pela compra da loja.
- **ANVISA:** confirmar que uma referência de consulta para profissionais não se enquadra como software médico (RDC 657/2022) antes de lançar.

## Ordem de construção

1. **Fatia vertical (provar a stack).**
   Telas S01, S02, S03, S04, S06, S08, S09. Só a região Ombro, 3 testes.
   Tabelas: regioes, testes, referencias, propriedades, pacotes.
   Painel: login, `salvarTeste`, `salvarPropriedade`, `salvarReferencia`, `publicarPacote`.
   Pronto quando: você publica um teste no painel e ele aparece no celular, inclusive em modo avião.
2. **Essenciais (must).**
   S05 busca com sinônimos e pt/en; S07 vídeo com áudio (`urlUploadVideo`, `salvarVideo`);
   S10 favoritos no aparelho; `buscarPubmed`; status editorial; builds Android e iPhone.
3. **Importantes (should).**
   Categorias e F03; S11 downloads por região; conta opcional e favoritos sincronizados;
   calculadora pós-teste; tema escuro; aviso quando estudos discordam.
4. **Desejáveis (could).**
   Quiz para residentes; roteiro de exame por região; compartilhar teste; ligação com o FISIOTRACKER.
5. **Correções do `/replica-entrepreneur`.** Entram aqui depois que ele rodar.

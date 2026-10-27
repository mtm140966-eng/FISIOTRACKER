# Paridade com o CORE

Data: 2026-10-27 · Build: commit atual de `claude/replica-skill-install-hoow4b`
Ferramenta: `.claude/skills/replica-diff/parity.py` sobre `replica/features.csv`.

## Veredito: ainda não dá para lançar

Faltam 3 funcionalidades essenciais (abaixo). Não há bug S1 ou S2 aberto
(`replica/bugs.md`).

## Números

| medida | valor |
| --- | --- |
| **paridade de funcionalidades** | **63,5 / 100** |
| essenciais (must) prontas | 7 de 10 |
| paridade de layout | não medida: não há prints do CORE (ver abaixo) |
| conteúdo (testes publicados) | 3 provisórios, contra 250 a 400 no CORE |

Como a conta foi feita:
- Pesos: essencial 3, importante 2, desejável 1. "Parcial" vale metade.
- Ficam fora da conta o que não pode ser copiado (5 itens) e o que só o seu app tem (13 itens).
- Na matriz, 4 itens estão com "original: unknown", porque não sei se o CORE tem: tema escuro, aviso de discordância, atualização sem atualizar o app e compartilhar. O número acima os **deixa de fora**, que é a conta conservadora. Contando os 4 como do CORE, o resultado é 64,8.
- 3 itens que o CORE tem só em parte (vídeo sem áudio no streaming, uso offline, vídeos offline pagos) contam como do CORE.

O número que mais pesa não está na matriz: o CORE tem centenas de testes e
o app tem 3, com texto provisório. Sem conteúdo, nenhuma porcentagem de
funcionalidade importa para quem usa.

### Por área (mais fraca primeiro)

| área | nota | itens |
| --- | --- | --- |
| plataforma | 37,5 | celular de verdade (parcial), versão para computador (não) |
| offline | 42,9 | texto offline (sim), downloads por região (não), vídeos offline sem cobrar (não) |
| conteúdo | 50,0 | ficha do teste (sim), vídeo com áudio (não) |
| navegação | 63,6 | mapa (sim), favoritos (sim), A–Z (não), tela de suspeitas (parcial) |
| busca | 100 | nome e epônimo tolerantes |
| evidência | 100 | propriedades diagnósticas, referências |

## Faltando, na ordem de construir

1. [essencial] Vídeo de cada teste, com áudio: player no app e upload no painel. Depende de você gravar.
2. [essencial] Lista A–Z de todos os testes.
3. [essencial] Funcionar no celular de verdade: o código é um só para Android e iPhone, mas só foi conferido na versão web.
4. [importante] Downloads de vídeo por região, para usar sem internet.
5. [importante] Vídeos offline sem cobrança à parte (decisão de preço no /replica-launch).
6. [importante] Tela de suspeitas diagnósticas (a busca já acha pela suspeita).
7. [desejável] Versão para computador (a versão web do app já existe; falta decidir se vira produto).

## Layout

Não medido. A ferramenta compara prints do original com os do seu app na mesma
largura e no mesmo estado, e não há prints do CORE em `replica/screens/`.
Para medir, tire no seu celular os prints destas telas do CORE (390 px de
largura, ou o celular inteiro), coloque em `replica/screens/` com os nomes
abaixo e rode `/replica-diff` de novo:

`S03.png` (regiões), `S04.png` (lista da região), `S05.png` (busca),
`S06.png` (ficha), `S08.png` (propriedades), `S10.png` (favoritos).

Lembrete: paridade de layout serve para conferir se a informação está no mesmo
lugar, não para copiar o visual. O visual do CORE é dele.

## Comportamento

Comparado com o que as fontes públicas do CORE descrevem (`replica/recon.md`).
Não abri o CORE.

| fluxo | o CORE faz | o seu app faz | manter ou corrigir |
| --- | --- | --- | --- |
| abrir o app | avaliações relatam que fecha sozinho ao abrir | abre sempre, inclusive offline e com servidor fora (testado) | manter: é o principal diferencial |
| F01 achar pela região | menu → regiões → lista → teste: 3 toques | já abre em Regiões → região → teste: 2 toques | manter |
| F02 buscar | menu → busca → digitar: 2 toques e a digitação | aba Buscar → digitar: 1 toque e a digitação; tolera acento, apóstrofo, erro de digitação, nome em inglês | manter |
| F03 por suspeita | lista por categoria diagnóstica | só pela busca; não há tela própria | construir a tela |
| F04 ver a manobra | vídeo por streaming, sem áudio | sem vídeo ainda | construir, com áudio |
| F05 avaliar o teste | Sens, Esp, LR, acurácia, referências | o mesmo, mais o selo de evidência, a LR calculada marcada e o aviso quando os estudos discordam | manter |
| F06 favoritos | favoritos no aparelho | favoritos no aparelho, também entre abas na web | manter |
| F07 offline | vídeos offline só pagando à parte | texto e números offline; vídeos ainda não | construir downloads; decidir preço |
| atualizar conteúdo | atualizações grátis, pela loja | publica no painel e chega ao app sem nova versão na loja, com sha256 conferido | manter |
| idioma | inglês | português, com nomes e busca em inglês | manter |
| e-mails | nenhum para o usuário | nenhum para o usuário; só o link de login do editor | — |

## As 5 próximas coisas a construir

1. **Conteúdo:** escrever e publicar os primeiros 30 a 50 testes das regiões que você mais examina. Não é código, e é o que mais falta.
2. **Lista A–Z:** pequena; fecha uma essencial.
3. **Abrir no celular:** rodar no Expo Go e no seu aparelho, e fazer o checklist M08 a M12 de `test-plan.md`. Fecha outra essencial.
4. **Vídeos:** upload no painel e player com áudio no app, com loop e velocidade. Você grava.
5. **Downloads por região e tela de suspeitas:** as duas importantes que faltam.

Depois disso, o `/replica-entrepreneur` lê as avaliações do CORE e dos concorrentes para ver o que mais vale a pena fazer melhor.

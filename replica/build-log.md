# Log de construção

App: `exame/` (Expo SDK 58, Expo Router, TypeScript). Dados: pacote de
conteúdo embutido (`exame/src/data/pacote-inicial.json`) lido por
`exame/src/data/conteudo.ts`, que mantém as mesmas funções quando o
/replica-backend trocar pelo pacote baixado.

Conferido em: versão web, 390 px e 1440 px, temas claro e escuro.
Prints em `replica/clone-screens/`. Ainda não aberto num celular de verdade.

| tela | data | estado | o que falta | o que deu mais trabalho |
| --- | --- | --- | --- | --- |
| S01 abertura | 2026-10-27 | parcial | splash própria; trocar pacote baixado com segurança | — |
| S02 menu principal | 2026-10-27 | feito | — | virou a barra de abas inferior (Regiões, Buscar, Favoritos, Mais) |
| S03 regiões | 2026-10-27 | feito | figura definitiva (/replica-brand); vista de costas | a figura em SVG gerava avisos na web; refeita com caixas, cada área é um botão |
| S04 lista da região | 2026-10-27 | feito | — | linha com `Link` perdia o estilo e o Enter não funcionava sem endereço real |
| S05 busca | 2026-10-27 | feito | — | nomes tipo "Neer's Test" exigiram tirar "test" do fim |
| S06 como fazer | 2026-10-27 | feito | textos definitivos do autor | — |
| S07 vídeo | 2026-10-27 | parcial | player, loop, velocidade, offline | só estado vazio: não há vídeos ainda |
| S08 acurácia | 2026-10-27 | feito | calculadora pós-teste (a conta já está pronta e testada) | — |
| S09 referências | 2026-10-27 | feito | aviso de sem internet nos links | — |
| S10 favoritos | 2026-10-27 | parcial | gravar no aparelho; sincronizar com conta | — |
| S11 vídeos offline | 2026-10-27 | esqueleto | download por região | depende dos vídeos |
| S12 mais | 2026-10-27 | parcial | escolha manual do tema | — |
| lista A–Z | — | não feito | tela inteira | — |
| painel do editor | — | não feito | é outro app (Next.js), próximo passo grande | — |

## Conferências feitas

- Tipos (`npx tsc --noEmit`): sem erros.
- Testes automáticos (`npm test` em `exame/`): 18 de 18 (selo de evidência, LR calculada, discordância, pós-teste, formatação, busca).
- Console do navegador: sem erros em 13 rotas, nos dois temas e nas duas larguras.
- Sem rolagem horizontal em 390 px.
- Só teclado: região → teste → aba Acurácia, com anel de foco de 2 px.
- Favoritar e ver na aba Favoritos.

## Para conferir

- `npx expo lint` não rodou: tenta baixar a configuração e a rede deste ambiente bloqueia.
- A documentação do Expo também está bloqueada; as APIs foram conferidas pelos tipos dos pacotes instalados (SDK 58).
- Favoritos somem ao recarregar (estão só na memória). Esperado nesta fase.
- O teste "Teste de demonstração (dados fictícios)" só aparece no modo de desenvolvimento, para ver as telas cheias. Números e referências inventados de propósito, com aviso na tela.
- Os três testes do ombro têm texto provisório escrito para testar o app; precisam do texto do autor.
- Fonte Inter ainda não carregada: usa a fonte do sistema.

## Maior que parecia

- O painel do editor é um segundo app inteiro (login, formulários, upload de vídeo, publicação do pacote). Não começou.
- Vídeos: gravar, comprimir, hospedar, tocar e baixar por região. Depende de você gravar.

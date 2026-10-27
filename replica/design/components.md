# Componentes

Sistema visual próprio. Nada do CORE foi medido nem copiado: sem prints
disponíveis e, de todo modo, o logo, a figura do corpo, as cores e os
textos dele não entram. Ícones: Lucide (licença ISC). Fonte: Inter (OFL).
A figura do corpo é desenhada do zero.

Regras para todos:
- cores só por token (`bg-surface`, `text-muted`), nunca hex no componente;
- área de toque mínima 48 px (`min-h-touch`);
- foco visível: anel de 2 px `focus`, afastado 2 px;
- cor nunca é a única pista: todo selo de evidência tem texto;
- números de acurácia em algarismos tabulares (`font-variant-numeric: tabular-nums`);
- respeitar "reduzir movimento" do sistema;
- textos de interface escritos do zero, em português.

Telas citadas pelo ID do `replica/recon.md` (S01–S12).

## Base

```
Button
  variantes  primary, secondary, ghost, danger
  tamanhos   md 48px (padrão no app), sm 36px (só no painel)
  estados    default, hover, pressed, focus-visible, disabled, loading
  tokens     primary: bg accent, texto on-accent, hover accent-hover;
             secondary: bg surface-raised, borda border-input, texto text;
             ghost: sem fundo, texto accent; danger: bg danger, texto bg
             radius md, fonte base/600
  a11y       <button> / Pressable com accessibilityRole="button";
             loading mantém o rótulo para leitor de tela e trava duplo toque
  usado em   S06, S07, S11, S12, painel

IconButton
  variantes  plain, filled
  tamanho    48px de área, ícone 24px
  estados    default, pressed, focus-visible, disabled
  a11y       rótulo obrigatório ("Favoritar Teste de Neer")
  usado em   cabeçalho, S06, S07

TextField / SearchField
  estados    vazio, digitando, com valor, erro, desabilitado
  tokens     bg bg, borda border-input (3:1), foco anel focus, erro borda danger
             + mensagem danger abaixo
  busca      ícone de lupa à esquerda, botão "Limpar" à direita quando há texto,
             teclado com ação "Buscar", sem autocorreção
  a11y       rótulo visível ou accessibilityLabel; erro ligado ao campo
  usado em   S05, painel

AppHeader
  altura     56px
  conteúdo   voltar (quando há histórico), título (xl no topo, lg ao rolar), ações
  usado em   todas as telas do app

BottomTabBar
  altura     64px + área segura
  abas       Regiões, Buscar, Favoritos, Mais
  estados    ativa (ícone e texto accent), inativa (text-muted)
  a11y       role tablist; aba ativa anunciada como selecionada
  usado em   S02–S05, S10, S12

EmptyState
  conteúdo   ícone Lucide 40px text-muted, título lg, uma frase, ação opcional
  casos      sem favoritos, busca sem resultado, região sem testes, sem dados de acurácia
  usado em   S04, S05, S08, S10

OfflineBanner
  quando     sem internet e a ação precisa dela (vídeo não baixado, link do PubMed)
  tokens     bg warning-soft, texto warning
  regra      nunca bloqueia o conteúdo que já está no aparelho
  usado em   S07, S09, S11

Toast
  casos      "Adicionado aos favoritos", "Download concluído", erros
  duração    4 s; ações com desfazer ficam 6 s
  a11y       live region polite
  usado em   S06, S11, painel
```

## Do domínio

```
BodyMap (mapa do corpo)
  variantes  frente, costas (alternar com botão segmentado)
  estados    região normal, pressionada, focada, com testes baixados (marcador)
  desenho    SVG próprio, traço simples, regiões em surface com borda border;
             pressionada em accent-soft com borda accent
  a11y       cada região é um botão com rótulo ("Ombro, 24 testes");
             abaixo do mapa, a mesma lista em texto, para quem não usa o mapa
  usado em   S03

RegionListItem
  conteúdo   nome da região, nº de testes, chevron
  usado em   S03 (lista abaixo do mapa)

TestListItem
  conteúdo   nome (base/600), linha 2 em text-muted com região e o melhor selo
             de evidência; estrela de favorito à direita
  estados    default, pressionado, favorito, não baixado (ícone de nuvem)
  altura     mínimo 64px
  a11y       um único alvo para abrir; a estrela é um alvo separado com rótulo
  usado em   S04, S05, S10

TestTabs (abas do teste)
  abas       Como fazer, Vídeo, Acurácia, Referências
  estados    ativa (texto accent, sublinhado 2px accent), inativa (text-muted)
  regra      as abas ficam fixas no topo ao rolar; deslizar troca de aba
  a11y       role tablist / tab / tabpanel
  usado em   S06–S09

TestSteps (como fazer)
  conteúdo   três blocos fixos: Posição do paciente, Execução, Positivo quando
  tokens     título lg, texto base, blocos em surface com radius md
  usado em   S06

EvidenceBadge (selo de evidência)
  níveis     forte, moderada, fraca, mínima, sem dados
  regra      calculado pela razão de verossimilhança (limiares usuais):
             forte     LR+ ≥ 10 ou LR− ≤ 0,1
             moderada  LR+ 5–10 ou LR− 0,1–0,2
             fraca     LR+ 2–5 ou LR− 0,2–0,5
             mínima    o resto
  tokens     forte: evidence-strong sobre evidence-strong-soft; moderada:
             evidence-moderate / -soft; fraca e mínima: evidence-weak / -soft
  formato    pílula, xs/500, sempre com o texto ("Evidência forte para confirmar")
  usado em   S04, S05, S08

PropertiesTable (tabela de acurácia)
  linhas     uma por estudo: condição-alvo, padrão-ouro, n, Sens (IC 95%),
             Esp (IC 95%), LR+, LR−, confiabilidade (κ ou ICC)
  celular    vira cartões empilhados, um por estudo; nada de rolagem horizontal
  regras     números com vírgula decimal e algarismos tabulares; "—" quando não
             há dado; LR calculada pelo app aparece com a marca "calculada";
             estudos que discordam (diferença de Sens ou Esp > 20 pontos)
             mostram aviso warning
  a11y       tabela real no painel; nos cartões, cada número tem rótulo falado
             ("sensibilidade 72 por cento, intervalo de 60 a 82")
  usado em   S08

PostTestCalculator (calculadora pós-teste)
  entrada    probabilidade pré-teste (0–100%, slider + campo), resultado (+/−)
  saída      probabilidade pós-teste, usando a LR do estudo escolhido
  aviso      fixo: "Apoio à decisão. Não substitui o julgamento clínico."
  usado em   S08

ReferenceItem
  conteúdo   citação em Vancouver (sm), ano, botões "PubMed" e "DOI"
  estados    normal, sem internet (botões desabilitados + OfflineBanner)
  usado em   S09

VideoPlayer
  estados    capa (poster), carregando, tocando, pausado, erro, offline sem download
  controles  tocar/pausar, repetir em loop, velocidade 0,5× / 1×, tela cheia
  regra      com áudio; legenda opcional; loop ligado por padrão (para ver a manobra)
  a11y       controles com rótulo; descrição textual do vídeo = aba "Como fazer"
  usado em   S07

FavoriteToggle (estrela)
  estados    ligado (preenchida, favorite), desligado (contorno, text-muted), focado
  a11y       role switch, "Favorito, ativado"
  usado em   S04, S05, S06, S10

DownloadRow (download por região)
  conteúdo   região, tamanho total, barra de progresso, ação
  estados    não baixado, baixando (%), pausado, concluído, erro (com "Tentar de novo"),
             sem espaço
  tokens     barra em accent sobre border; erro em danger
  a11y       progresso anunciado a cada 10%
  usado em   S11
```

## Painel (web)

```
DataTable       lista de testes com filtro por região e status; ordenar por atualização
StatusBadge     rascunho (weak), revisão (moderate), publicado (strong), arquivado (weak)
FormSection     agrupa campos com título; salvar sem perder o que foi digitado
TextArea        execução e resultado positivo; contador de caracteres
NumberField     Sens/Esp em %, convertido para 0–1 ao salvar; valida 0–100 e IC
PmidField       digita o PMID -> busca no PubMed -> preenche a citação para conferir
FileUpload      vídeo mp4; mostra tamanho e duração; recusa > 50 MB
ConfirmDialog   publicar pacote, arquivar teste
Sidebar         240px: Testes, Referências, Regiões, Publicar
```

## Layout

- App: cabeçalho 56px, barra inferior 64px, margem lateral 16px, uma coluna.
- Painel: largura máxima 1120px, barra lateral 240px a partir de 1024px; abaixo disso, menu no topo.
- Pontos de quebra: 640px e 1024px.
- Temas claro e escuro desde o início; segue o sistema, com opção manual em "Mais".

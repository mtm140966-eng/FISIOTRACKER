# Bugs

Achados pelos testes automáticos de `exame/e2e/` (build 4e11003, Chromium 1243,
390 px). Todos reproduzidos antes de corrigir; o teste que falhava ficou na suíte.

Abertos: nenhum. S1: 0 · S2: 0 · S3: 4 · S4: 1.

### BUG-001: favoritos de uma aba apagam os da outra

- Severidade: S3 (perda de dado, mas só na versão web com duas abas abertas; no celular existe uma instância do app só)
- Fluxo / caso: F06 / F06-E3
- Tela: S04, S10
- Build: 4e11003 · Chromium, 390 px

Passos
1. Abrir /regiao/ombro em duas abas.
2. Na aba 1, favoritar Teste de Neer.
3. Na aba 2, favoritar Teste de Jobe.
4. Recarregar a aba 1.

Esperado: Neer e Jobe favoritos.
Atual: só Jobe. A aba 2 gravou a lista que tinha na memória, sem Neer.
Evidência: teste F06-E3 (falhava; agora passa).
Causa: cada aba gravava a lista inteira da memória.
Status: corrigido em 5771b0a. Cada mudança lê o arquivo, aplica e grava, em fila; na web as abas ouvem as mudanças umas das outras.

### BUG-002: nome lido pelo leitor de tela diferente do texto na tela

- Severidade: S3 (quem usa comando de voz não consegue acionar o link dizendo o que vê; WCAG 2.5.3)
- Fluxo / caso: F01, F02, F06 / F01-H1, F02-H1, F06-H1, F01-E5
- Tela: S03, S04, S05, S10
- Build: 4e11003 · Chromium, 390 px

Passos
1. Abrir / ou /regiao/ombro.
2. Rodar o axe.

Esperado: o nome acessível de cada link contém o texto visível.
Atual: `label-content-name-mismatch` em 7 links (ex.: "Teste de Neer. Impacto subacromial. Evidência fraca" contra o texto "Teste de Neer · Impacto subacromial · Fraca").
Evidência: axe nos testes acima.
Status: corrigido em 5771b0a. O nome vem do próprio texto. O selo agora é lido como aparece ("Fraca"); o sentido completo ("para confirmar") segue na tela de acurácia.

### BUG-003: áreas do mapa do corpo menores que 24 px

- Severidade: S3 (difícil de tocar; WCAG 2.5.8)
- Fluxo / caso: F01 / F01-H1
- Tela: S03
- Build: 4e11003 · Chromium, 390 px

Passos
1. Abrir /.
2. Rodar o axe.

Esperado: toda área tocável com pelo menos 24 × 24 px.
Atual: `target-size` em 5 áreas (pescoço 22 × 16, punhos, joelhos).
Status: corrigido em 5771b0a. Figura ampliada 1,4× e pescoço redesenhado; a menor área tem 31 × 25 px.

### BUG-004: indicador de "carregando" sem nome

- Severidade: S4
- Fluxo / caso: F01 / F01-E6
- Tela: todas, no instante do carregamento
- Build: 4e11003 · Chromium, 390 px, tema escuro

Esperado: o leitor de tela anuncia "Carregando".
Atual: `aria-progressbar-name` e `aria-prohibited-attr`: o nome estava na caixa de fora, não no indicador.
Status: corrigido em 5771b0a.

### BUG-005: ficha do teste não rola pelo teclado

- Severidade: S3 (quem usa só teclado não alcança o fim da tela de acurácia)
- Fluxo / caso: F05 / F05-H1, F01-E6
- Tela: S06 a S09
- Build: 4e11003 · Chromium, 390 px

Passos
1. Abrir /teste/teste-de-demonstracao, aba Acurácia.
2. Rodar o axe.

Esperado: a área que rola pode receber foco.
Atual: `scrollable-region-focusable`.
Status: corrigido em 5771b0a. A área recebe foco e tem nome ("Conteúdo da aba Acurácia").

## Para conferir (não reproduzido)

- Rolagem e leitura com TalkBack/VoiceOver no celular de verdade (os testes rodam na web).
- O cronômetro de 15 s da atualização não foi testado no limite (o teste de rede lenta usa 5 s).
- Fluxo logado do painel: depende do Supabase (checklist M01 a M11 em `test-plan.md`).

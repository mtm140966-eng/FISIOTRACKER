# Mapa de recon: CORE – Clinical Orthopaedic Exam (Android, também iOS e Mac)

Escopo: a biblioteca de testes do exame físico ortopédico. Achar o teste
(por região, nome ou suspeita diagnóstica), ver como se faz (texto e vídeo),
ver a acurácia diagnóstica e as referências, salvar favoritos e usar offline.
Para: ortopedistas e fisioterapeutas brasileiros, consulta rápida no consultório.
Conteúdo: textos e vídeos próprios, gravados e escritos pelo dono do projeto.
Data: 2026-10-27

> Limitação desta recon: este ambiente não consegue abrir sites, só fazer
> buscas. Tudo abaixo vem de trechos de busca das lojas, do site do
> desenvolvedor e de reviews publicados. Telas e campos marcados como
> "inferido" precisam ser confirmados com prints. Se você tiver o app
> instalado, tire prints de cada tela e coloque em `replica/screens/`.

## Fontes

| # | fonte | URL | o que deu |
| --- | --- | --- | --- |
| 1 | Google Play | https://play.google.com/store/apps/details?id=com.crtech.android.core | descrição (300 a 400+ testes), nota 2,5 a 3,3 (cerca de 65 avaliações), 1 mil+ downloads, compra no app, reclamações |
| 2 | App Store | https://apps.apple.com/us/app/core-clinical-orthopedic-exam/id329470520 | US$ 39,99, compra no app para vídeos offline com áudio, nota 2,2 (cerca de 30 a 40 avaliações) |
| 3 | site do desenvolvedor | https://clinicallyrelevant.com/core-clinical-orthopedic-exam/ | 250+ testes, só entram testes publicados em revista revisada por pares, atualizações grátis, US$ 39,99 celular / US$ 49,99 Mac |
| 4 | página de reviews do desenvolvedor | https://clinicallyrelevant.com/reviews/ | elogios selecionados (JOSPT, TopOrthoApps) |
| 5 | review iMedicalApps 2012 | https://www.imedicalapps.com/2012/03/core-app-review/ | aba de busca, favoritos no canto inferior esquerdo, sinopse estatística, links para referências |
| 6 | review iMedicalApps 2010 (Android) | https://www.imedicalapps.com/2010/04/core-clinical-orthopedica-exam-android-medical-app-review/ | navegação por ordem alfabética, região e categoria diagnóstica; busca no menu principal |
| 7 | review TopOrthoApps 2013 | http://toporthoapps.com/2013/05/04/core-clinical-orthopedic-exam-2 | aba Propriedades (sensibilidade, especificidade, LR, acurácia) como diferencial |
| 8 | review theiphoneappreview | https://www.theiphoneappreview.com/core-clinical-orthopedic-exam/ | índice por região do corpo em figura e em texto |
| 9 | Amazon Appstore | https://www.amazon.co.uk/Clinically-Relevant-Technologies-CORE-ORthopaedic/dp/B0054SI6YA | descrição e plataformas |

## Ciclo central

Achar em segundos o teste certo para uma suspeita, ver como se executa e
saber quanto ele vale (sensibilidade, especificidade, razão de
verossimilhança), com a fonte.

## Telas

| ID | tela | como chegar | para que serve | componentes | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S01 | Abertura | abrir o app | carregar o banco de testes | logo, carregando | carregando, **erro (fecha sozinho, segundo as avaliações)** |
| S02 | Menu principal | depois da abertura | escolher como procurar | entradas: Região, A–Z, Categoria diagnóstica, Favoritos, Busca | preenchido |
| S03 | Mapa do corpo | S02 → Região | escolher a região tocando na figura | figura do corpo com áreas tocáveis, lista em texto | preenchido |
| S04 | Lista de testes | S03, S02 → A–Z ou Categoria | listar os testes filtrados | lista, cabeçalho de seção, estrela de favorito (inferido) | preenchido, vazio (inferido) |
| S05 | Busca | S02 → Busca | achar pelo nome ou epônimo | campo de busca, lista de resultados | vazio, com resultados, sem resultados (inferido) |
| S06 | Teste: Descrição | toque num teste | como executar: posição, manobra, o que é positivo | abas, texto, botão de favorito | preenchido |
| S07 | Teste: Vídeo | S06 → aba Vídeo | ver a manobra | player | streaming sem áudio, offline só depois da compra, falha no download |
| S08 | Teste: Propriedades | S06 → aba Propriedades | acurácia diagnóstica | tabela: Sens, Esp, LR+, LR−, acurácia, confiabilidade | preenchido, sem dados (inferido) |
| S09 | Teste: Referências | S06 → aba Referências | as fontes | lista de citações com link para o PubMed | precisa de internet |
| S10 | Favoritos | S02 → Favoritos | os testes que o clínico mais usa | lista | vazio, preenchido |
| S11 | Loja / downloads | menu ou aba Vídeo (inferido) | comprar e baixar vídeos para offline | botão de compra, progresso de download por região | comprado, baixando, erro (bug nos vídeos lombopélvicos) |
| S12 | Sobre / ajustes | menu (inferido) | versão, créditos, restaurar compra | texto, botões | preenchido |

## Fluxos

```
F01 Achar um teste pela região do corpo
    S02 -> S03 -> S04 -> S06
    cliques no caminho feliz: 3
    exceções: região sem testes, teste que vale para duas regiões (ex.: cervical e ombro)

F02 Achar um teste pelo nome
    S02 -> S05 (digitar) -> S06
    cliques no caminho feliz: 2 + digitação
    exceções: epônimo com grafia diferente (Neer/Neer's, Lachman/Lachmann), acento, nome em português vs. inglês, nenhum resultado

F03 Achar testes pela suspeita diagnóstica (ex.: lesão do manguito)
    S02 -> S04 (por categoria) -> S06
    cliques no caminho feliz: 3
    exceções: suspeita sem teste com boa acurácia

F04 Ver como se executa
    S06 -> S07
    cliques: 1
    exceções: sem internet, vídeo sem áudio, download que falha

F05 Avaliar se o teste vale a pena
    S06 -> S08 -> S09 -> PubMed (externo)
    cliques: 3
    exceções: estudos discordantes, teste sem dados, sem internet

F06 Salvar favorito e voltar a ele
    S06 (estrela) -> S02 -> S10 -> S06
    cliques: 4
    exceções: favoritos perdidos ao trocar de celular (inferido: ficam só no aparelho)

F07 Comprar e baixar os vídeos para uso offline
    S11 -> compra na loja -> download -> S07 offline
    cliques: 3 + loja
    exceções: download interrompido, falta de espaço, restaurar compra em outro aparelho
```

## Componentes

| componente | variações | estados | onde aparece |
| --- | --- | --- | --- |
| Item de lista de teste | com ou sem estrela | normal, tocado, favorito | S04, S05, S10 |
| Mapa do corpo | frente, costas (inferido) | normal, região tocada | S03 |
| Abas do teste | Descrição, Vídeo, Propriedades, Referências | ativa, inativa | S06–S09 |
| Tabela de propriedades | uma linha por estudo/condição (inferido) | com dados, sem dados | S08 |
| Player de vídeo | streaming, offline | carregando, tocando, erro | S07 |
| Campo de busca | — | vazio, digitando, sem resultados | S05 |
| Botão de favorito (estrela) | — | ligado, desligado | S04, S06 |
| Barra de progresso de download | por região | baixando, pronto, erro | S11 |
| Link de referência | PubMed | normal, sem internet | S09 |

## Modelo de dados inferido

```
Regiao       id, nome, ordem, area_na_figura
             evidência: S03, fontes 6 e 8 (índice por região em figura e texto)
             confiança: alta

Teste        id, nome, sinonimos (epônimos e grafias), regiao_id,
             posicao_paciente, execucao, resultado_positivo, video_id
             evidência: S06, fonte 3 (instruções e vídeo para cada teste)
             confiança: alta

Categoria    id, nome (suspeita diagnóstica, ex.: "instabilidade anterior"), regiao_id
             evidência: fonte 6 (busca por categoria diagnóstica)
             confiança: média

PropriedadeDiagnostica
             id, teste_id, condicao_alvo, padrao_ouro, populacao,
             sensibilidade, especificidade, lr_positiva, lr_negativa,
             acuracia, confiabilidade (kappa/ICC), referencia_id
             evidência: S08, fontes 5 e 7
             confiança: alta para os campos; palpite: uma linha por estudo

Referencia   id, citacao, pmid, doi, url
             evidência: S09, fontes 3 e 5 (links para o PubMed)
             confiança: alta

Video        id, teste_id, url_streaming, url_download, duracao, tem_audio
             evidência: S07, fonte 2 (streaming sem áudio; versão offline com áudio é paga)
             confiança: alta

Favorito     teste_id, criado_em  (no aparelho, sem conta: palpite)
             evidência: S10, fonte 5
             confiança: média

Compra       produto (pacote de vídeos offline), status, restaurada_em
             evidência: S11, fontes 1 e 2
             confiança: média
```

Relações: Regiao 1-n Teste, Teste n-n Categoria, Teste 1-n PropriedadeDiagnostica,
PropriedadeDiagnostica n-1 Referencia, Teste 1-1 Video, Teste 1-n Favorito.

## O que os usuários reclamam (para o /replica-entrepreneur aprofundar)

- O app fecha ao abrir ("app has stopped"), em Android e iOS. Fontes 1 e 2.
- Vídeos em streaming não têm áudio; offline e com áudio só pagando à parte, mesmo depois de pagar US$ 39,99. Fontes 1 e 2.
- Bug que impede baixar os vídeos lombopélvicos. Fonte 1.
- Sem modo quiz/revisão. Fonte 1.
- Interface poluída. Fonte 1.
- Só em inglês (lacuna para o Brasil; ponto a confirmar, não é reclamação registrada).

## Matriz de funcionalidades

Ver `features.csv`. Must: 13, should: 9, could: 5, skip: 5.

## Fora do escopo (não pode ou não deve ser copiado)

- Os textos de descrição, os vídeos e as fotos do CORE: são deles. Os seus serão gravados e escritos por você.
- As tabelas de propriedades montadas por eles. Os números de sensibilidade e especificidade vêm de artigos publicados; você pode levantá-los de novo **direto dos artigos originais**, citando cada um, mas não copiar a compilação do CORE.
- O nome "CORE", o logo, as cores e a figura do corpo deles.
- As avaliações e a base de usuários deles.
- A vender: ver se o app se enquadra como software médico na ANVISA (RDC 657/2022). Uma referência de consulta para profissionais normalmente não se enquadra, mas confirme antes de lançar.

## Tamanho

Telas 12, fluxos 7, entidades 8.
Partes difíceis:
1. **O conteúdo:** gravar, editar e escrever cada teste, e levantar as propriedades diagnósticas com referência. É o maior custo do projeto, muito maior que o app. Começar com 30 a 50 testes das regiões que você mais examina.
2. **Vídeos offline:** hospedar, baixar por região, retomar download interrompido, ocupar pouco espaço.
3. **Estabilidade:** o original é criticado justamente por fechar ao abrir. O seu precisa abrir sempre, inclusive offline.

Tamanho do app: **M** (algumas semanas). Tamanho do conteúdo completo (300+ testes): **L** (um trimestre ou mais). Recomendo lançar com poucas regiões e crescer.

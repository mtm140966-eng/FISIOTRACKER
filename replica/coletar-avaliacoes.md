# Coletar as avaliações do CORE

O /replica-entrepreneur só trabalha com avaliações reais, copiadas palavra
por palavra, cada uma com o link de onde veio. Este ambiente não consegue
abrir os sites de avaliação: a rede bloqueia `itunes.apple.com`,
`play.google.com`, `hn.algolia.com` e `www.reddit.com`. Por isso a planilha
`replica/reviews.csv` está vazia, e nenhuma conclusão foi tirada ainda.

Há dois caminhos.

## Caminho A: liberar a rede (eu coleto o que for permitido)

Nas configurações do ambiente (menu do ambiente na barra de título da sessão,
Edit, Network access), acrescente em Allowed domains:

- `itunes.apple.com`: feed oficial de avaliações da App Store
- `hn.algolia.com`: busca oficial do Hacker News
- `www.reddit.com` e `oauth.reddit.com`: API do Reddit, dentro dos termos

Passo a passo: https://code.claude.com/docs/en/cloud-environments#network-access

A Google Play não tem feed público de avaliações. Essas você copia à mão (caminho B).

## Caminho B: você copia (5 a 10 minutos por loja)

No celular ou no computador, abra a página do app, "Ver todas as avaliações",
ordene por mais recentes e copie cada uma para `replica/reviews.csv`, uma por
linha:

```
source,url,date,rating,text
google-play,https://play.google.com/store/apps/details?id=com.crtech.android.core,2025-03-02,1,"texto exatamente como está na loja"
app-store,https://apps.apple.com/us/app/core-clinical-orthopedic-exam/id329470520,2024-11-15,2,"..."
```

- `text`: copie igual, sem corrigir nem traduzir. Se tiver aspas no texto, dobre-as ("").
- `url`: o link da avaliação; se a loja não tiver link próprio por avaliação, use o da página do app.
- Leia também as de 3 e 4 estrelas: "gosto, mas..." costuma ser o melhor material.

Fontes, por valor:

| fonte | onde |
| --- | --- |
| Google Play | https://play.google.com/store/apps/details?id=com.crtech.android.core |
| App Store | https://apps.apple.com/us/app/core-clinical-orthopedic-exam/id329470520 |
| Amazon Appstore | https://www.amazon.co.uk/Clinically-Relevant-Technologies-CORE-ORthopaedic/dp/B0054SI6YA |
| Reddit | buscar "orthopedic exam app", "special tests app", "CORE ortho app" em r/physicaltherapy, r/orthopaedics, r/medicalschool |
| colegas | grupos de residentes e fisioterapeutas: só com permissão de quem escreveu, e sem nome |

O CORE tem poucas avaliações (cerca de 65 na Google Play e de 30 a 40 na App
Store, segundo os resumos de busca). Para chegar a 100, inclua apps
concorrentes de testes ortopédicos que você conhece, marcando o app no campo
`source` (ex.: `google-play:nome-do-app`).

Quando a planilha estiver pronta, rode `/replica-entrepreneur` de novo.

## Sinais a confirmar (não contam como evidência)

Estes pontos apareceram em **resumos** da busca na web, não nas páginas. Não
são citações e não entram em nenhuma contagem. Servem só para saber o que
procurar ao ler as avaliações:

- o app fecharia ao abrir, em Android e iPhone;
- os vídeos em streaming não teriam áudio, e a versão offline com áudio seria uma compra à parte;
- haveria falha para baixar os vídeos lombopélvicos;
- falta de modo quiz;
- interface poluída;
- elogios à aba de propriedades diagnósticas (Sens, Esp, LR) em reviews de 2010 a 2013.

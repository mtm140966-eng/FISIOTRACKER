# Plano de testes: app de exame ortopédico

Build: 5771b0a (correções) · Data: 2026-10-27 · Ambiente: local
App: versão web do Expo, 390 px (Pixel 7), servidor do Supabase imitado no navegador.
Painel: build de produção, sem Supabase (login "fora do ar").
Banco: Postgres 16 local com simulação mínima do Supabase.

Como rodar:

```bash
cd exame && npx playwright test        # 39 casos do app
cd painel && npx playwright test       # 6 casos do painel (sem login)
supabase/testes/rodar.sh "<url de um banco vazio>"   # 25 verificações do banco
cd exame && npm test; cd painel && npm test           # unitários: 22 + 10
```

Todo caso automático falha se houver erro no console, resposta 5xx inesperada
ou violação de acessibilidade (axe, WCAG 2.2 AA) nas telas que verifica.

## App

| caso | fluxo | tipo | o que faz | esperado | auto | resultado |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | região | feliz | Regiões → Ombro → Teste de Neer | ficha com posição, execução e positivo | e2e | passou (falhou antes: BUG-002, BUG-003) |
| F01-H2 | região | feliz | toca no ombro da figura | abre a região | e2e | passou |
| F01-E1 | região | só teclado | Tab até Ombro, Enter, Tab até Neer, Enter | navega; anel de foco de 2 px | e2e | passou |
| F01-E2 | região | voltar no meio | ficha → voltar | volta à lista | e2e | passou |
| F01-E3 | região | recarregar no meio | recarrega a ficha | ficha continua | e2e | passou |
| F01-E4 | região | vazio | Joelho | "Nenhum teste ainda" | e2e | passou |
| F01-E5 | região | nome longo + emoji + acento | pacote com nome de 70 caracteres e 🦴 | lista sem rolagem lateral | e2e | passou (falhou antes: BUG-002) |
| F01-E6 | região | tema escuro | 3 telas no escuro | sem problema de contraste | e2e | passou (falhou antes: BUG-004, BUG-005) |
| F01-N1 | região | inexistente | /regiao/nariz | "Região não encontrada" | e2e | passou |
| F01-N2 | região | inexistente | /teste/nao-existe | "Teste não encontrado" | e2e | passou |
| F02-H1 | busca | feliz | "neer's" | Teste de Neer primeiro | e2e | passou (falhou antes: BUG-002) |
| F02-E1 | busca | vazio | campo vazio | dica de busca | e2e | passou |
| F02-E2 | busca | curto | 1 letra | não busca | e2e | passou |
| F02-E3 | busca | acento | "apreensao" | acha "apreensão" | e2e | passou |
| F02-E4 | busca | digitação | "apreensaa" | acha "apreensão" | e2e | passou |
| F02-E5 | busca | emoji | "🦴🦴" | não quebra | e2e | passou |
| F02-E6 | busca | muito longo | 600 caracteres | "Nenhum teste", sem rolagem lateral | e2e | passou |
| F02-E7 | busca | limpar | botão Limpar | campo vazio e dica | e2e | passou |
| F02-E8 | busca | inglês e sinônimo | "empty can", "lata vazia" | Teste de Jobe | e2e | passou |
| F02-N1 | busca | sem resultado | "xyzw" | estado vazio | e2e | passou |
| F03-H1 | suspeita | feliz | "instabilidade" | apreensão anterior | e2e | passou |
| F04-H1 | vídeo | sem vídeo | aba Vídeo | estado vazio; aba marcada | e2e | passou |
| F05-H1 | acurácia | feliz | teste de demonstração | LR "calculada", IC falado, selo, aviso de discordância | e2e | passou (falhou antes: BUG-005) |
| F05-H2 | acurácia | referências | aba Referências | numeradas 1 e 2 | e2e | passou |
| F05-E1 | acurácia | sem estudos | Neer | estados vazios | e2e | passou |
| F06-H1 | favoritos | feliz | estrela → aba Favoritos | aparece | e2e | passou (falhou antes: BUG-002) |
| F06-E1 | favoritos | recarregar | estrela → recarrega | continua marcado | e2e | passou |
| F06-E2 | favoritos | desmarcar | desmarca na aba Favoritos | lista vazia, também após recarregar | e2e | passou |
| F06-E3 | favoritos | duas abas | cada aba marca um | os dois ficam | e2e | passou (falhou antes: BUG-001) |
| F06-E4 | favoritos | clique duplo | duplo na estrela | volta a desmarcado | e2e | passou |
| F06-E5 | favoritos | sem armazenamento | localStorage bloqueado | marca, sem erro | e2e | passou |
| F07-H1 | downloads | vazio | Vídeos offline | "Nenhum vídeo publicado" | e2e | passou |
| F08-H1 | atualização | feliz | servidor com versão 3 | baixa, mostra, some o não publicado, guarda com servidor fora | e2e | passou |
| F08-E1 | atualização | adulterado | sha256 errado | recusa, mantém | e2e | passou |
| F08-E2 | atualização | formato errado | teste sem campos | recusa, mantém | e2e | passou |
| F08-E3 | atualização | erro 500 | servidor quebrado | mantém, avisa | e2e | passou |
| F08-E4 | atualização | rede lenta | resposta em 5 s | app usável antes de chegar | e2e | passou |
| F08-E5 | atualização | clique duplo | duplo em "Procurar atualização" | baixa uma vez | e2e | passou |
| F08-E7 | atualização | mesma versão | procurar de novo | não baixa | e2e | passou |

Não se aplicam ao app: senha errada, sessão expirada, cartão recusado (o app não tem
login nem pagamento); fuso horário (não mostra datas).

## Painel

| caso | fluxo | tipo | o que faz | esperado | auto | resultado |
| --- | --- | --- | --- | --- | --- | --- |
| P01-H1 | entrar | feliz | e-mail válido | mensagem neutra (não revela se é editor) | e2e | passou |
| P01-N1 | entrar | inválido | "nao-e-email" sem a checagem do navegador | servidor recusa, campo marcado | e2e | passou |
| P01-E1 | entrar | sem login | 5 páginas internas | vão para /entrar | e2e | passou |
| P01-E2 | entrar | escuro, 1440 px | /entrar | sem problema de acessibilidade | e2e | passou |
| P01-E3 | entrar | clique duplo | duplo em Enviar | uma mensagem, sem erro | e2e | passou |
| P01-E4 | entrar | link quebrado | /auth/confirmar sem dados válidos | volta para /entrar | e2e | passou |
| P02 a P04 | validação | unit | % → fração, IC, publicar exige texto, citação PubMed | regras certas | unit | 10 de 10 |

## Banco

| caso | o que verifica | resultado |
| --- | --- | --- |
| B01 a B25 | anônimo e clínico não veem rascunho nem publicam; segundo usuário não vê nem apaga favoritos do primeiro; ninguém vira editor; pacote só por `publicar_pacote()`; versões em sequência; sha256 confere; só referências usadas; vídeo só por editor; apagar conta apaga perfil e favoritos | 25 de 25 |

## Manual (precisa do Supabase de verdade ou de um celular)

Fazer depois dos passos de `replica/backend.md`. Marque cada item.

- [ ] M01 o link de login chega no e-mail e abre o painel logado
- [ ] M02 uma conta que não é editor cai em "Esta conta não é de editor"
- [ ] M03 criar teste novo; salvar sem nome mostra o erro no campo
- [ ] M04 mudar para "Publicado" sem execução mostra o erro no campo
- [ ] M05 "Buscar no PubMed" com um PMID real preenche citação, ano e DOI
- [ ] M06 estudo com IC inferior maior que o superior é recusado com mensagem
- [ ] M07 "Publicar agora" cria a versão 1; a página mostra "Versão no ar: 1"
- [ ] M08 o app no celular (Expo Go) abre, baixa a versão 1 e mostra o teste publicado
- [ ] M09 modo avião: fechar e abrir o app mostra o mesmo conteúdo
- [ ] M10 favorito continua depois de fechar o app no celular
- [ ] M11 "Sair" no painel encerra a sessão em todos os lugares
- [ ] M12 leitor de tela no celular (TalkBack ou VoiceOver) lê região, teste, selo e números

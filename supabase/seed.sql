-- Dados iniciais: as 8 regiões e 3 testes do ombro com texto PROVISÓRIO,
-- em status 'revisao'. Nada é publicado até um editor revisar e publicar.
-- Gerado a partir de exame/src/data/pacote-inicial.json.

insert into regioes (slug, nome, nome_en, ordem, area_figura) values
  ('coluna-cervical', 'Coluna cervical', 'Cervical spine', 1, 'cervical'),
  ('ombro', 'Ombro', 'Shoulder', 2, 'ombro'),
  ('cotovelo', 'Cotovelo', 'Elbow', 3, 'cotovelo'),
  ('punho-mao', 'Punho e mão', 'Wrist and hand', 4, 'punho'),
  ('coluna-lombar', 'Coluna lombar e pelve', 'Lumbar spine and pelvis', 5, 'lombar'),
  ('quadril', 'Quadril', 'Hip', 6, 'quadril'),
  ('joelho', 'Joelho', 'Knee', 7, 'joelho'),
  ('tornozelo-pe', 'Tornozelo e pé', 'Ankle and foot', 8, 'tornozelo')
on conflict (slug) do nothing;

insert into categorias (regiao_id, slug, nome)
select g.id, v.slug, v.nome from (values
  ('ombro', 'impacto-subacromial', 'Impacto subacromial'),
  ('ombro', 'instabilidade-anterior', 'Instabilidade anterior'),
  ('ombro', 'lesao-do-supraespinal', 'Lesão do supraespinal')
) as v(regiao, slug, nome) join regioes g on g.slug = v.regiao
on conflict (slug) do nothing;

insert into testes (slug, regiao_id, nome, nome_en, sinonimos, posicao_paciente, execucao, resultado_positivo, observacoes, status)
select 'teste-de-neer', id, 'Teste de Neer', 'Neer''s test', array['Neer impingement sign','Sinal de Neer']::text[],
  'Sentado ou em pé, braço relaxado ao lado do corpo.',
  'O examinador estabiliza a escápula com uma mão e, com a outra, eleva passivamente o braço em rotação interna no plano da escápula até o máximo.',
  'Dor na face anterolateral do ombro durante a elevação.',
  'Texto provisório para testar o app. Substituir pelo texto do autor.', 'revisao'
from regioes where slug = 'ombro'
on conflict (slug) do nothing;

insert into teste_categorias (teste_id, categoria_id)
select t.id, c.id from testes t, categorias c where t.slug = 'teste-de-neer' and c.slug = 'impacto-subacromial'
on conflict do nothing;

insert into testes (slug, regiao_id, nome, nome_en, sinonimos, posicao_paciente, execucao, resultado_positivo, observacoes, status)
select 'teste-de-jobe', id, 'Teste de Jobe', 'Empty can test', array['Lata vazia','Supraspinatus test']::text[],
  'Em pé ou sentado, braços a 90° de abdução no plano da escápula, rotação interna completa (polegares para baixo).',
  'O examinador aplica força para baixo nos dois braços ao mesmo tempo, e o paciente resiste.',
  'Dor ou fraqueza do lado examinado em relação ao outro.',
  'Texto provisório para testar o app. Substituir pelo texto do autor.', 'revisao'
from regioes where slug = 'ombro'
on conflict (slug) do nothing;

insert into teste_categorias (teste_id, categoria_id)
select t.id, c.id from testes t, categorias c where t.slug = 'teste-de-jobe' and c.slug = 'lesao-do-supraespinal'
on conflict do nothing;

insert into teste_categorias (teste_id, categoria_id)
select t.id, c.id from testes t, categorias c where t.slug = 'teste-de-jobe' and c.slug = 'impacto-subacromial'
on conflict do nothing;

insert into testes (slug, regiao_id, nome, nome_en, sinonimos, posicao_paciente, execucao, resultado_positivo, observacoes, status)
select 'teste-de-apreensao-anterior', id, 'Teste de apreensão anterior', 'Anterior apprehension test', array['Apprehension test','Apreensão']::text[],
  'Decúbito dorsal, ombro na borda da maca, abdução de 90° e cotovelo fletido a 90°.',
  'O examinador leva o ombro em rotação externa progressiva, com cuidado.',
  'Sensação de que o ombro vai sair do lugar (apreensão), não apenas dor.',
  'Texto provisório para testar o app. Substituir pelo texto do autor.', 'revisao'
from regioes where slug = 'ombro'
on conflict (slug) do nothing;

insert into teste_categorias (teste_id, categoria_id)
select t.id, c.id from testes t, categorias c where t.slug = 'teste-de-apreensao-anterior' and c.slug = 'instabilidade-anterior'
on conflict do nothing;

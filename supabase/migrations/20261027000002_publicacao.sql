-- Publicação do conteúdo para o app.
-- O formato do JSON é o de exame/src/data/types.ts (Pacote). Mudou um, muda o outro.

create or replace function montar_pacote(p_versao int) returns jsonb
language sql stable security definer set search_path = public as $$
  with publicados as (
    select * from testes where status = 'publicado'
  ),
  refs as (
    select distinct r.*
    from referencias r
    join propriedades p on p.referencia_id = r.id
    join publicados t on t.id = p.teste_id
  )
  select jsonb_build_object(
    'versao', p_versao,
    'geradoEm', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'regioes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', g.slug, 'nome', g.nome, 'nomeEn', g.nome_en,
        'ordem', g.ordem, 'areaFigura', g.area_figura
      ) order by g.ordem, g.slug)
      from regioes g
    ), '[]'::jsonb),
    'testes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', t.slug,
        'regiao', g.slug,
        'nome', t.nome,
        'nomeEn', t.nome_en,
        'sinonimos', to_jsonb(t.sinonimos),
        'categorias', coalesce((
          select jsonb_agg(c.nome order by c.nome)
          from teste_categorias tc join categorias c on c.id = tc.categoria_id
          where tc.teste_id = t.id
        ), '[]'::jsonb),
        'posicaoPaciente', t.posicao_paciente,
        'execucao', t.execucao,
        'resultadoPositivo', t.resultado_positivo,
        'observacoes', t.observacoes,
        'propriedades', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', p.id,
            'referenciaId', p.referencia_id,
            'condicaoAlvo', p.condicao_alvo,
            'padraoOuro', p.padrao_ouro,
            'populacao', p.populacao,
            'n', p.n,
            'sensibilidade', p.sensibilidade,
            'sensIc', case when p.sens_ic_inf is null or p.sens_ic_sup is null then null
                           else jsonb_build_array(p.sens_ic_inf, p.sens_ic_sup) end,
            'especificidade', p.especificidade,
            'espIc', case when p.esp_ic_inf is null or p.esp_ic_sup is null then null
                          else jsonb_build_array(p.esp_ic_inf, p.esp_ic_sup) end,
            'lrPositiva', p.lr_positiva,
            'lrNegativa', p.lr_negativa,
            'confiabilidade', p.confiabilidade,
            'confiabilidadeTipo', p.confiabilidade_tipo
          ) order by p.created_at, p.id)
          from propriedades p where p.teste_id = t.id
        ), '[]'::jsonb),
        'video', (
          select jsonb_build_object(
            'caminho', v.caminho, 'duracaoS', v.duracao_s,
            'tamanhoBytes', v.tamanho_bytes, 'temAudio', v.tem_audio
          )
          from videos v where v.teste_id = t.id
        )
      ) order by t.nome, t.slug)
      from publicados t join regioes g on g.id = t.regiao_id
    ), '[]'::jsonb),
    'referencias', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'citacao', r.citacao, 'pmid', r.pmid, 'doi', r.doi, 'ano', r.ano
      ) order by r.id)
      from refs r
    ), '[]'::jsonb)
  );
$$;

-- Só editores publicam. A tabela fica travada durante a publicação, então
-- duas publicações ao mesmo tempo saem com versões seguidas, nunca iguais.
create or replace function publicar_pacote() returns pacotes
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_versao int;
  v_json jsonb;
  v_texto text;
  v_novo pacotes;
begin
  if not eh_editor() then
    raise exception 'só editores publicam' using errcode = '42501';
  end if;

  lock table pacotes in exclusive mode;
  select coalesce(max(versao), 0) + 1 into v_versao from pacotes;
  v_json := montar_pacote(v_versao);
  v_texto := v_json::text;

  insert into pacotes (versao, conteudo, sha256, total_testes, publicado_por)
  values (
    v_versao,
    v_texto,
    encode(digest(convert_to(v_texto, 'UTF8'), 'sha256'), 'hex'),
    jsonb_array_length(v_json -> 'testes'),
    auth.uid()
  )
  returning * into v_novo;
  return v_novo;
end $$;

revoke all on function montar_pacote(int) from public, anon, authenticated;
revoke all on function publicar_pacote() from public, anon;
grant execute on function publicar_pacote() to authenticated;

-- Para o app: a última versão sem o conteúdo (leve), para saber se precisa baixar.
create or replace view ultimo_pacote with (security_invoker = true) as
  select versao, sha256, total_testes, created_at
  from pacotes
  order by versao desc
  limit 1;
grant select on ultimo_pacote to anon, authenticated;

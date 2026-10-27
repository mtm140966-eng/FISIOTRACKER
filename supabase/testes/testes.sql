-- Testes das regras de acesso e da publicação. Param no primeiro erro.
-- Rodar depois das migrações e do seed (ver supabase/testes/rodar.sh).
\set ON_ERROR_STOP on

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;

insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000e1'),  -- editor
  ('00000000-0000-0000-0000-0000000000c1'),  -- clínico 1
  ('00000000-0000-0000-0000-0000000000c2');  -- clínico 2
update perfis set papel = 'editor' where id = '00000000-0000-0000-0000-0000000000e1';

create function pg_temp.como(papel text, uid text) returns void language plpgsql as $$
begin
  perform set_config('role', papel, true);
  perform set_config('request.jwt.claim.sub', coalesce(uid, ''), true);
end $$;

create function pg_temp.espera(cond boolean, msg text) returns void language plpgsql as $$
begin
  if not cond then raise exception 'FALHOU: %', msg; end if;
  raise notice 'ok: %', msg;
end $$;

-- 1. seed: tudo em revisão, nada público
begin;
select pg_temp.como('anon', null);
select pg_temp.espera((select count(*) from testes) = 0, 'anônimo não vê testes em revisão');
select pg_temp.espera((select count(*) from regioes) = 8, 'anônimo vê as 8 regiões');
rollback;

-- 2. clínico e anônimo não publicam
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c1');
do $$ begin perform publicar_pacote(); raise exception 'FALHOU: clínico publicou';
exception when insufficient_privilege then raise notice 'ok: clínico não publica'; end $$;
rollback;
begin;
select pg_temp.como('anon', null);
do $$ begin perform publicar_pacote(); raise exception 'FALHOU: anônimo publicou';
exception when insufficient_privilege then raise notice 'ok: anônimo não publica'; end $$;
rollback;

-- 3. editor publica dois testes com um estudo; o pacote sai certo
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000e1');
update testes set status = 'publicado', publicado_em = now() where slug in ('teste-de-neer', 'teste-de-jobe');
insert into referencias (id, citacao, pmid) values ('00000000-0000-0000-0000-00000000aaaa', 'Referência fictícia de teste.', '1');
insert into propriedades (teste_id, referencia_id, condicao_alvo, sensibilidade, especificidade, sens_ic_inf, sens_ic_sup)
  select id, '00000000-0000-0000-0000-00000000aaaa', 'condição', 0.5, 0.75, 0.4, 0.6 from testes where slug = 'teste-de-neer';
insert into referencias (citacao) values ('Referência que nenhum teste usa.');
create temp table pub on commit drop as select * from publicar_pacote();
select pg_temp.espera((select versao from pub) = 1, 'primeira versão é 1');
select pg_temp.espera((select total_testes from pub) = 2, 'pacote tem 2 testes publicados');
select pg_temp.espera((select sha256 from pub) = encode(extensions.digest(convert_to((select conteudo from pub), 'UTF8'), 'sha256'), 'hex'), 'sha256 confere com o texto');
select pg_temp.espera(jsonb_array_length((select conteudo from pub)::jsonb -> 'referencias') = 1, 'só a referência usada entra no pacote');
select pg_temp.espera(((select conteudo from pub)::jsonb #> '{testes,1,propriedades,0,sensIc}') = '[0.400, 0.600]'::jsonb, 'IC vira par [inf, sup]');
select pg_temp.espera(((select conteudo from pub)::jsonb #>> '{testes,0,categorias,0}') is not null, 'categorias entram pelo nome');
select pg_temp.espera((select publicado_por from pub) = '00000000-0000-0000-0000-0000000000e1', 'registra quem publicou');
create temp table pub2 on commit drop as select * from publicar_pacote();
select pg_temp.espera((select versao from pub2) = 2, 'segunda publicação vira versão 2');
\copy (select conteudo from pub) to '/tmp/pacote-teste.json'
select pg_temp.como('anon', null);
select pg_temp.espera((select versao from ultimo_pacote) = 2, 'anônimo vê a última versão');
select pg_temp.espera((select count(*) from testes) = 2, 'anônimo vê os 2 publicados');
select pg_temp.espera((select count(*) from propriedades) = 1, 'anônimo vê o estudo do teste publicado');
rollback;

-- 4. ninguém escreve pacote direto
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000e1');
do $$ begin
  insert into pacotes (versao, conteudo, sha256, total_testes) values (99, '{}', repeat('0', 64), 0);
  raise exception 'FALHOU: editor inseriu pacote direto';
exception when insufficient_privilege then raise notice 'ok: pacote só sai por publicar_pacote()'; end $$;
rollback;

-- 5. favoritos: o segundo usuário não vê nada do primeiro
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000e1');
update testes set status = 'publicado', publicado_em = now() where slug = 'teste-de-neer';
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c1');
insert into favoritos (user_id, teste_id) select '00000000-0000-0000-0000-0000000000c1', id from testes where slug = 'teste-de-neer';
select pg_temp.espera((select count(*) from favoritos) = 1, 'clínico 1 vê o seu favorito');
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c2');
select pg_temp.espera((select count(*) from favoritos) = 0, 'clínico 2 não vê favoritos do clínico 1');
do $$ begin
  delete from favoritos;
  if exists (select 1 from favoritos) then null; end if;
end $$;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c1');
select pg_temp.espera((select count(*) from favoritos) = 1, 'clínico 2 não apaga favorito alheio');
rollback;

-- 6. clínico não edita conteúdo nem vira editor
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c1');
update testes set nome = 'x';
select pg_temp.espera(not exists (select 1 from testes where nome = 'x'), 'clínico não edita teste');
do $$ begin
  update perfis set papel = 'editor' where id = '00000000-0000-0000-0000-0000000000c1';
  raise exception 'FALHOU: clínico virou editor';
exception when insufficient_privilege then raise notice 'ok: clínico não vira editor'; end $$;
rollback;

-- 7. vídeos: só editor envia
begin;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000c1');
do $$ begin
  insert into storage.objects (bucket_id, name) values ('videos', 'x.mp4');
  raise exception 'FALHOU: clínico enviou vídeo';
exception when insufficient_privilege then raise notice 'ok: clínico não envia vídeo'; end $$;
select pg_temp.como('authenticated', '00000000-0000-0000-0000-0000000000e1');
insert into storage.objects (bucket_id, name) values ('videos', 'ombro/neer.mp4');
select pg_temp.espera(true, 'editor envia vídeo');
rollback;

-- 8. apagar a conta apaga perfil e favoritos
begin;
insert into favoritos (user_id, teste_id) select '00000000-0000-0000-0000-0000000000c1', id from testes limit 1;
delete from auth.users where id = '00000000-0000-0000-0000-0000000000c1';
select pg_temp.espera(not exists (select 1 from perfis where id = '00000000-0000-0000-0000-0000000000c1'), 'perfil some com a conta');
select pg_temp.espera(not exists (select 1 from favoritos where user_id = '00000000-0000-0000-0000-0000000000c1'), 'favoritos somem com a conta');
rollback;

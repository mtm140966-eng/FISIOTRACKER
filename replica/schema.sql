-- Schema do app de exame ortopédico (reconstrução das funcionalidades do CORE).
-- Postgres no Supabase. Acesso por row level security (RLS):
--   * conteúdo publicado: leitura pública (anon e logados)
--   * conteúdo em rascunho/revisão: só editores
--   * escrita de conteúdo: só editores
--   * favoritos: cada usuário só vê e mexe nos seus
-- Tudo em UTC (timestamptz).

create extension if not exists pgcrypto;
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- updated_at automático --------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Perfis e papéis --------------------------------------------------------
-- Um perfil por usuário do Supabase Auth. 'editor' escreve conteúdo;
-- 'clinico' é o usuário comum do app (só precisa de conta para sincronizar
-- favoritos; o app funciona sem login).

create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  papel text not null default 'clinico'
    check (papel in ('clinico', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger perfis_updated_at before update on perfis
  for each row execute function set_updated_at();

create or replace function eh_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfis
    where id = auth.uid() and papel in ('editor', 'admin')
  );
$$;

-- Status editorial, igual para testes e vídeos
-- rascunho -> revisao -> publicado (-> arquivado)

-- Regiões do corpo (S03) ---------------------------------------------------

create table regioes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- 'ombro', 'joelho'
  nome text not null,                        -- 'Ombro'
  nome_en text not null default '',          -- 'Shoulder'
  ordem int not null default 0,
  area_figura text not null default '',      -- id da área tocável na figura do corpo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger regioes_updated_at before update on regioes
  for each row execute function set_updated_at();

-- Categorias diagnósticas (F03): 'lesão do manguito rotador' ----------------

create table categorias (
  id uuid primary key default gen_random_uuid(),
  regiao_id uuid not null references regioes(id) on delete restrict,
  slug text not null unique,
  nome text not null,
  nome_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on categorias (regiao_id);
create trigger categorias_updated_at before update on categorias
  for each row execute function set_updated_at();

-- Testes (S06) ------------------------------------------------------------

create table testes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- 'teste-de-neer', estável para links
  regiao_id uuid not null references regioes(id) on delete restrict,
  nome text not null,                        -- 'Teste de Neer'
  nome_en text not null default '',          -- "Neer's test"
  sinonimos text[] not null default '{}',    -- grafias e epônimos para a busca
  posicao_paciente text not null default '',
  execucao text not null default '',
  resultado_positivo text not null default '',
  observacoes text not null default '',
  status text not null default 'rascunho'
    check (status in ('rascunho', 'revisao', 'publicado', 'arquivado')),
  publicado_em timestamptz,
  autor_id uuid references perfis(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publicado_tem_data check (status <> 'publicado' or publicado_em is not null),
  constraint publicado_tem_texto check (
    status <> 'publicado' or (length(execucao) > 0 and length(resultado_positivo) > 0)
  )
);
create index on testes (regiao_id, status);
create index on testes (status, updated_at);
create index on testes (autor_id);
-- busca no painel (o app busca localmente, no aparelho)
create index testes_nome_trgm on testes using gin (nome gin_trgm_ops);
create trigger testes_updated_at before update on testes
  for each row execute function set_updated_at();

create table teste_categorias (
  teste_id uuid not null references testes(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  primary key (teste_id, categoria_id)
);
create index on teste_categorias (categoria_id);

-- Referências (S09) --------------------------------------------------------

create table referencias (
  id uuid primary key default gen_random_uuid(),
  citacao text not null,                     -- Vancouver
  pmid text unique,
  doi text unique,
  ano int check (ano between 1900 and 2100),
  url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger referencias_updated_at before update on referencias
  for each row execute function set_updated_at();

-- Propriedades diagnósticas (S08) -------------------------------------------
-- Uma linha por estudo e condição-alvo. Os números vêm dos artigos
-- originais, cada um com a sua referência. Proporções guardadas de 0 a 1.

create table propriedades (
  id uuid primary key default gen_random_uuid(),
  teste_id uuid not null references testes(id) on delete cascade,
  referencia_id uuid not null references referencias(id) on delete restrict,
  condicao_alvo text not null,               -- 'síndrome do impacto subacromial'
  padrao_ouro text not null default '',      -- 'artroscopia', 'RM'
  populacao text not null default '',
  n int check (n > 0),
  sensibilidade numeric(4,3) check (sensibilidade between 0 and 1),
  sens_ic_inf numeric(4,3) check (sens_ic_inf between 0 and 1),
  sens_ic_sup numeric(4,3) check (sens_ic_sup between 0 and 1),
  especificidade numeric(4,3) check (especificidade between 0 and 1),
  esp_ic_inf numeric(4,3) check (esp_ic_inf between 0 and 1),
  esp_ic_sup numeric(4,3) check (esp_ic_sup between 0 and 1),
  lr_positiva numeric(6,2) check (lr_positiva >= 0),
  lr_negativa numeric(6,2) check (lr_negativa >= 0),
  confiabilidade numeric(4,3) check (confiabilidade between -1 and 1),
  confiabilidade_tipo text check (confiabilidade_tipo in ('kappa', 'icc')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sens_ic_ordem check (sens_ic_inf is null or sens_ic_sup is null or sens_ic_inf <= sens_ic_sup),
  constraint esp_ic_ordem check (esp_ic_inf is null or esp_ic_sup is null or esp_ic_inf <= esp_ic_sup),
  constraint confiab_com_tipo check ((confiabilidade is null) = (confiabilidade_tipo is null)),
  constraint tem_algum_dado check (
    coalesce(sensibilidade, especificidade, lr_positiva, lr_negativa, confiabilidade) is not null
  )
);
create index on propriedades (teste_id);
create index on propriedades (referencia_id);
create trigger propriedades_updated_at before update on propriedades
  for each row execute function set_updated_at();

-- Vídeos (S07) -------------------------------------------------------------
-- O arquivo fica no Supabase Storage (bucket 'videos'); aqui só o caminho.

create table videos (
  id uuid primary key default gen_random_uuid(),
  teste_id uuid not null unique references testes(id) on delete cascade,
  caminho text not null,                     -- 'ombro/teste-de-neer-v2.mp4'
  poster text not null default '',
  duracao_s int not null check (duracao_s > 0),
  tamanho_bytes bigint not null check (tamanho_bytes > 0),
  tem_audio boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger videos_updated_at before update on videos
  for each row execute function set_updated_at();

-- Pacotes de conteúdo publicados (offline) --------------------------------
-- Ao publicar, o painel gera um JSON com todo o conteúdo publicado e grava
-- no Storage. O app baixa só quando a versão muda.

create table pacotes (
  id uuid primary key default gen_random_uuid(),
  versao int not null unique check (versao > 0),
  caminho text not null,                     -- 'pacotes/v12.json'
  sha256 text not null,
  total_testes int not null check (total_testes >= 0),
  publicado_por uuid references perfis(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on pacotes (publicado_por);

-- Favoritos (S10) -----------------------------------------------------------
-- Sem conta, ficam só no aparelho. Com conta, sincronizam aqui.

create table favoritos (
  user_id uuid not null references perfis(id) on delete cascade,
  teste_id uuid not null references testes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, teste_id)
);
create index on favoritos (teste_id);

-- Novo usuário -> perfil 'clinico' -----------------------------------------

create or replace function criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfis (id, nome) values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end $$;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function criar_perfil();

-- RLS ---------------------------------------------------------------------

alter table perfis enable row level security;
alter table regioes enable row level security;
alter table categorias enable row level security;
alter table testes enable row level security;
alter table teste_categorias enable row level security;
alter table referencias enable row level security;
alter table propriedades enable row level security;
alter table videos enable row level security;
alter table pacotes enable row level security;
alter table favoritos enable row level security;

-- perfis: cada um lê o seu; editores leem todos. O papel só muda pelo SQL do admin.
create policy perfis_ler on perfis for select using (id = auth.uid() or eh_editor());
create policy perfis_editar_nome on perfis for update
  using (id = auth.uid())
  with check (id = auth.uid() and papel = (select p.papel from perfis p where p.id = auth.uid()));

-- conteúdo estrutural: leitura pública, escrita de editores
create policy regioes_ler on regioes for select using (true);
create policy regioes_escrever on regioes for all using (eh_editor()) with check (eh_editor());
create policy categorias_ler on categorias for select using (true);
create policy categorias_escrever on categorias for all using (eh_editor()) with check (eh_editor());
create policy referencias_ler on referencias for select using (true);
create policy referencias_escrever on referencias for all using (eh_editor()) with check (eh_editor());
create policy pacotes_ler on pacotes for select using (true);
create policy pacotes_escrever on pacotes for insert with check (eh_editor());

-- testes e o que pende deles: público vê só o publicado
create policy testes_ler on testes for select using (status = 'publicado' or eh_editor());
create policy testes_escrever on testes for all using (eh_editor()) with check (eh_editor());

create policy tc_ler on teste_categorias for select using (
  eh_editor() or exists (select 1 from testes t where t.id = teste_id and t.status = 'publicado'));
create policy tc_escrever on teste_categorias for all using (eh_editor()) with check (eh_editor());

create policy propriedades_ler on propriedades for select using (
  eh_editor() or exists (select 1 from testes t where t.id = teste_id and t.status = 'publicado'));
create policy propriedades_escrever on propriedades for all using (eh_editor()) with check (eh_editor());

create policy videos_ler on videos for select using (
  eh_editor() or exists (select 1 from testes t where t.id = teste_id and t.status = 'publicado'));
create policy videos_escrever on videos for all using (eh_editor()) with check (eh_editor());

-- favoritos: só os próprios
create policy favoritos_dono on favoritos for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

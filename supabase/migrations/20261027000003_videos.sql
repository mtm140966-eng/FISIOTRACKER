-- Bucket dos vídeos: leitura pública (o app baixa sem login), escrita só de editores.
-- Limites no próprio bucket: 50 MB por arquivo, só mp4.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy videos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.eh_editor());
create policy videos_trocar on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.eh_editor())
  with check (bucket_id = 'videos' and public.eh_editor());
create policy videos_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.eh_editor());


CREATE POLICY "bukti_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'bukti' AND public.is_staff());
CREATE POLICY "bukti_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bukti' AND public.is_staff());
CREATE POLICY "bukti_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'bukti' AND public.is_staff()) WITH CHECK (bucket_id = 'bukti' AND public.is_staff());
CREATE POLICY "bukti_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'bukti' AND public.is_admin());

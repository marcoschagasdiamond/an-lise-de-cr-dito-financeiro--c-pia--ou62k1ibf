ALTER TABLE public.administradores ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.administradores ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

DO $$
BEGIN
  UPDATE public.administradores a
  SET email = u.email,
      status = COALESCE(u.status, 'ativo')
  FROM public.usuarios u
  WHERE a.usuario_id = u.id AND a.email IS NULL;
END $$;

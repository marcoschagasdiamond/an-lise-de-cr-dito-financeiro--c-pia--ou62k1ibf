DO $DO$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Ensure the pgcrypto extension is created
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- 2. Seed or update GoTrue auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'marcoschagasdiamond@icloud.com',
      crypt('Mac318180', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcos Chagas", "tipo_usuario": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com';
    UPDATE auth.users
    SET encrypted_password = crypt('Mac318180', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Marcos Chagas", "tipo_usuario": "admin"}'
    WHERE id = v_user_id;
  END IF;

  -- 3. Ensure they exist in public.usuarios and update to admin
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com') THEN
    UPDATE public.usuarios
    SET 
      senha_hash = crypt('Mac318180', gen_salt('bf')),
      tipo_usuario = 'admin',
      status = 'ativo'
    WHERE email = 'marcoschagasdiamond@icloud.com';
  ELSE
    INSERT INTO public.usuarios (id, email, senha_hash, nome, tipo_usuario, status)
    VALUES (v_user_id, 'marcoschagasdiamond@icloud.com', crypt('Mac318180', gen_salt('bf')), 'Marcos Chagas', 'admin', 'ativo');
  END IF;

  -- Update plain text password in public.usuario if it exists there (legacy table fallback)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuario') THEN
    IF EXISTS (SELECT 1 FROM public.usuario WHERE email = 'marcoschagasdiamond@icloud.com') THEN
      UPDATE public.usuario
      SET senha = 'Mac318180',
          tipo_usuario = 'admin'
      WHERE email = 'marcoschagasdiamond@icloud.com';
    END IF;
  END IF;

  -- 4. Ensure admin privileges in public.administradores
  IF NOT EXISTS (SELECT 1 FROM public.administradores WHERE usuario_id = v_user_id) THEN
    INSERT INTO public.administradores (id, usuario_id, nome, permissoes, status, email)
    VALUES (gen_random_uuid(), v_user_id, 'Marcos Chagas', '{"todas": true}'::jsonb, 'ativo', 'marcoschagasdiamond@icloud.com');
  ELSE
    UPDATE public.administradores
    SET status = 'ativo',
        permissoes = '{"todas": true}'::jsonb
    WHERE usuario_id = v_user_id;
  END IF;

END $DO$;

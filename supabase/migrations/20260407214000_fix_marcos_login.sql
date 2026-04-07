DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed GoTrue auth.users
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
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcos Chagas", "tipo_usuario": "parceiro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com';
    UPDATE auth.users
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Marcos Chagas", "tipo_usuario": "parceiro"}'
    WHERE id = v_user_id;
  END IF;

  -- Ensure they exist in public.usuarios and update to parceiro
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com') THEN
    UPDATE public.usuarios
    SET 
      senha_hash = '123456',
      tipo_usuario = 'parceiro',
      status = 'ativo'
    WHERE email = 'marcoschagasdiamond@icloud.com';
  ELSE
    INSERT INTO public.usuarios (id, email, senha_hash, nome, tipo_usuario, status)
    VALUES (v_user_id, 'marcoschagasdiamond@icloud.com', '123456', 'Marcos Chagas', 'parceiro', 'ativo');
  END IF;

  -- Link as parceiro in public.parceiros
  IF NOT EXISTS (SELECT 1 FROM public.parceiros p JOIN public.usuarios u ON p.usuario_id = u.id WHERE u.email = 'marcoschagasdiamond@icloud.com') THEN
    INSERT INTO public.parceiros (id, usuario_id, nome_parceiro, status, comissao_percentual)
    SELECT gen_random_uuid(), id, nome, 'ativo', 10 
    FROM public.usuarios 
    WHERE email = 'marcoschagasdiamond@icloud.com'
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

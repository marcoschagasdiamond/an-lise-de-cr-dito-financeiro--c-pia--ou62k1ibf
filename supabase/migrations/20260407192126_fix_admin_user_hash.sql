DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if the user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com';

  IF v_user_id IS NULL THEN
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
    -- Update existing auth user password to ensure it matches
    UPDATE auth.users 
    SET encrypted_password = crypt('Mac318180', gen_salt('bf'))
    WHERE id = v_user_id;
  END IF;

  -- Ensure the user exists in public.usuarios with the required fields and hash
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com') THEN
    INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status, senha_hash)
    VALUES (
      v_user_id, 
      'marcoschagasdiamond@icloud.com', 
      'Marcos Chagas', 
      'admin', 
      'ativo', 
      crypt('Mac318180', gen_salt('bf'))
    );
  ELSE
    -- Update public.usuarios as requested
    UPDATE public.usuarios 
    SET 
      senha_hash = crypt('Mac318180', gen_salt('bf')),
      tipo_usuario = 'admin',
      status = 'ativo'
    WHERE email = 'marcoschagasdiamond@icloud.com';
  END IF;

  -- Ensure the user exists in public.administradores with full permissions
  IF NOT EXISTS (SELECT 1 FROM public.administradores WHERE usuario_id = (SELECT id FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com')) THEN
    INSERT INTO public.administradores (usuario_id, nome, permissoes)
    VALUES (
      (SELECT id FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com'), 
      'Marcos Chagas', 
      '{"todas": true}'::jsonb
    );
  END IF;

END $$;

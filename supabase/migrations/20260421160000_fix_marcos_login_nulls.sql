DO $DO$
DECLARE
  v_user_id uuid;
  v_existing_public_id uuid;
BEGIN
  -- 1. Fix ALL null tokens in auth.users that cause GoTrue to crash (HTTP 500)
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- 2. Setup Marcos perfectly
  SELECT id INTO v_existing_public_id FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com' LIMIT 1;
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    IF v_existing_public_id IS NOT NULL THEN
      v_user_id := v_existing_public_id;
    ELSE
      v_user_id := gen_random_uuid();
    END IF;

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
    UPDATE auth.users
    SET encrypted_password = crypt('Mac318180', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_user_meta_data = '{"name": "Marcos Chagas", "tipo_usuario": "admin"}',
        raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
        role = 'authenticated',
        aud = 'authenticated',
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        phone_change = COALESCE(phone_change, ''),
        phone_change_token = COALESCE(phone_change_token, ''),
        reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = v_user_id;
  END IF;

  -- 3. Setup in public.usuarios
  INSERT INTO public.usuarios (id, email, senha_hash, nome, tipo_usuario, status)
  VALUES (v_user_id, 'marcoschagasdiamond@icloud.com', crypt('Mac318180', gen_salt('bf')), 'Marcos Chagas', 'admin', 'ativo')
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    senha_hash = EXCLUDED.senha_hash,
    tipo_usuario = 'admin',
    status = 'ativo';

  -- 4. Setup in administradores
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

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Update auth.users
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
      raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{tipo_usuario}', '"admin"')
    WHERE id = v_user_id;

    -- Update public.usuarios
    UPDATE public.usuarios
    SET tipo_usuario = 'admin', status = 'ativo', senha_hash = 'Skip@Pass'
    WHERE id = v_user_id;

    -- Ensure in public.administradores
    IF NOT EXISTS (SELECT 1 FROM public.administradores WHERE usuario_id = v_user_id) THEN
      INSERT INTO public.administradores (id, usuario_id, nome, permissoes)
      VALUES (gen_random_uuid(), v_user_id, 'Marcos Chagas', '{"todas": true}'::jsonb);
    END IF;
  ELSE
    -- Fallback: create user if they don't exist
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcos Chagas", "tipo_usuario": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, senha_hash, nome, tipo_usuario, status)
    VALUES (v_user_id, 'marcoschagasdiamond@icloud.com', 'Skip@Pass', 'Marcos Chagas', 'admin', 'ativo')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO public.administradores (id, usuario_id, nome, permissoes)
    VALUES (gen_random_uuid(), v_user_id, 'Marcos Chagas', '{"todas": true}'::jsonb);
  END IF;
END $$;

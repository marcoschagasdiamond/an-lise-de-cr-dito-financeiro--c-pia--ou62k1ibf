DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- We need to find or create marcoschagasdiamond@icloud.com in auth.users
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com';
  
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'marcoschagasdiamond@icloud.com',
      crypt('Mac318180', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Marcos Chagas", "tipo_usuario": "admin", "status": "ativo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure public.usuarios exists
  INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status)
  VALUES (new_user_id, 'marcoschagasdiamond@icloud.com', 'Marcos Chagas', 'admin', 'ativo')
  ON CONFLICT (id) DO UPDATE SET
    tipo_usuario = 'admin',
    status = 'ativo',
    nome = 'Marcos Chagas';

  -- Ensure public.administradores exists for this specific ID
  IF NOT EXISTS (SELECT 1 FROM public.administradores WHERE usuario_id = new_user_id) THEN
     INSERT INTO public.administradores (usuario_id, nome, email, permissoes)
     VALUES (new_user_id, 'Marcos Chagas', 'marcoschagasdiamond@icloud.com', '{"todas": true}'::jsonb);
  ELSE
     UPDATE public.administradores 
     SET permissoes = '{"todas": true}'::jsonb, 
         email = 'marcoschagasdiamond@icloud.com' 
     WHERE usuario_id = new_user_id;
  END IF;

  -- Cleanup any old administradores entries that might have been disconnected
  DELETE FROM public.administradores 
  WHERE email = 'marcoschagasdiamond@icloud.com' AND usuario_id != new_user_id;

END $$;

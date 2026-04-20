-- Esta migration garante que a conta do administrador principal esteja perfeitamente sincronizada
-- com o auth.users, permitindo que a autenticação nativa do Supabase funcione perfeitamente.
DO $$
DECLARE
  v_admin record;
  new_user_id uuid;
BEGIN
  -- 1. Garante que o administrador exista no auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com') THEN
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
      '{"name": "Marcos Chagas", "tipo_usuario": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
    
    INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status)
    VALUES (new_user_id, 'marcoschagasdiamond@icloud.com', 'Marcos Chagas', 'admin', 'ativo')
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO public.administradores (usuario_id, nome, permissoes)
    VALUES (new_user_id, 'Marcos Chagas', '{"todas": true}')
    ON CONFLICT DO NOTHING;
  ELSE
    -- Se o admin já existe, atualiza a senha de fallback para garantir acesso
    UPDATE auth.users 
    SET encrypted_password = crypt('Mac318180', gen_salt('bf'))
    WHERE email = 'marcoschagasdiamond@icloud.com';
  END IF;

  -- 2. Sincroniza eventuais IDs da tabela usuarios que ficaram fora do auth.users
  FOR v_admin IN SELECT * FROM public.usuarios WHERE email = 'marcoschagasdiamond@icloud.com' LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin.id) THEN
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current,
        phone, phone_change, phone_change_token, reauthentication_token
      ) VALUES (
        v_admin.id,
        '00000000-0000-0000-0000-000000000000',
        v_admin.email,
        crypt('Mac318180', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('name', v_admin.nome, 'tipo_usuario', v_admin.tipo_usuario),
        false, 'authenticated', 'authenticated',
        '', '', '', '', '',
        NULL,
        '', '', ''
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

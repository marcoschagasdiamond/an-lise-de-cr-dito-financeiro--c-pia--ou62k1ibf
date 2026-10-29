CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Obter ou criar o usuário master no auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = 'marcoschagasdiamond@icloud.com' LIMIT 1;

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
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"nome": "Marcos Chagas", "tipo_usuario": "admin", "status": "ativo", "email_verified": true}'::jsonb,
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('Mac318180', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = '{"nome": "Marcos Chagas", "tipo_usuario": "admin", "status": "ativo", "email_verified": true}'::jsonb,
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

  -- 2. Garantir consistência na tabela public.usuarios
  INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status, senha_hash)
  VALUES (v_user_id, 'marcoschagasdiamond@icloud.com', 'Marcos Chagas', 'admin', 'ativo', 'Mac318180')
  ON CONFLICT (id) DO UPDATE SET
    email = 'marcoschagasdiamond@icloud.com',
    nome = 'Marcos Chagas',
    tipo_usuario = 'admin',
    status = 'ativo',
    senha_hash = 'Mac318180';

  -- 3. Garantir consistência na tabela public.administradores
  DELETE FROM public.administradores
  WHERE LOWER(email) = 'marcoschagasdiamond@icloud.com' AND usuario_id != v_user_id;

  IF NOT EXISTS (SELECT 1 FROM public.administradores WHERE usuario_id = v_user_id) THEN
    INSERT INTO public.administradores (usuario_id, nome, email, permissoes, status)
    VALUES (v_user_id, 'Marcos Chagas', 'marcoschagasdiamond@icloud.com', '{"todas": true}'::jsonb, 'ativo');
  ELSE
    UPDATE public.administradores
    SET
      nome = 'Marcos Chagas',
      email = 'marcoschagasdiamond@icloud.com',
      permissoes = '{"todas": true}'::jsonb,
      status = 'ativo'
    WHERE usuario_id = v_user_id;
  END IF;

  -- 4. Garantir permissões de administrador se tabela permissoes_admin existir
  IF NOT EXISTS (SELECT 1 FROM public.permissoes_admin WHERE usuario_id = v_user_id) THEN
    INSERT INTO public.permissoes_admin (usuario_id, pode_aprovar_parceiros, pode_gerenciar_clientes, pode_gerenciar_admins)
    VALUES (v_user_id, true, true, true);
  ELSE
    UPDATE public.permissoes_admin
    SET
      pode_aprovar_parceiros = true,
      pode_gerenciar_clientes = true,
      pode_gerenciar_admins = true
    WHERE usuario_id = v_user_id;
  END IF;
END $$;

-- 5. Atualizar a RPC validar_login para ser case-insensitive no email e tolerante a espaços
CREATE OR REPLACE FUNCTION public.validar_login(p_email text, p_senha text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_usuario record;
  v_valido boolean := false;
  v_clean_email text;
  v_clean_senha text;
BEGIN
  v_clean_email := LOWER(TRIM(COALESCE(p_email, '')));
  v_clean_senha := TRIM(COALESCE(p_senha, ''));

  IF v_clean_email = '' OR v_clean_senha = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'E-mail ou senha incorretos');
  END IF;

  -- (1) Buscar o usuário na tabela usuarios pelo email fornecido (case-insensitive)
  SELECT * INTO v_usuario FROM public.usuarios WHERE LOWER(TRIM(email)) = v_clean_email LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'E-mail ou senha incorretos');
  END IF;

  -- (2) Comparar a senha fornecida com a senha_hash usando a função crypt ou texto plano
  BEGIN
    IF extensions.crypt(v_clean_senha, v_usuario.senha_hash) = v_usuario.senha_hash THEN
      v_valido := true;
    ELSIF v_usuario.senha_hash = v_clean_senha OR v_usuario.senha_hash = p_senha THEN
      v_valido := true;
    ELSIF extensions.crypt(p_senha, v_usuario.senha_hash) = v_usuario.senha_hash THEN
      v_valido := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF v_usuario.senha_hash = v_clean_senha OR v_usuario.senha_hash = p_senha THEN
      v_valido := true;
    END IF;
  END;

  IF v_valido THEN
    IF v_usuario.status IS NOT NULL AND v_usuario.status != 'ativo' AND v_usuario.status != 'aprovado' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Cadastro aguardando aprovação ou inativo');
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'usuario_id', v_usuario.id,
      'tipo_usuario', v_usuario.tipo_usuario,
      'usuario', jsonb_build_object(
        'id', v_usuario.id,
        'email', v_usuario.email,
        'nome', v_usuario.nome,
        'tipo_usuario', v_usuario.tipo_usuario,
        'status', v_usuario.status
      )
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'E-mail ou senha incorretos');
END;
$function$;

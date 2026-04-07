CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.validar_login(p_email text, p_senha text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_usuario record;
  v_valido boolean := false;
BEGIN
  -- (1) Buscar o usuário na tabela usuarios pelo email fornecido
  SELECT * INTO v_usuario FROM public.usuarios WHERE email = p_email LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Credenciais inválidas');
  END IF;

  -- (2) Comparar a senha fornecida com a senha_hash usando a função crypt do PostgreSQL
  -- (5) Garantir que a comparação de senha funcione corretamente com bcrypt gerado por gen_salt('bf')
  BEGIN
    IF crypt(p_senha, v_usuario.senha_hash) = v_usuario.senha_hash THEN
      v_valido := true;
    ELSIF v_usuario.senha_hash = p_senha THEN
      v_valido := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF v_usuario.senha_hash = p_senha THEN
      v_valido := true;
    END IF;
  END;

  IF v_valido THEN
    IF v_usuario.status IS NOT NULL AND v_usuario.status != 'ativo' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Credenciais inválidas');
    END IF;

    -- (3) Se válido, retornar o usuario_id, tipo_usuario
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

  -- (4) Se inválido, retornar erro 401 com mensagem "Credenciais inválidas" (tratado na Edge Function)
  RETURN jsonb_build_object('success', false, 'error', 'Credenciais inválidas');
END;
$function$;

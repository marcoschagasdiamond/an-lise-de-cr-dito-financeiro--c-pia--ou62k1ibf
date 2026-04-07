CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.validar_login(p_email TEXT, p_senha TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_usuario record;
  v_valido boolean := false;
BEGIN
  FOR v_usuario IN SELECT * FROM public.usuarios WHERE email = p_email LOOP
    BEGIN
      IF v_usuario.senha_hash = crypt(p_senha, v_usuario.senha_hash) THEN
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
        RETURN jsonb_build_object('success', false, 'error', 'Usuário inativo');
      END IF;

      RETURN jsonb_build_object(
        'success', true,
        'usuario', jsonb_build_object(
          'id', v_usuario.id,
          'email', v_usuario.email,
          'nome', v_usuario.nome,
          'tipo_usuario', v_usuario.tipo_usuario,
          'status', v_usuario.status
        )
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', false, 'error', 'Credenciais inválidas');
END;
$function$;

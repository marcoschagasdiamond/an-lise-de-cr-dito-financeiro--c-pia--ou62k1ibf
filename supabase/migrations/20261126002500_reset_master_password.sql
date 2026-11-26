-- Redefine a senha do usuário master marcoschagasdiamond@icloud.com
-- Usa crypt/gen_salt('bf') — o mesmo algoritmo de hash do Supabase Auth (GoTrue).
-- Mantém o usuário íntegro: e-mail confirmado, não banido, role authenticated.

UPDATE auth.users
SET encrypted_password = crypt('Mac318180', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    banned_until = NULL,
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    role = 'authenticated',
    aud = 'authenticated',
    updated_at = NOW()
WHERE email = 'marcoschagasdiamond@icloud.com';

-- Remove sessões/refresh tokens antigos para evitar conflito de credenciais em cache
DELETE FROM auth.refresh_tokens
WHERE user_id::text IN (SELECT id::text FROM auth.users WHERE email = 'marcoschagasdiamond@icloud.com');

-- Garante consistência do registro em public.usuarios (apenas se estiver divergente)
UPDATE public.usuarios
SET tipo_usuario = 'admin',
    status = 'ativo'
WHERE email = 'marcoschagasdiamond@icloud.com'
  AND (tipo_usuario IS DISTINCT FROM 'admin' OR status IS DISTINCT FROM 'ativo');

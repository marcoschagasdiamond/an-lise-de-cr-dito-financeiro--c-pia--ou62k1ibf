-- Ajusta a trigger que reflete os usuários do auth.users na tabela public.usuarios
-- Adiciona um fallback de exception para garantir que eventuais violações não impeçam a sincronização

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nome', 'Usuário'), 
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente'), 
    'ativo'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Ignora violações de chave única (como email já existente) mantendo o fluxo seguro
    RETURN NEW;
END;
$function$

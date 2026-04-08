import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroParceiro() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redireciona para a nova rota de parceria no Supabase, removendo a dependência antiga
    navigate('/solicitar-parceria', { replace: true })
  }, [navigate])

  return (
    <div className="container py-12 flex justify-center items-center min-h-[50vh]">
      <p className="text-muted-foreground animate-pulse">
        Redirecionando para o formulário de parceria...
      </p>
    </div>
  )
}

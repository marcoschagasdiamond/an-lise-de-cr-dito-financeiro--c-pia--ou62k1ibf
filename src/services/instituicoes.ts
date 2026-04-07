import pb from '@/lib/pocketbase/client'

export const getInstituicoesAtivas = () =>
  pb.collection('instituicoes_financeiras').getFullList({
    filter: 'ativa = true',
    sort: 'nome',
  })

import pb from '@/lib/pocketbase/client'

export const getEnviosPorProjeto = (projetoId: string) =>
  pb.collection('envios_instituicoes').getFullList({
    filter: `projeto_id = "${projetoId}"`,
    sort: '-data_envio',
    expand: 'instituicao_id',
  })

export const atualizarEnvio = (id: string, data: any) =>
  pb.collection('envios_instituicoes').update(id, data)

export const enviarParaInstituicao = (
  projetoId: string,
  instituicaoId: string,
  documentos: string[],
) =>
  pb.send(`/backend/v1/projetos/${projetoId}/enviar-instituicao`, {
    method: 'POST',
    body: JSON.stringify({ instituicao_id: instituicaoId, documentos_enviados: documentos }),
    headers: { 'Content-Type': 'application/json' },
  })

import { defineStore } from 'pinia'
import {
  AtualizarHorariosAtendiemento,
  AtualizarMensagemHorariosAtendiemento,
  MostrarHorariosAtendiemento
} from 'src/service/empresas'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

export const useHorarioAtendimentoStore = defineStore('horarioAtendimento', {
  state: () => ({
    businessHours: [],
    messageBusinessHours: null,
    loading: false
  }),
  actions: {
    async listarHorariosAtendimento () {
      this.loading = true
      try {
        const { data } = await MostrarHorariosAtendiemento()
        this.businessHours = data.businessHours
        this.messageBusinessHours = data.messageBusinessHours
      } catch (error) {
        notificarErro('Erro ao listar horários de atendimento', error)
      } finally {
        this.loading = false
      }
    },
    async atualizarHorariosAtendimento (horarios) {
      this.loading = true
      try {
        const { data } = await AtualizarHorariosAtendiemento(horarios)
        this.businessHours = data.businessHours
        notificarSucesso('Horários salvos com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao atualizar horários de atendimento', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async atualizarMensagemAusencia (mensagem) {
      this.loading = true
      try {
        const { data } = await AtualizarMensagemHorariosAtendiemento({
          messageBusinessHours: mensagem
        })
        this.messageBusinessHours = data.messageBusinessHours
        notificarSucesso('Mensagem de ausência salva!')
        return data
      } catch (error) {
        notificarErro('Erro ao atualizar mensagem de ausência', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

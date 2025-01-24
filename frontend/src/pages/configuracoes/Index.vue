<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item-label header class="text-bold text-h6 q-mb-lg">Configurações</q-item-label>

      <!-- Configuração: Não visualizar Tickets já atribuídos -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Não visualizar Tickets já atribuídos a outros usuários</q-item-label>
          <q-item-label caption>
            Somente o usuário responsável pelo ticket e/ou os administradores visualizarão o atendimento.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewAssignedTickets')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Não visualizar Tickets no ChatBot -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Não visualizar Tickets no ChatBot</q-item-label>
          <q-item-label caption>
            Somente administradores poderão visualizar tickets que estivem interagindo com o ChatBot.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsChatBot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewTicketsChatBot')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Forçar atendimento via Carteira -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Forçar atendimento via Carteira</q-item-label>
          <q-item-label caption>
            Caso o contato tenha carteira vinculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="DirectTicketsToWallets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('DirectTicketsToWallets')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Fluxo ativo para o Bot de atendimento -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Fluxo ativo para o Bot de atendimento</q-item-label>
          <q-item-label caption>Fluxo a ser utilizado pelo Bot para os novos atendimentos.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-select
            style="width: 300px"
            outlined
            dense
            rounded
            v-model="botTicketActive"
            :options="listaChatFlow"
            map-options
            emit-value
            option-value="id"
            option-label="name"
            @input="atualizarConfiguracao('botTicketActive')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Ignorar Mensagens de Grupo -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Ignorar Mensagens de Grupo</q-item-label>
          <q-item-label caption>
            Habilitando esta opção o sistema não abrirá ticket para grupos.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="ignoreGroupMsg"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('ignoreGroupMsg')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Recusar chamadas no WhatsApp -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Recusar chamadas no WhatsApp</q-item-label>
          <q-item-label caption>
            Quando ativo, as ligações de áudio e vídeo serão recusadas automaticamente.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="rejectCalls"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('rejectCalls')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Mensagem ao rejeitar ligação -->
      <div class="row q-px-md" v-if="rejectCalls === 'enabled'">
        <div class="col-12">
          <q-input
            rounded
            v-model="callRejectMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem ao rejeitar ligação:"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('callRejectMessage')"
          />
        </div>
      </div>

      <!-- Configuração: Fechamento Automático de Tickets -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Fechamento Automático de Tickets</q-item-label>
          <q-item-label caption>
            Defina o número de dias após os quais os tickets pendentes serão fechados automaticamente.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
            v-model="daysToClose"
            type="number"
            min="1"
            outlined
            dense
            label="Dias para fechar tickets"
            @input="atualizarConfiguracao('daysToClose')"
          />
        </q-item-section>
      </q-item>

      <!-- Configuração: Gerar novo ticket ou reabrir ticket -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Gerar novo ticket ou reabrir ticket</q-item-label>
          <q-item-label caption>Escolhe entre reabrir tickets ou iniciar novo ticket.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-select
            style="width: 300px"
            outlined
            dense
            rounded
            v-model="ticketAction"
            :options="[
              { label: 'Abrir Novo Ticket', value: 'new' },
              { label: 'Reabrir Ticket Existente', value: 'reopen' }
            ]"
            emit-value
            @input="atualizarConfiguracao('ticketAction')"
          />
        </q-item-section>
      </q-item>
       <!-- Configuração: Historico de tickets -->
       <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Manter histórico de mensagens</q-item-label>
          <q-item-label caption>
            Mantém o histórico de todas as mensagnes do contato.
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="manterHistorico"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="manterHistorico === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('manterHistorico')"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarConfiguracoes, AlterarConfiguracao } from 'src/service/configuracoes'

export default {
  name: 'IndexConfiguracoes',
  data () {
    return {
      userProfile: 'user',
      configuracoes: [],
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      rejectCalls: null,
      callRejectMessage: '',
      daysToClose: 3,
      ticketAction: 'new'
    }
  },
  methods: {
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach((el) => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
    },
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async atualizarConfiguracao (key, value = null) {
      const params = { key, value: value !== null ? value : this.$data[key] }
      try {
        await AlterarConfiguracao(params)
        this.$q.notify({ type: 'positive', message: 'Configuração alterada com sucesso!' })
      } catch (error) {
        console.error('Erro:', error)
      }
    }
  },
  async mounted () {
    this.userProfile = localStorage.getItem('profile')
    await this.listarConfiguracoes()
    await this.listarChatFlow()
  }
}
</script>

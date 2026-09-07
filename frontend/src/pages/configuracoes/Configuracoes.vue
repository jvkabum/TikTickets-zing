<template>
  <div v-if="userProfile === 'admin'" class="q-pa-md">
    <q-card class="glass-premium border-glass no-shadow rounded-all">
      <q-card-section>
        <q-list class="text-weight-medium">
          <q-item-label
            header
            class="text-bold text-h5 text-primary q-mb-md"
            >Configurações do Sistema</q-item-label
          >

          <q-item-label
            caption
            class="q-mt-lg q-pl-md text-weight-bold text-dark-theme"
            >Módulo: Atendimento</q-item-label
          >
          <q-separator spaced class="q-mx-md" />

          <q-item
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm rounded-all column justify-center"
          >
            <div class="row items-center full-width">
              <div class="col">
                <q-item-label class="text-dark-theme">Não visualizar Tickets já atribuidos à outros usuários</q-item-label>
                <q-item-label caption>Somente o usuário responsável pelo ticket e/ou os administradores visualizarão a atendimento.</q-item-label>
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="settings.NotViewAssignedTickets"
                  false-value="disabled"
                  true-value="enabled"
                  checked-icon="check"
                  keep-color
                  :color="settings.NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
                  size="md"
                  unchecked-icon="clear"
                  @update:model-value="v => atualizarConfiguracao('NotViewAssignedTickets', v)"
                />
              </div>
            </div>
          </q-item>

          <q-item
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm rounded-all column justify-center"
          >
            <div class="row items-center full-width">
              <div class="col">
                <q-item-label class="text-dark-theme">Não visualizar Tickets no ChatBot</q-item-label>
                <q-item-label caption>Somente administradores poderão visualizar tickets que estivem interagindo com o ChatBot.</q-item-label>
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="settings.NotViewTicketsChatBot"
                  false-value="disabled"
                  true-value="enabled"
                  checked-icon="check"
                  keep-color
                  :color="settings.NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
                  size="md"
                  unchecked-icon="clear"
                  @update:model-value="v => atualizarConfiguracao('NotViewTicketsChatBot', v)"
                />
              </div>
            </div>
          </q-item>

          <q-item
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm rounded-all column justify-center"
          >
            <div class="row items-center full-width">
              <div class="col">
                <q-item-label class="text-dark-theme">Forçar atendimento via Carteira</q-item-label>
                <q-item-label caption>Caso o contato tenha carteira vínculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.</q-item-label>
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="settings.DirectTicketsToWallets"
                  false-value="disabled"
                  true-value="enabled"
                  checked-icon="check"
                  keep-color
                  :color="settings.DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
                  size="md"
                  unchecked-icon="clear"
                  @update:model-value="v => atualizarConfiguracao('DirectTicketsToWallets', v)"
                />
              </div>
            </div>
          </q-item>

          <div
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm q-pa-md rounded-all column"
          >
            <div class="row items-center full-width q-mb-sm">
              <div class="col">
                <q-item-label class="text-dark-theme text-bold">Fluxo ativo para o Bot de atendimento</q-item-label>
                <q-item-label caption>Fluxo a ser utilizado pelo Bot para os novos atendimentos</q-item-label>
              </div>
            </div>
            <div class="row full-width">
              <q-select
                class="col-12"
                outlined
                dense
                rounded
                v-model="settings.botTicketActive"
                :options="listaChatFlow"
                map-options
                emit-value
                option-value="id"
                option-label="name"
                label="Selecione o fluxo"
                @update:model-value="v => atualizarConfiguracao('botTicketActive', v)"
              />
            </div>
          </div>

          <q-item
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm rounded-all column justify-center"
          >
            <div class="row items-center full-width">
              <div class="col">
                <q-item-label class="text-dark-theme">Ignorar Mensagens de Grupo</q-item-label>
                <q-item-label caption>Habilitando esta opção o sistema não abrirá ticket para grupos</q-item-label>
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="settings.ignoreGroupMsg"
                  false-value="disabled"
                  true-value="enabled"
                  checked-icon="check"
                  keep-color
                  :color="settings.ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
                  size="md"
                  unchecked-icon="clear"
                  @update:model-value="v => atualizarConfiguracao('ignoreGroupMsg', v)"
                />
              </div>
            </div>
          </q-item>

          <q-item
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm rounded-all column justify-center"
          >
            <div class="row items-center full-width">
              <div class="col">
                <q-item-label class="text-dark-theme">Recusar chamadas no Whatsapp</q-item-label>
                <q-item-label caption>Quando ativo, as ligações de aúdio e vídeo serão recusadas, automaticamente.</q-item-label>
              </div>
              <div class="col-auto">
                <q-toggle
                  v-model="settings.rejectCalls"
                  false-value="disabled"
                  true-value="enabled"
                  checked-icon="check"
                  keep-color
                  :color="settings.rejectCalls === 'enabled' ? 'green' : 'negative'"
                  size="md"
                  unchecked-icon="clear"
                  @update:model-value="v => atualizarConfiguracao('rejectCalls', v)"
                />
              </div>
            </div>
          </q-item>

          <div
            class="row q-px-md q-mb-md"
            v-if="settings.rejectCalls === 'enabled'"
          >
            <div class="col-12">
              <q-input
                rounded
                v-model="settings.callRejectMessage"
                type="textarea"
                autogrow
                dense
                outlined
                label="Mensagem ao rejeitar ligação:"
                input-style="min-height: 6vh; max-height: 9vh;"
                debounce="700"
                @update:model-value="v => atualizarConfiguracao('callRejectMessage', v)"
              />
            </div>
          </div>

          <div
            tag="label"
            v-ripple
            class="hover-premium q-mx-sm q-pa-md rounded-all column"
          >
            <div class="row items-center full-width q-mb-sm">
              <div class="col">
                <q-item-label class="text-dark-theme text-bold">Fechamento Automático de Tickets</q-item-label>
                <q-item-label caption>Defina o número de dias após os quais os tickets pendentes serão fechados automaticamente.</q-item-label>
              </div>
            </div>
            <div class="row full-width">
              <q-input
                class="col-12"
                v-model="settings.daysToClose"
                type="number"
                min="1"
                grow
                outlined
                dense
                rounded
                label="Dias para fechar tickets"
                @update:model-value="v => atualizarConfiguracao('daysToClose', v)"
              />
            </div>
          </div>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>

const configuracaoStore = useConfiguracaoStore()
const { settings } = storeToRefs(configuracaoStore)
const { listarConfiguracoes, atualizarConfiguracao } = configuracaoStore

const chatFlowStore = useChatFlowStore()
const { chatFlows } = storeToRefs(chatFlowStore)

const userProfile = ref('user')
const listaChatFlow = computed(() => chatFlows.value)

const listarChatFlow = async () => {
  await chatFlowStore.listarChatFlows()
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarConfiguracoes()
  listarChatFlow()
})
</script>

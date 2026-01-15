<template>
  <div class="q-px-md q-py-sm">
    <div class="row justify-between col q-mb-sm">
      <q-btn
        rounded
        color="primary"
        icon="mdi-plus"
        label="Nova Etapa"
        @click="addNode"
      />
      <q-btn
        rounded
        color="positive"
        icon="mdi-content-save-outline"
        label="Salvar"
        @click="$emit('saveFlow')"
      />
    </div>
    <q-card
      bordered
      flat
      class="fit"
    >
      <div class="ef-node-form-header">
        Configuração Fluxo
      </div>
      <div class="q-pa-sm">
        <q-input
          outlined
          rounded
          label="Nome"
          v-model="node.name"
          class="q-my-sm"
          :disable="['start', 'configurations'].includes(node.type)"
        />
        <q-separator inset="" />
      </div>
      <q-card-section
        class="q-pa-sm"
        v-if="node.type === 'node'"
      >
        <div>
          <q-tabs
            v-model="tabNodeForm"
            narrow-indicator
            class="text-grey-8 bg-grey-3 rounded-all"
          >
            <q-tab
              name="interacoes"
              label="Interações"
            />
            <q-tab
              name="condicoes"
              label="Condições"
            />

          </q-tabs>
          <q-tab-panels
            v-model="tabNodeForm"
            animated
            keep-alive
            infinite
            class="q-pa-none rounded-borders"
          >
            <q-tab-panel
              class="q-pa-none"
              name="interacoes"
            >
              <div class="text-center ">
                <div class="row q-mt-sm col justify-center">
                  <q-btn
                    flat
                    icon="mdi-message-text-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addMessage"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar Mensagem
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="addMediaField"
                    flat
                    icon="mdi-file-document-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar documentos, vídeo, aúdio e outros arquivos.
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="showPreview = true"
                    flat
                    icon="mdi-eye-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Visualizar interações
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="row bg-grey-3 q-pa-sm q-my-md justify-center scroll"
                  style="height: calc(100vh - 495px)"
                >
                  <div class="col-xs-12">
                    <div
                      v-for="(element, idx) in node.interactions"
                      :key="element.id"
                      v-bind="element"
                    >
                      <div class="q-my-md">
                        <div class="bg-white rounded-all full-width row col justify-between ">
                          <q-btn
                            round
                            dense
                            disable
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            :label="idx + 1"
                            style="z-index: 999; "
                          />
                          <q-space />
                          <q-btn
                            round
                            dense
                            icon="mdi-arrow-up-bold"
                            flat
                            color="positive"
                            class="bg-padrao q-mr-md"
                            style="z-index: 999"
                            :disable="idx === 0"
                            @click="changePosition(node.interactions, idx, idx - 1)"
                          >
                            <q-tooltip>
                              Reordenar
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            dense
                            icon="mdi-arrow-down-bold"
                            flat
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            class="bg-padrao q-mr-md"
                            style="z-index: 999"
                            @click="changePosition(node.interactions, idx, idx + 1)"
                          >
                            <q-tooltip>
                              Reordenar
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            dense
                            icon="mdi-close"
                            flat
                            color="negative"
                            class="bg-padrao"
                            style="z-index: 999;"
                            @click="removeItem(element, idx + 1)"
                          />
                        </div>
                        <component
                          :is="element.type"
                          :element="element"
                        >
                        </component>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botão de salvar interações -->
                <div class="row justify-end q-mt-md">
                  <q-btn
                    color="positive"
                    icon="mdi-content-save-outline"
                    label="Salvar Interações"
                    rounded
                    @click="saveInteractions"
                  />
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel
              class="q-pa-none"
              name="condicoes"
            >
              <div v-show="type === 'node'">
                <div class="row q-mt-md col justify-end">
                  <q-btn
                    flat
                    icon="mdi-vector-polyline-plus"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addCondiction"
                    label="Nova"
                    rounded
                  >
                    <q-tooltip content-class="text-bold">
                      Nova condição
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  style="height: calc(100vh - 490px)"
                  class="row bg-grey-3 q-pa-sm scroll q-mt-md col justify-start"
                >
                  <template v-for="(condition, idx) in node.conditions" :key="condition.id">
                    <q-card
                      bordered
                      flat
                      class="full-width q-my-sm"
                      style="min-height: 250px;"
                    >
                      <div class="full-width row col justify-between text-left q-pa-xs">
                        <q-btn
                          round
                          dense
                          disable
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          :label="idx + 1"
                        />
                        <q-space />
                        <q-btn
                          round
                          dense
                          icon="mdi-arrow-up-bold"
                          flat
                          color="positive"
                          class="bg-padrao q-mr-md"
                          style="z-index: 999"
                          :disable="idx === 0"
                          @click="changePosition(node.conditions, idx, idx - 1)"
                        >
                          <q-tooltip>
                            Reordenar: Aumentar prioridade da regra de condição
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          round
                          dense
                          icon="mdi-arrow-down-bold"
                          flat
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          class="bg-padrao q-mr-md"
                          style="z-index: 999"
                          @click="changePosition(node.conditions, idx, idx + 1)"
                        >
                          <q-tooltip>
                            Reordenar: Diminuir prioridade da regra de condição
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          round
                          dense
                          icon="mdi-close"
                          flat
                          color="negative"
                          class="bg-padrao"
                          style="z-index: 999"
                          @click="removeConditionItem(condition, idx)"
                        />
                      </div>
                      <q-card-section class="q-pa-sm q-gutter-sm">
                        <q-select
                          outlined
                          dense
                          rounded
                          v-model="condition.type"
                          :options="optionsSe"
                          label="Se"
                          map-options
                          emit-value
                        />
                        <q-select
                          v-if="condition.type === 'R'"
                          dense
                          rounded
                          label="Respostas"
                          outlined
                          v-model="condition.condition"
                          use-input
                          use-chips
                          multiple
                          hide-dropdown-icon
                          input-debounce="0"
                          new-value-mode="add-unique"
                          hint="Digite o valor e aperte enter"
                        />
                      </q-card-section>
                      <q-separator
                        inset
                        spaced
                      />
                      <q-card-section>
                        <div class="text-bold q-px-sm"> Rotear para: </div>
                        <q-option-group
                          class="text-center"
                          inline
                          v-model="condition.action"
                          :options="optionsAcao"
                          color="primary"
                        />
                        <div class="row q-mt-sm">
                          <div class="col">
                            <q-select
                              v-if="condition.action === 0"
                              dense
                              outlined
                              rounded
                              class="full-width"
                              :value="condition.nextNode || condition.nextStepId || ''"
                              :options="nodesList.nodeList.filter(n => n.type !== 'configurations')"
                              option-label="name"
                              option-value="id"
                              label="Etapa"
                              map-options
                              emit-value
                              clearable
                              @input="nextNode => addLineStep(nextNode, idx)"
                            />

                            <q-select
                              v-if="condition.action === 1"
                              dense
                              outlined
                              rounded
                              class="full-width"
                              v-model="condition.queueId"
                              :options="filas"
                              option-label="queue"
                              option-value="id"
                              label="Fila"
                              :key="condition.queueId"
                              map-options
                              emit-value
                              clearable
                              @input="condition.nextNode = null; condition.userIdDestination = null"
                            />

                            <q-select
                              v-if="condition.action === 2"
                              dense
                              outlined
                              rounded
                              class="full-width"
                              v-model="condition.userIdDestination"
                              :options="usuarios"
                              option-label="name"
                              option-value="id"
                              label="Usuário"
                              map-options
                              emit-value
                              clearable
                              @input="condition.nextNode = null; condition.queueId = null"
                            />

                            <!-- Campo para editar a chave da conexão -->
                            <q-input
                              v-if="condition.action === 0 && (condition.nextNode || condition.nextStepId)"
                              dense
                              outlined
                              rounded
                              class="full-width q-mt-sm"
                              label="Chave da conexão"
                              v-model="condition.description"
                              placeholder="Texto exibido na linha de conexão"
                              @input="updateLineLabel(idx)"
                            >
                              <template v-slot:append>
                                <q-icon name="mdi-label-outline" />
                                <q-tooltip>O texto que aparece na linha de conexão</q-tooltip>
                              </template>
                            </q-input>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </template>

                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <div
            class="q-pa-sm q-gutter-md"
            v-show="type === 'line'"
          >
            <div class="text-h6 q-mb-md text-primary">Editar Chave da Conexão</div>
            <q-input
              outlined
              label="Chave"
              v-model="line.label"
              class="q-mb-md"
              placeholder="Digite a chave da conexão"
              autofocus
              @keyup.enter="saveLine"
              @input="updateLineLabelRealtime"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-label-outline" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="mdi-pencil" />
                <q-tooltip>Digite o texto a ser exibido na linha de conexão</q-tooltip>
              </template>
              <template v-slot:hint>
                Este texto será exibido na linha de conexão entre os nós
              </template>
            </q-input>
            <div class="connection-preview q-mb-md" v-if="line.from && line.to">
              <div class="preview-title q-mb-sm">Prévia da conexão:</div>
              <div class="preview-connection">
                <div class="preview-node">{{ getSourceNodeName() }}</div>
                <div class="preview-arrow">
                  <div class="preview-label" :class="{ 'empty-label': !line.label }">
                    {{ line.label || 'Sem chave definida' }}
                  </div>
                  <q-icon name="mdi-arrow-right" size="24px" color="primary" />
                </div>
                <div class="preview-node">{{ getTargetNodeName() }}</div>
              </div>
            </div>
            <div class="row justify-between">
              <q-btn
                outline
                color="grey"
                icon="mdi-close"
                @click="line.label = ''"
                label="Limpar"
              />
              <div>
                <q-btn
                  outline
                  color="negative"
                  icon="mdi-cancel"
                  @click="type = 'node'"
                  label="Cancelar"
                  class="q-mr-sm"
                />
                <q-btn
                  color="primary"
                  icon="mdi-content-save"
                  @click="saveLine"
                  label="Salvar"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section
        style="height: calc(100vh - 380px)"
        class="row bg-grey-3 q-pa-sm scroll col justify-start"
        v-if="node.type === 'configurations'"
      >
        <q-card
          class="full-width q-my-sm"
          style="height: 280px;"
        >
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Mensagem de saudação (Fila/Usuário)
            <div class="row text-subtitle2">
              Quando o bot direcionar o atendimento para uma fila ou usuário,
              essa mensagem será enviada.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label
                  class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"
                > Mensagem: </label>
                <div class="flex flex-inline full-width items-center">
                  <div
                    class="flex flex-inline text-left"
                    style="width: 40px"
                  >
                    <q-btn
                      round
                      flat
                      dense
                    >
                      <q-icon
                        size="2em"
                        name="mdi-emoticon-happy-outline"
                      />
                      <q-tooltip>
                        Emoji
                      </q-tooltip>
                      <q-menu
                        anchor="top right"
                        self="bottom middle"
                        :offset="[5, 40]"
                      >
                        <EmojiPicker
                          style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          labelSearch="Localizar..."
                          lang="pt-BR"
                          @select="onInsertSelectEmojiSaudacao"
                        />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea
                    ref="inputEnvioMensagemSaudacao"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white rounded-all"
                    placeholder="Digite a mensagem"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.welcomeMessage.message = v.target.value"
                    :value="node.configurations.welcomeMessage.message"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 300px;"
        >
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Se nenhuma resposta esperada for enviada
            <div class="row text-subtitle2">
              Essa exceção será aplicada caso a resposta enviada pelo cliente não corresponda
              aos valores esperados conforme condições da etapa.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label
                  class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"
                > Mensagem de feedback: </label>
                <div class="flex flex-inline full-width items-center">
                  <div
                    class="flex flex-inline text-left"
                    style="width: 40px"
                  >
                    <q-btn
                      round
                      flat
                      dense
                    >
                      <q-icon
                        size="2em"
                        name="mdi-emoticon-happy-outline"
                      />
                      <q-tooltip>
                        Emoji
                      </q-tooltip>
                      <q-menu
                        anchor="top right"
                        self="bottom middle"
                        :offset="[5, 40]"
                      >
                        <EmojiPicker
                          style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          labelSearch="Localizar..."
                          lang="pt-BR"
                          @select="onInsertSelectEmojiNotOptionsSelectMessage"
                        />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea
                    ref="inputEnvioMensagemnotOptionsSelectMessage"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white rounded-all"
                    placeholder="Digite a mensagem"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.notOptionsSelectMessage.message = v.target.value"
                    :value="node.configurations.notOptionsSelectMessage.message"
                  />
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 290px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Ausência de resposta
            <div class="row text-subtitle2">
              Após o tempo determinado, se o cliente não responder,
              o bot realizará o encaminhamento para a Fila/Usuário informados.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input
                  dense
                  outlined
                  mask="###"
                  rounded
                  v-model.number="node.configurations.notResponseMessage.time"
                  label="Tempo (minutos)"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.notResponseMessage.type"
                  :options="[
                    { value: 1, label: 'Fila' },
                    { value: 2, label: 'Usuário' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  v-if="node.configurations.notResponseMessage.type === 1"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  label="Fila"
                  map-options
                  emit-value
                  clearable
                />
                <q-select
                  v-if="node.configurations.notResponseMessage.type === 2"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  label="Usuário"
                  map-options
                  emit-value
                  clearable
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Máximo de Tentativas do Bot
            <div class="row text-subtitle2">
              Uma vez excedido o número máximo de retentativas de pergunta/resposta,
              caso o cliente não envie uma respota válida, o bot irá realizar o encaminhamento
              para a Fila/Usuário configurados.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input
                  dense
                  rounded
                  outlined
                  mask="##"
                  v-model.number="node.configurations.maxRetryBotMessage.number"
                  label="Número de tentativas"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.maxRetryBotMessage.type"
                  :options="[
                    { value: 1, label: 'Fila' },
                    { value: 2, label: 'Usuário' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  v-if="node.configurations.maxRetryBotMessage.type === 1"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  label="Fila"
                  map-options
                  emit-value
                  clearable
                />
                <q-select
                  v-if="node.configurations.maxRetryBotMessage.type === 2"
                  dense
                  outlined
                  rounded
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  label="Usuário"
                  map-options
                  emit-value
                  clearable
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Auto Distribuir Atendimento
            <div class="row text-subtitle2">
              Não: Desativado. <br />
              Balancear: Definirá o usuário com base na quantidade de atendimentos de cada usuário da fila. Usuário com
              menos atendimentos será escolhido.<br />
              Aleatória: Definirá o usuário de forma aleatória/randômica para os usuários da fila.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group
                  class="text-center"
                  inline
                  v-model="node.configurations.autoDistributeTickets"
                  :options="[
                    { value: 'N', label: 'Não' },
                    { value: 'R', label: 'Aleatória' },
                    { value: 'B', label: 'Balanceada' }
                  ]"
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="full-width q-my-sm"
          style="height: 330px;"
        >
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            Encerrar Atendimento
            <div class="row text-subtitle2">
              Caso o cliente digite algumas das informações esperadas, o atendimento será encerrado.
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  dense
                  label="Parâmetros"
                  outlined
                  rounded
                  v-model="node.configurations.answerCloseTicket"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  hint="Digite o valor e aperte enter"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

      </q-card-section>

      <q-card-section
        style="height: calc(100vh - 380px)"
        class="row bg-grey-3 q-pa-sm scroll col justify-start"
        v-if="node.type === 'start'"
      >
        <q-card class="full-width q-my-sm">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            Etapa representa o contato inicial.
            <div class="row text-subtitle2">
              - Caso seja o primeiro contato do cliente, o sistema
              salvará automaticamente na agenda as informações do cliente.
            </div>
            <div class="row text-subtitle2">
              - O Bot irá interagir nos atendimentos iniciados pelos clientes.
            </div>
            <div class="row text-subtitle2">
              - O Bot irá parar de interagir caso o atendimento seja assumido por um usuário.
            </div>
          </div>
        </q-card>
      </q-card-section>

    </q-card>

    <!-- Modal de prévia das interações -->
    <q-dialog v-model="showPreview">
      <q-card style="width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Prévia das Interações</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="chat-preview">
            <template v-for="(interaction) in node.interactions">
              <!-- Mensagem de texto -->
              <div
                v-if="interaction.type === 'MessageField'"
                :key="interaction.id"
                class="chat-message"
              >
                <div class="message-content">
                  <div class="message-text">{{ interaction.data.message }}</div>
                  <div v-if="interaction.data.options && interaction.data.options.length > 0" class="message-options">
                    <q-chip
                      v-for="(option, optIdx) in interaction.data.options"
                      :key="optIdx"
                      dense
                      class="q-ma-xs"
                    >
                      {{ option }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <!-- Mídia -->
              <div
                v-if="interaction.type === 'MediaField'"
                :key="interaction.id"
                class="chat-message"
              >
                <div class="message-content">
                  <!-- Imagem -->
                  <q-img
                    v-if="interaction.data.type.indexOf('image') !== -1"
                    :src="interaction.data.mediaUrl"
                    style="max-height: 200px; border-radius: 8px;"
                    fit="contain"
                  />

                  <!-- Vídeo -->
                  <video
                    v-if="interaction.data.type.indexOf('video') !== -1"
                    :src="interaction.data.mediaUrl"
                    controls
                    style="width: 100%; max-height: 200px; border-radius: 8px;"
                  />

                  <!-- Áudio -->
                  <audio
                    v-if="interaction.data.type.indexOf('audio') !== -1"
                    :src="interaction.data.mediaUrl"
                    controls
                    class="full-width"
                  />

                  <!-- Outros arquivos -->
                  <div
                    v-if="!['image', 'video', 'audio'].some(type => interaction.data.type.indexOf(type) !== -1)"
                    class="file-preview"
                  >
                    <q-icon :name="getFileIcon(interaction.data.name)" size="48px" />
                    <div class="text-caption q-mt-sm">{{ interaction.data.name }}</div>
                  </div>

                  <!-- Legenda -->
                  <div v-if="interaction.data.caption" class="message-caption">
                    {{ interaction.data.caption }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { uid } from 'quasar'
import MessageField from './messageField.vue'
import MediaField from './mediaField.vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
export default {
  components: {
    MessageField,
    EmojiPicker,
    MediaField
  },
  props: {
    nodesList: {
      type: Object,
      default: () => { }
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      visible: true,
      tabNodeForm: 'interacoes',
      elements: [],
      showPreview: false,
      optionsAcao: [
        { value: 0, label: 'Etapa' },
        { value: 1, label: 'Fila' },
        { value: 2, label: 'Usuário' }
      ],
      optionsSe: [
        { label: 'Qualquer resposta', value: 'US' },
        { label: 'Respostas', value: 'R' }
      ],
      type: 'node',
      node: {},
      line: {},
      data: {},
      stateList: [{
        state: 'success',
        label: '成功'
      }, {
        state: 'warning',
        label: '警告'
      }, {
        state: 'error',
        label: '错误'
      }, {
        state: 'running',
        label: '运行中'
      }]
    }
  },
  methods: {
    gerarUID () {
      return uid()
    },
    addMessage () {
      const newMessage = {
        id: this.$uuid(),
        type: 'MessageField',
        data: {
          message: '',
          options: [],
          delay: 0
        }
      }
      if (!Array.isArray(this.node.interactions)) {
        this.node.interactions = []
      }
      this.node.interactions.push(newMessage)
    },
    addMediaField () {
      this.node.interactions.push({
        type: 'MediaField',
        data: {
          ext: '',
          mediaUrl: '',
          media: '',
          type: '',
          name: '',
          caption: '',
          supportedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'audio/mp3',
            'audio/ogg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          maxSize: 10485760 // 10MB em bytes
        },
        id: this.gerarUID()
      })
    },
    addCondiction () {
      this.node.conditions.push({
        type: 'R',
        condition: ['bot'],
        action: 0,
        id: this.gerarUID()
      })
    },
    changePosition (arr, from, to) {
      arr.splice(to, 0, arr.splice(from, 1)[0])
      return arr
    },
    addNode () {
      const nodeMenu = {
        id: this.gerarUID(),
        nodeId: this.gerarUID(),
        name: 'Nova etapa',
        type: 'node',
        left: '100px',
        top: '40px',
        interactions: [],
        conditions: [],
        actions: []
      }
      const evt = {
        originalEvent: {
          clientX: '100px',
          clientY: '10px'
        }
      }

      this.$emit('addNode', evt, nodeMenu, null)
    },
    removeConditionItem (condition, idx) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a condição (${idx + 1})?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        // Antes de remover a condição, verificar se existe uma conexão para remover
        const sourceId = this.node.id
        const targetId = condition.nextNode || condition.nextStepId

        // Remover a condição da lista
        const nConditions = this.node.conditions.filter(c => c.id !== condition.id)
        this.node.conditions = nConditions

        // Se tiver um nó de destino, emitir evento para remover a conexão visual
        if (targetId) {
          this.$emit('deleteLine', sourceId, targetId)
        }
      })
    },
    onInsertSelectEmojiSaudacao (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemSaudacao
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      if (!emoji.data) {
        return
      }
      self.txtContent = this.node.configurations.welcomeMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.welcomeMessage.message = self.txtContent
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiNotOptionsSelectMessage (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemnotOptionsSelectMessage
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      if (!emoji.data) {
        return
      }
      self.txtContent = this.node.configurations.notOptionsSelectMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.notOptionsSelectMessage.message = self.txtContent
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    addLineStep (nextNode, idx) {
      if (this.node.conditions[idx]?.queueId) {
        this.node.conditions[idx].queueId = null
      }
      if (this.node.conditions[idx]?.userIdDestination) {
        this.node.conditions[idx].userIdDestination = null
      }
      const oldToLine = this.node.conditions[idx].nextNode || this.node.conditions[idx].nextStepId

      // Definir tanto nextNode quanto nextStepId para garantir compatibilidade
      this.node.conditions[idx].nextNode = nextNode
      this.node.conditions[idx].nextStepId = nextNode

      if (oldToLine != nextNode) {
        this.$emit('addNewLineCondition', this.node.id, nextNode, oldToLine)
      }
    },
    removeItem (element, idx) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a interação (${idx})?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        const nInteractions = this.node.interactions.filter(i => i.id !== element.id)
        this.node.interactions = nInteractions
        this.$emit('repaintEverything')
      })
    },
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          this.node = node
        }
      })
    },
    lineInit (line) {
      // Sempre definir o tipo como 'line' quando estamos inicializando a edição de uma linha
      this.type = 'line'
      this.line = line

      // Garantir que o label seja inicializado corretamente
      this.$nextTick(() => {
        // Buscar a conexão atual para obter o label atualizado
        const connection = this.$parent.jsPlumb.getConnections({
          source: line.from,
          target: line.to
        })[0]

        if (connection) {
          // Atualizar o valor do label com o texto atual da conexão
          this.line.label = connection.getLabel() || ''
        } else if (!this.line.label) {
          this.line.label = ''
        }
      })
    },
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)

      // Notificar o usuário
      this.$q.notify({
        type: 'positive',
        message: 'Chave da conexão atualizada!',
        position: 'top',
        timeout: 1500
      })

      // Voltar para o modo node após salvar
      this.type = 'node'
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.state = this.node.state
          node.state = this.node.actions
          node.state = this.node.conditions
          node.state = this.node.interactions
          this.$emit('repaintEverything')
        }
      })
    },
    activateSection (section) {
      switch (section) {
        case 'messages':
        case 'flow':
          this.tabNodeForm = 'interacoes'
          if (section === 'messages') {
            this.$nextTick(() => this.addMessage())
          } else if (section === 'flow') {
            this.$nextTick(() => this.addMediaField())
          }
          break
        case 'conditions':
          this.tabNodeForm = 'condicoes'
          // Não adicionar condição automaticamente aqui, pois isso é feito
          // quando uma conexão é criada
          break
        case 'advanced':
          this.tabNodeForm = 'condicoes'
          break
        case 'interacoes':
          this.tabNodeForm = 'interacoes'
          break
        default:
          this.tabNodeForm = 'interacoes'
      }
    },
    updateLineLabel (idx) {
      // Obter a condição
      const condition = this.node.conditions[idx]
      if (!condition) return

      // Obter o nó de destino
      const targetNodeId = condition.nextNode || condition.nextStepId
      if (!targetNodeId) return

      // Emitir evento para atualizar a label na conexão
      this.$emit('setLineLabel', this.node.id, targetNodeId, condition.description)

      // Notificar o usuário
      this.$q.notify({
        type: 'positive',
        message: 'Chave da conexão atualizada!',
        position: 'top',
        timeout: 1500
      })
    },
    validateInteractions () {
      let isValid = true
      let errorMessage = ''

      for (let i = 0; i < this.node.interactions.length; i++) {
        const interaction = this.node.interactions[i]
        if (interaction.type === 'MessageField') {
          if (!interaction.data.message.trim()) {
            isValid = false
            errorMessage = `A mensagem ${i + 1} está vazia.`
            break
          }
          // Validar opções se existirem
          if (interaction.data.options && interaction.data.options.length > 0) {
            const emptyOptions = interaction.data.options.filter(opt => !opt.trim())
            if (emptyOptions.length > 0) {
              isValid = false
              errorMessage = `A mensagem ${i + 1} possui opções vazias.`
              break
            }
            // Validar se as opções são únicas
            const uniqueOptions = new Set(interaction.data.options)
            if (uniqueOptions.size !== interaction.data.options.length) {
              isValid = false
              errorMessage = `A mensagem ${i + 1} possui opções duplicadas.`
              break
            }
          }
        } else if (interaction.type === 'MediaField') {
          if (!interaction.data.mediaUrl) {
            isValid = false
            errorMessage = `O arquivo da mídia ${i + 1} não foi selecionado.`
            break
          }
        }
      }

      if (!isValid) {
        this.$q.notify({
          type: 'warning',
          message: errorMessage,
          position: 'top',
          timeout: 3000
        })
      }

      return isValid
    },
    saveInteractions () {
      // Tentar extrair opções automaticamente antes de validar
      this.extrairOpcoesAutomaticamente()

      if (this.validateInteractions()) {
        // Ordenar interações
        this.node.interactions = this.node.interactions.map((interaction, index) => {
          if (interaction.type === 'MessageField') {
            // Remover opções vazias
            if (interaction.data.options) {
              interaction.data.options = interaction.data.options.filter(opt => opt.trim())

              // Garantir que a mensagem não tenha as opções duplicadas
              // Extrair a parte principal da mensagem sem as opções
              let message = interaction.data.message || ''

              // Remover qualquer lista de opções e texto de instruções existente
              const optionPatterns = [
                /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
                /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
              ]

              for (const pattern of optionPatterns) {
                message = message.replace(pattern, '')
              }

              // Limpar linhas em branco extras ao final
              message = message.replace(/\n+$/, '')

              // Adicionar uma quebra de linha se a mensagem não terminar com uma
              if (message && !message.endsWith('\n')) {
                message += '\n'
              }

              // Adicionar uma linha em branco antes das opções se houver mensagem
              if (message) {
                message += '\n'
              }

              // Adicionar as opções numeradas
              if (interaction.data.options.length > 0) {
                message += '*Opções disponíveis:*\n'
                interaction.data.options.forEach((option, index) => {
                  message += `${index + 1}️⃣ *${option}*\n`
                })
                message += '\n_Digite o número ou o texto da opção desejada_'
              }

              interaction.data.message = message
            }
          }
          return interaction
        })

        this.$emit('saveNode', this.node)
        this.$q.notify({
          type: 'positive',
          message: 'Interações salvas com sucesso!',
          position: 'top',
          timeout: 2000
        })
      }
    },
    getNodeName (nodeId) {
      const node = this.nodesList.nodeList.find(n => n.id === nodeId)
      return node ? node.name : 'Nó não encontrado'
    },
    extrairOpcoesAutomaticamente () {
      // Verifica se há interações do tipo MessageField
      if (!this.node.interactions || this.node.interactions.length === 0) return

      // Encontra a última mensagem que tenha texto
      const mensagensComTexto = this.node.interactions.filter(
        interaction => interaction.type === 'MessageField' && interaction.data.message
      )

      if (mensagensComTexto.length === 0) return

      // Pega a última mensagem (mais recente)
      const ultimaMensagem = mensagensComTexto[mensagensComTexto.length - 1]

      // Inicializa o array de opções se não existir
      if (!ultimaMensagem.data.options) {
        this.$set(ultimaMensagem.data, 'options', [])
      }

      // Conjunto para armazenar todas as opções (evita duplicatas)
      const todasOpcoes = new Set(ultimaMensagem.data.options || [])

      // Adiciona APENAS os nomes dos nós conectados como opções
      let adicionouNos = false
      if (this.node.conditions && this.node.conditions.length > 0) {
        // Buscar todos os nós conectados através das condições
        this.node.conditions.forEach(condition => {
          const targetNodeId = condition.nextNode || condition.nextStepId
          if (targetNodeId) {
            // Certifique-se de que estamos acessando o nodesList corretamente
            const targetNode = this.nodesList && this.nodesList.nodeList
              ? this.nodesList.nodeList.find(n => n.id === targetNodeId)
              : null

            if (targetNode && targetNode.name) {
              const opcaoNova = !todasOpcoes.has(targetNode.name)
              todasOpcoes.add(targetNode.name)
              if (opcaoNova) adicionouNos = true
            }
          }
        })
      }

      // Converte Set para Array
      const opcoesArray = [...todasOpcoes]

      // Apenas atualiza as opções e a mensagem se houver opções encontradas
      if (opcoesArray.length > 0) {
        // Limpa as opções existentes e adiciona apenas os nomes dos nós
        ultimaMensagem.data.options = opcoesArray

        // Atualiza o texto da mensagem com as opções formatadas
        this.atualizarMensagemComOpcoes(ultimaMensagem)

        // Notifica o usuário apenas se adicionou nós novos
        if (adicionouNos) {
          this.$q.notify({
            type: 'positive',
            message: 'Opções de resposta atualizadas com os nós conectados',
            position: 'top',
            timeout: 2000
          })
        }
      }
    },

    atualizarMensagemComOpcoes (mensagem) {
      if (!mensagem.data.options || mensagem.data.options.length === 0) return

      let message = mensagem.data.message || ''

      // Remover qualquer lista de opções e texto de instruções existente
      const optionPatterns = [
        /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
        /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
      ]

      for (const pattern of optionPatterns) {
        message = message.replace(pattern, '')
      }

      // Limpar linhas em branco extras ao final
      message = message.replace(/\n+$/, '')

      // Adicionar uma quebra de linha se a mensagem não terminar com uma
      if (message && !message.endsWith('\n')) {
        message += '\n'
      }

      // Adicionar uma linha em branco antes das opções se houver mensagem
      if (message) {
        message += '\n'
      }

      // Adicionar as opções numeradas
      message += '*Opções disponíveis:*\n'
      mensagem.data.options.forEach((option, index) => {
        message += `${index + 1}️⃣ *${option}*\n`
      })
      message += '\n_Digite o número ou o texto da opção desejada_'

      mensagem.data.message = message
    },
    updateNodeConditions () {
      if (this.node && this.node.conditions) {
        // Garantir que o tipo esteja correto para cada condição
        this.node.conditions.forEach(condition => {
          // Se não tiver tipo definido ou for 'default', usar 'R' (Respostas)
          if (!condition.type || condition.type === 'default') {
            condition.type = 'R'
          }

          // Converter condições antigas de US para R
          if (condition.type === 'US') {
            condition.type = 'R'
          }

          // Garantir que action esteja sempre definido como número
          if (condition.action === undefined || condition.action === null) {
            condition.action = 0 // Etapa
          } else {
            condition.action = Number(condition.action)
          }

          // Garantir que condition seja sempre um array
          if (!Array.isArray(condition.condition)) {
            // Se for string, converter para array
            if (typeof condition.condition === 'string') {
              if (condition.condition === 'true' || condition.condition === '') {
                // Se for 'true' ou vazio, usar nome do nó alvo como valor padrão
                const targetNodeId = condition.nextNode || condition.nextStepId
                const targetNode = this.nodesList.nodeList.find(n => n.id === targetNodeId)
                condition.condition = targetNode ? [targetNode.name] : ['bot']
              } else {
                // Outro valor de string, converter para array
                condition.condition = [condition.condition]
              }
            } else {
              // Nem string nem array, inicializar com valor padrão
              condition.condition = ['bot']
            }
          } else if (Array.isArray(condition.condition) && condition.condition.length === 0) {
            // Se for array vazio, inicializar com valor padrão
            condition.condition = ['bot']
          }
        })

        // Verificar e extrair opções das mensagens
        this.extrairOpcoesAutomaticamente()

        // Forçar atualização da UI
        const conditions = [...this.node.conditions]
        this.node.conditions = []
        this.$nextTick(() => {
          this.node.conditions = conditions
          this.tabNodeForm = 'condicoes' // Garantir que estamos na aba de condições
          this.$emit('repaintEverything')
        })
      }
    },
    getSourceNodeName () {
      const sourceNode = this.nodesList.nodeList.find(n => n.id === this.line.from)
      return sourceNode ? sourceNode.name : 'Nó de origem não encontrado'
    },
    getTargetNodeName () {
      const targetNode = this.nodesList.nodeList.find(n => n.id === this.line.to)
      return targetNode ? targetNode.name : 'Nó de destino não encontrado'
    },
    updateLineLabelRealtime (value) {
      // Atualizar o label em tempo real enquanto o usuário digita
      if (this.line && this.line.from && this.line.to) {
        // Usar o mesmo método de setLineLabel mas sem salvar permanentemente
        this.$emit('updateLineLabelRealtime', this.line.from, this.line.to, value)
      }
    }
  },
  mounted () {
    console.log('node_form montou', this.node)
  }
}
</script>

<style lang="scss" scoped>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}

.chat-preview {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.chat-message {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  background: white;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-options {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
}

.message-caption {
  margin-top: 4px;
  font-size: 0.9em;
  color: #666;
}

.file-preview {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.connection-preview {
  background: white;
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.preview-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.preview-connection {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-node {
  flex: 1;
  text-align: left;
}

.preview-arrow {
  flex: 0;
  text-align: right;
}

.preview-label {
  flex: 1;
  text-align: right;
}

.empty-label {
  color: #666;
}
</style>

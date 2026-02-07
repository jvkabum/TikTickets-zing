<template>
  <div class="q-px-md q-py-sm">
    <q-card
      bordered
      flat
      class="fit"
    >
      <div class="ef-node-form-header">Configuração Fluxo</div>
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
              <div class="text-center">
                <div class="row q-mt-sm col justify-center">
                <div class="row q-mt-sm justify-center items-center q-gutter-x-sm bg-grey-2 q-pa-xs rounded-all shadow-1" style="display: inline-flex">
                  <q-btn
                    flat
                    round
                    icon="chat_bubble_outline"
                    color="primary"
                    @click="addMessage"
                  >
                    <q-tooltip content-class="text-bold">Enviar Mensagem</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    icon="description"
                    color="primary"
                    @click="addMediaField"
                  >
                    <q-tooltip content-class="text-bold">Enviar Mídia</q-tooltip>
                  </q-btn>

                  <q-separator vertical inset />

                  <q-btn
                    flat
                    round
                    icon="visibility"
                    color="grey-7"
                    @click="showPreview = true"
                  >
                    <q-tooltip content-class="text-bold">Visualizar</q-tooltip>
                  </q-btn>
                </div>
                </div>
                <div
                  class="row bg-grey-3 q-pa-sm q-my-md justify-center scroll"
                  style="height: calc(100vh - 495px)"
                >
                  <div class="col-xs-12">
                    <div
                      v-for="(element, idx) in node.interactions"
                      :key="element.id"
                    >
                      <div class="q-my-md">
                        <div class="header-interacao full-width row items-center justify-between q-pa-xs q-mb-xs">
                          <div class="row items-center q-gutter-x-sm">
                            <q-avatar
                              size="28px"
                              :color="$q.dark.isActive ? 'grey-9' : 'grey-10'"
                              text-color="white"
                              class="text-weight-bold shadow-1"
                            >
                              {{ idx + 1 }}
                            </q-avatar>
                          </div>
                          
                          <div class="row items-center q-gutter-x-xs">
                            <q-btn
                              round
                              dense
                              icon="arrow_upward"
                              flat
                              color="positive"
                              size="sm"
                              class="bg-grey-2"
                              :disable="idx === 0"
                              @click="changePosition(node.interactions, idx, idx - 1)"
                            >
                              <q-tooltip>Subir</q-tooltip>
                            </q-btn>
                            <q-btn
                              round
                              dense
                              icon="arrow_downward"
                              flat
                              color="grey-8"
                              size="sm"
                              class="bg-grey-2"
                              :disable="idx === node.interactions.length - 1"
                              @click="changePosition(node.interactions, idx, idx + 1)"
                            >
                              <q-tooltip>Descer</q-tooltip>
                            </q-btn>
                            <q-btn
                              round
                              dense
                              icon="close"
                              flat
                              color="negative"
                              size="sm"
                              class="bg-grey-2 q-ml-sm"
                              @click="removeItem(element, idx + 1)"
                            >
                              <q-tooltip>Remover</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                        <component
                          :is="interactionComponents[element.type]"
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
                    <q-tooltip content-class="text-bold"> Nova condição </q-tooltip>
                  </q-btn>
                </div>
                <div
                  style="height: calc(100vh - 490px)"
                  class="row bg-grey-3 q-pa-sm scroll q-mt-md col justify-start"
                >
                  <template
                    v-for="(condition, idx) in node.conditions"
                    :key="condition.id"
                  >
                    <q-card
                      bordered
                      flat
                      class="full-width q-my-sm"
                      style="min-height: 250px"
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
                          <q-tooltip> Reordenar: Aumentar prioridade da regra de condição </q-tooltip>
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
                          <q-tooltip> Reordenar: Diminuir prioridade da regra de condição </q-tooltip>
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
                        <div class="text-bold q-px-sm">Rotear para:</div>
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
                              :model-value="condition.nextNode || condition.nextStepId || ''"
                              :options="nodesList.nodeList.filter(n => n.type !== 'configurations')"
                              option-label="name"
                              option-value="id"
                              label="Etapa"
                              map-options
                              emit-value
                              clearable
                              @update:model-value="nextNodeId => addLineStep(nextNodeId, idx)"
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
                              @update:model-value="
                                () => {
                                  condition.nextNode = null
                                  condition.userIdDestination = null
                                }
                              "
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
                              @update:model-value="
                                () => {
                                  condition.nextNode = null
                                  condition.queueId = null
                                }
                              "
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
                              @update:model-value="updateLineLabel(idx)"
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
              @update:model-value="updateLineLabelRealtime"
            >
              <template v-slot:prepend>
                <q-icon
                  name="mdi-label-outline"
                  color="primary"
                />
              </template>
              <template v-slot:append>
                <q-icon name="mdi-pencil" />
                <q-tooltip>Digite o texto a ser exibido na linha de conexão</q-tooltip>
              </template>
              <template v-slot:hint> Este texto será exibido na linha de conexão entre os nós </template>
            </q-input>
            <div class="row justify-end">
              <q-btn
                label="Salvar Chave"
                color="primary"
                rounded
                @click="saveLine"
              />
            </div>

            <div class="connection-preview q-mt-lg">
              <div class="preview-title text-grey-7">Visualização:</div>
              <div class="preview-connection">
                <div class="preview-node">
                  <q-chip
                    dense
                    outline
                    color="primary"
                    icon="mdi-ray-start"
                  >
                    {{ line.fromNodeName || 'Origem' }}
                  </q-chip>
                </div>
                <div class="preview-arrow">
                  <q-icon
                    name="mdi-arrow-right"
                    size="sm"
                    color="grey-5"
                  />
                </div>
                <div class="preview-label">
                  <q-chip
                    v-if="line.label"
                    dense
                    color="secondary"
                    text-color="white"
                  >
                    {{ line.label }}
                  </q-chip>
                  <span
                    v-else
                    class="empty-label text-italic text-grey-5"
                    >Sem chave</span
                  >
                </div>
                <div class="preview-arrow">
                  <q-icon
                    name="mdi-arrow-right"
                    size="sm"
                    color="grey-5"
                  />
                </div>
                <div class="preview-node">
                  <q-chip
                    dense
                    outline
                    color="primary"
                    icon="mdi-ray-end"
                  >
                    {{ line.toNodeName || 'Destino' }}
                  </q-chip>
                </div>
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
        <q-input
          outlined
          rounded
          label="Nome"
          v-model="node.name"
          class="q-my-sm full-width"
        />
        <q-separator inset="" />
        <q-card
          class="full-width q-my-sm"
          style="min-height: 250px"
        >
          <div class="ef-node-form-header">Configurações Gerais do Fluxo</div>
          <q-card-section>
            <div class="text-bold q-px-sm">Mensagem de Saudação:</div>
            <q-input
              ref="welcomeMessageRef"
              v-model="node.configurations.welcomeMessage.message"
              type="textarea"
              outlined
              rounded
              class="full-width q-mt-sm"
              placeholder="Olá! Como posso ajudar?"
            >
              <template v-slot:append>
                <EmojiPickerComponent
                  icon="mdi-emoticon-happy-outline"
                  dense
                  height="450px"
                  @select="onInsertSelectEmojiSaudacao"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <div class="text-bold q-px-sm">Mensagem quando não encontrar opção válida:</div>
            <q-input
              ref="notOptionsMessageRef"
              v-model="node.configurations.notOptionsSelectMessage.message"
              type="textarea"
              outlined
              rounded
              class="full-width q-mt-sm"
              placeholder="Desculpe, não entendi. Escolha uma das opções abaixo."
            >
              <template v-slot:append>
                <EmojiPickerComponent
                  icon="mdi-emoticon-happy-outline"
                  dense
                  height="450px"
                  @select="onInsertSelectEmojiNotOptionsSelectMessage"
                />
              </template>
            </q-input>
          </q-card-section>
        </q-card>

        <!-- Ausência de resposta -->
        <q-card
          class="full-width q-my-sm"
          style="min-height: 250px"
        >
          <div class="ef-node-form-header">Ausência de resposta</div>
          <div class="q-pa-sm text-grey-8">
             Após o tempo determinado, se o cliente não responder,
             o bot realizará o encaminhamento para a Fila/Usuário informados.
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

        <!-- Máximo de Tentativas do Bot -->
        <q-card
          class="full-width q-my-sm"
          style="min-height: 250px"
        >
           <div class="ef-node-form-header">Máximo de Tentativas do Bot</div>
           <div class="q-pa-sm text-grey-8">
              Uma vez excedido o número máximo de retentativas de pergunta/resposta,
              caso o cliente não envie uma resposta válida, o bot irá realizar o encaminhamento
              para a Fila/Usuário configurados.
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

        <!-- Auto Distribuir Atendimento -->
        <q-card
          class="full-width q-my-sm"
          style="min-height: 200px"
        >
          <div class="ef-node-form-header">Auto Distribuir Atendimento</div>
          <div class="q-pa-sm text-grey-8">
            <p><strong>Não:</strong> Desativado.</p>
            <p><strong>Balancear:</strong> Distribui com base na carga de atendimentos.</p>
            <p><strong>Aleatória:</strong> Distribui aleatoriamente.</p>
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

        <!-- Encerrar Atendimento -->
        <q-card
          class="full-width q-my-sm"
          style="min-height: 150px"
        >
          <div class="ef-node-form-header">Encerrar Atendimento</div>
          <div class="q-pa-sm text-grey-8">
            Caso o cliente digite uma das opções abaixo, o atendimento será encerrado.
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  dense
                  label="Parâmetros de Encerramento"
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
              - Caso seja o primeiro contato do cliente, o sistema salvará automaticamente na agenda as informações do
              cliente.
            </div>
            <div class="row text-subtitle2">- O Bot irá interagir nos atendimentos iniciados pelos clientes.</div>
            <div class="row text-subtitle2">
              - O Bot irá parar de interagir caso o atendimento seja assumido por um usuário.
            </div>
          </div>
        </q-card>
      </q-card-section>
    </q-card>

    <!-- Modal de prévia das interações -->
    <q-dialog v-model="showPreview">
      <q-card style="width: 450px; max-width: 90vw; border-radius: 16px" class="bg-surface shadow-24">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-primary">⚡ Prévia do Fluxo</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="grey-7"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="chat-preview border-soft">
            <template
              v-for="interaction in node.interactions"
              :key="interaction.id"
            >
              <!-- Mensagem de texto -->
              <div
                v-if="interaction.type === 'MessageField'"
                class="chat-message animate-fade"
              >
                <div class="message-content shadow-1">
                  <div class="message-text">{{ interaction.data.message || '...' }}</div>
                  <div
                    v-if="interaction.data.options && interaction.data.options.length > 0"
                    class="message-options q-gutter-xs q-mt-sm"
                  >
                    <q-chip
                      v-for="(option, optIdx) in interaction.data.options"
                      :key="optIdx"
                      dense
                      outline
                      color="primary"
                      class="text-weight-medium bg-white"
                    >
                      {{ option }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <!-- Mídia -->
              <div
                v-if="interaction.type === 'MediaField'"
                class="chat-message animate-fade"
              >
                <div class="message-content media-container shadow-1">
                  <!-- Imagem -->
                  <q-img
                    v-if="interaction.data.type?.indexOf('image') !== -1"
                    :src="interaction.data.mediaUrl"
                    style="max-height: 250px; border-radius: 8px"
                    fit="contain"
                    class="bg-grey-1"
                  />

                  <!-- Vídeo -->
                  <video
                    v-else-if="interaction.data.type?.indexOf('video') !== -1"
                    :src="interaction.data.mediaUrl"
                    controls
                    style="width: 100%; max-height: 250px; border-radius: 8px"
                    class="bg-black"
                  />

                  <!-- Áudio -->
                  <audio
                    v-else-if="interaction.data.type?.indexOf('audio') !== -1"
                    :src="interaction.data.mediaUrl"
                    controls
                    class="full-width q-mt-xs"
                  />

                  <!-- Outros arquivos (PDF, etc) -->
                  <div
                    v-else-if="interaction.data.type"
                    class="file-preview-mini row items-center q-pa-sm bg-grey-2 rounded-borders"
                  >
                    <q-icon
                      :name="getFileIcon(interaction.data.name)"
                      size="32px"
                      color="primary"
                    />
                    <div class="text-caption q-ml-sm text-weight-bold truncate" style="max-width: 200px">
                      {{ interaction.data.name }}
                    </div>
                  </div>

                  <!-- Legenda -->
                  <div
                    v-if="interaction.data.caption"
                    class="message-caption q-mt-xs text-grey-8"
                  >
                    {{ interaction.data.caption }}
                  </div>
                </div>
              </div>
            </template>
            
            <div v-if="!node.interactions?.length" class="text-center q-pa-xl text-grey-5">
              <q-icon name="chat_bubble_outline" size="48px" />
              <div class="text-subtitle1 q-mt-sm">Nenhuma interação adicionada</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { uid, useQuasar } from 'quasar'
import EmojiPickerComponent from 'src/components/EmojiPickerComponent.vue'
import useEmoji from 'src/composables/useEmoji'
import MediaField from './mediaField.vue'
import MessageField from './messageField.vue'

// Registrar componentes para uso dinâmico via :is
const interactionComponents = {
  MessageField,
  MediaField
}

const props = defineProps({
  nodesList: { type: Object, default: () => ({ nodeList: [], lineList: [] }) },
  filas: { type: Array, default: () => [] },
  usuarios: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'saveFlow',
  'addNode',
  'repaintEverything',
  'deleteLine',
  'updateLineLabelRealtime',
  'setLineLabel',
  'addNewLineCondition'
])

const $q = useQuasar()

const visible = ref(true)
const tabNodeForm = ref('interacoes')
const elements = ref([])
const showPreview = ref(false)
const type = ref('node')
const welcomeMessageRef = ref(null)
const notOptionsMessageRef = ref(null)
const node = ref({ interactions: [], conditions: [], configurations: {} })
const line = ref({ from: '', to: '', label: '' })

const optionsAcao = [
  { value: 0, label: 'Etapa' },
  { value: 1, label: 'Fila' },
  { value: 2, label: 'Usuário' }
]

const optionsSe = [
  { label: 'Qualquer resposta', value: 'US' },
  { label: 'Respostas', value: 'R' }
]

const gerarUID = () => uid()

// Replicar Vue 2.7: usar a referência do nó passada pelo panel (mesma que data.nodeList)
const nodeInit = (data, id, nodeRef) => {
  type.value = 'node'
  const foundNode = nodeRef ?? data.nodeList.find(n => n.id === id)
  if (foundNode) {
    node.value = foundNode
    if (!node.value.interactions) node.value.interactions = []
    if (!node.value.conditions) node.value.conditions = []
    if (!node.value.configurations) node.value.configurations = {}
    
    // Inicializar objetos de configuração se não existirem
    if (!node.value.configurations.welcomeMessage) node.value.configurations.welcomeMessage = { message: '' }
    if (!node.value.configurations.notOptionsSelectMessage) node.value.configurations.notOptionsSelectMessage = { message: '' }
    if (!node.value.configurations.notResponseMessage) node.value.configurations.notResponseMessage = { time: null, type: 1, destiny: null }
    if (!node.value.configurations.maxRetryBotMessage) node.value.configurations.maxRetryBotMessage = { number: null, type: 1, destiny: null }
    if (!node.value.configurations.autoDistributeTickets) node.value.configurations.autoDistributeTickets = 'N'
    if (!node.value.configurations.answerCloseTicket) node.value.configurations.answerCloseTicket = []

    updateNodeConditions()
  }
}

const lineInit = lineData => {
  type.value = 'line'
  line.value = lineData
}

const addNode = () => emit('addNode')

const addMessage = () => {
  if (!node.value.interactions) node.value.interactions = []
  node.value.interactions.push({
    id: gerarUID(),
    type: 'MessageField',
    data: { message: '', options: [], delay: 0 }
  })
}

const addMediaField = () => {
  if (!node.value.interactions) node.value.interactions = []
  node.value.interactions.push({
    id: gerarUID(),
    type: 'MediaField',
    data: {
      type: 'image',
      mediaUrl: '',
      name: '',
      caption: '',
      supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mp3', 'application/pdf'],
      maxSize: 10485760
    }
  })
}

const addCondiction = () => {
  if (!node.value.conditions) node.value.conditions = []
  node.value.conditions.push({
    id: gerarUID(),
    type: 'R',
    condition: ['bot'],
    action: 0,
    nextNode: null,
    nextStepId: null,
    description: ''
  })
}

const removeItem = (item, idx) => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente remover a interação (${idx})?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    node.value.interactions = node.value.interactions.filter(i => i.id !== item.id)
    emit('repaintEverything')
  })
}

const removeConditionItem = (condition, idx) => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a condição (${idx + 1})?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (condition.nextNode || condition.nextStepId) {
      emit('deleteLine', node.value.id, condition.nextNode || condition.nextStepId)
    }
    node.value.conditions.splice(idx, 1)
  })
}

const saveInteractions = () => {
  $q.notify({
    type: 'positive',
    message: 'Interações salvas com sucesso!',
    position: 'top',
    timeout: 2000
  })
}

const saveLine = () => {
  emit('setLineLabel', line.value.from, line.value.to, line.value.label)
  $q.notify({
    type: 'positive',
    message: 'Chave da conexão atualizada!',
    position: 'top',
    timeout: 1500
  })
  type.value = 'node'
}

const updateLineLabel = idx => {
  const condition = node.value.conditions[idx]
  if (condition && (condition.nextNode || condition.nextStepId)) {
    emit('setLineLabel', node.value.id, condition.nextNode || condition.nextStepId, condition.description)
  }
}

const addLineStep = (nextNodeId, idx) => {
  const condition = node.value.conditions[idx]
  const oldToLine = condition.nextNode || condition.nextStepId

  condition.nextNode = nextNodeId
  condition.nextStepId = nextNodeId

  if (condition.queueId) condition.queueId = null
  if (condition.userIdDestination) condition.userIdDestination = null

  if (oldToLine !== nextNodeId) {
    emit('addNewLineCondition', node.value.id, nextNodeId, oldToLine)
  }

  const targetNode = props.nodesList.nodeList.find(n => n.id === nextNodeId)
  if (targetNode) {
    condition.description = `Rotear para ${targetNode.name}`
  }

  updateLineLabel(idx)
  extrairOpcoesAutomaticamente()
}

const changePosition = (arr, from, to) => {
  if (to < 0 || to >= arr.length) return
  const element = arr.splice(from, 1)[0]
  arr.splice(to, 0, element)
}

const getFileIcon = name => {
  if (!name) return 'description'
  const ext = name.split('.').pop().toLowerCase()
  const map = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    xls: 'table_chart',
    xlsx: 'table_chart',
    zip: 'archive',
    rar: 'archive'
  }
  return map[ext] || 'insert_drive_file'
}

const extrairOpcoesAutomaticamente = () => {
  if (!node.value || !node.value.interactions) return

  const options = []
  if (node.value.conditions) {
    node.value.conditions.forEach(c => {
      if (Array.isArray(c.condition)) {
        c.condition.forEach(opt => {
          if (opt && !options.includes(opt)) options.push(opt)
        })
      } else if (typeof c.condition === 'string') {
        if (c.condition && !options.includes(c.condition)) options.push(c.condition)
      }
    })
  }

  if (options.length === 0) return

  const lastMessageIndex = node.value.interactions
    .map((it, idx) => (it.type === 'MessageField' ? idx : -1))
    .filter(idx => idx !== -1)
    .pop()

  if (lastMessageIndex !== undefined) {
    const lastMessage = node.value.interactions[lastMessageIndex]
    lastMessage.data.options = options
    updateMessageWithNumbers(lastMessage)
  }
}

const updateMessageWithNumbers = mensagem => {
  if (!mensagem.data.options || mensagem.data.options.length === 0) return
  let message = mensagem.data.message || ''

  const optionPatterns = [
    /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
    /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
  ]
  optionPatterns.forEach(p => (message = message.replace(p, '')))
  message = message.replace(/\n+$/, '')
  if (message && !message.endsWith('\n')) message += '\n'
  if (message) message += '\n'

  message += '*Opções disponíveis:*\n'
  mensagem.data.options.forEach((opt, idx) => {
    message += `${idx + 1}️⃣ *${opt}*\n`
  })
  message += '\n_Digite o número ou o texto da opção desejada_'
  mensagem.data.message = message
}

const updateNodeConditions = () => {
  if (!node.value || !node.value.conditions) return
  const currentNodeId = node.value.id
  node.value.conditions.forEach(c => {
    if (!c.type || c.type === 'default') c.type = 'R'
    c.action = c.action === undefined ? 0 : Number(c.action)
    if (!Array.isArray(c.condition)) {
      if (typeof c.condition === 'string') {
        if (c.condition === 'true' || c.condition === '') {
          const target = props.nodesList.nodeList.find(n => n.id === (c.nextNode || c.nextStepId))
          c.condition = target ? [target.name] : ['bot']
        } else {
          c.condition = [c.condition]
        }
      } else {
        c.condition = ['bot']
      }
    } else if (c.condition.length === 0 && c.type !== 'US') {
      c.condition = ['bot']
    }
  })
  extrairOpcoesAutomaticamente()
  // Trigger repaint to update connections/endpoints if needed
  nextTick(() => {
    emit('repaintEverything')
  })
}

const updateLineLabelRealtime = val => {
  if (line.value && line.value.from && line.value.to) {
    emit('updateLineLabelRealtime', line.value.from, line.value.to, val)
  }
}

defineExpose({
  nodeInit,
  lineInit,
  updateNodeConditions,
  extrairOpcoesAutomaticamente,
  activateSection: s => {
    tabNodeForm.value = ['messages', 'flow', 'interacoes'].includes(s) ? 'interacoes' : 'condicoes'
    if (s === 'messages') nextTick(() => addMessage())
    else if (s === 'flow') nextTick(() => addMediaField())
  }
})

const { insertEmoji } = useEmoji()

const onInsertSelectEmojiSaudacao = emoji => {
  if (!node.value.configurations.welcomeMessage) {
    node.value.configurations.welcomeMessage = { message: '' }
  }
  const currentText = node.value.configurations.welcomeMessage.message || ''
  
  insertEmoji(
    emoji, 
    welcomeMessageRef.value, 
    currentText, 
    val => (node.value.configurations.welcomeMessage.message = val)
  )
}

const onInsertSelectEmojiNotOptionsSelectMessage = emoji => {
  if (!node.value.configurations.notOptionsSelectMessage) {
    node.value.configurations.notOptionsSelectMessage = { message: '' }
  }
  const currentText = node.value.configurations.notOptionsSelectMessage.message || ''
  
  insertEmoji(
    emoji, 
    notOptionsMessageRef.value, 
    currentText, 
    val => (node.value.configurations.notOptionsSelectMessage.message = val)
  )
}


onMounted(() => {
  console.log('node_form montou', node.value)
  emit('formMounted')
})


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
  background: #f0f2f5;
  border-radius: 12px;
  padding: 16px;
  max-height: 65vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-message {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-start;
}

.animate-fade {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-content {
  max-width: 85%;
  background: white;
  border-radius: 0 12px 12px 12px;
  padding: 10px 14px;
  position: relative;
  
  &.media-container {
    padding: 6px;
    background: white;
  }
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #1c1e21;
}

.message-caption {
  font-size: 0.85rem;
  padding: 4px 6px;
  line-height: 1.2;
}

.border-soft {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.bg-surface {
  background: white;
}

body.body--dark {
  .chat-preview {
    background: #1a1a1b;
  }
  .bg-surface {
    background: #242526;
  }
  .message-content {
    background: #3a3b3c;
    color: white;
    &.media-container { background: #3a3b3c; }
  }
  .message-text { color: #e4e6eb; }
  .message-caption { color: #b0b3b8; }
  .border-soft { border-color: rgba(255, 255, 255, 0.1); }
}
</style>


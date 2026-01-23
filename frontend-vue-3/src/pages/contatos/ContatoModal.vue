<template>
  <q-dialog
    @show="abrirModal"
    @hide="fecharModal"
    :model-value="modalContato"
    persistent
  >
    <q-card
      class="q-pa-lg"
      style="min-width: 700px"
    >
      <q-card-section>
        <div class="text-h6">
          {{ contactId ? 'Editar Contato' : 'Adicionar Contato' }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold"> Dados Contato </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md">
        <q-input
          class="col-12"
          outlined
          v-model="name"
          :error="!!errors.name"
          :error-message="errors.name"
          label="Nome"
        />
        <q-input
          class="col-12"
          outlined
          v-model="number"
          :error="!!errors.number"
          :error-message="errors.number"
          mask="+#############"
          placeholder="+DDI DDD 99999 9999"
          fill-mask
          unmasked-value
          hint="Informe número com DDI e DDD"
          label="Número"
        />
        <q-input
          class="col-12"
          outlined
          v-model="email"
          :error="!!errors.email"
          :error-message="errors.email"
          label="E-mail"
        />
      </q-card-section>
      <q-card
        class="bg-white q-mt-sm btn-rounded"
        style="width: 100%"
        bordered
        flat
      >
        <q-card-section class="text-bold q-pb-none">
          Carteira / Usuário Responsável
          <q-separator />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-select
            square
            borderless
            v-model="wallets"
            multiple
            :max-values="1"
            :options="usuarios"
            use-chips
            option-value="id"
            option-label="name"
            emit-value
            map-options
            dropdown-icon="add"
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item
                v-bind="itemProps"
                v-on="itemEvents || {}"
              >
                <q-item-section>
                  <q-item-label><span v-html="opt.name"></span></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ opt }">
              <q-chip
                dense
                square
                color="white"
                text-color="primary"
                class="q-ma-xs row col-12 text-body1"
              >
                {{ opt.name }}
              </q-chip>
            </template>
            <template v-slot:no-option="{ itemProps, itemEvents }">
              <q-item
                v-bind="itemProps"
                v-on="itemEvents"
              >
                <q-item-section>
                  <q-item-label class="text-negative text-bold"> Ops... Sem usuários disponíveis!! </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card>
      <q-card-section class="q-pa-sm q-pl-md text-bold"> Informações adicionais </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md justify-center">
        <template
          v-for="(extra, index) in extraInfo"
          :key="index"
        >
          <div class="col-12 row justify-center q-col-gutter-sm">
            <q-input
              class="col-6"
              outlined
              dense
              rounded
              v-model="extra.name"
              label="Descrição"
            />
            <q-input
              class="col-5"
              outlined
              dense
              rounded
              label="Informação"
              v-model="extra.value"
            />
            <div class="col q-pt-md">
              <q-btn
                icon="delete"
                round
                flat
                color="negative"
                @click="removeExtraInfo(index)"
              />
            </div>
          </div>
        </template>
        <div class="col-6">
          <q-btn
            class="full-width"
            color="primary"
            outline
            rounded
            label="Adicionar Informação"
            @click="addExtraInfo"
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-lg"
      >
        <q-btn
          rounded
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md"
        />
        <q-btn
          class="q-ml-lg q-px-md"
          rounded
          label="Salvar"
          color="positive"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useContatoStore } from 'src/stores/useContatoStore'
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { notificarErro } from 'src/utils/helpersNotifications'
import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

const props = defineProps({
  modalContato: {
    type: Boolean,
    default: false
  },
  contactId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modalContato', 'contatoModal:contato-editado', 'contatoModal:contato-criado'])

const $q = useQuasar()
const contatoStore = useContatoStore()
const usuarioStore = useUsuarioStore()

const usuarios = ref([])
const extraInfo = ref([])

const validationSchema = toTypedSchema(
  zod.object({
    name: zod.string().min(3, 'Mínimo de 3 caracteres').max(50, 'Máximo de 50 caracteres'),
    email: zod.string().email('E-mail inválido').optional().or(zod.literal('')),
    number: zod.string().min(8, 'Número inválido'),
    wallets: zod.array(zod.any()).optional()
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    number: '',
    email: '',
    wallets: []
  }
})

const { value: name } = useField('name')
const { value: number } = useField('number')
const { value: email } = useField('email')
const { value: wallets } = useField('wallets')

const listarUsuarios = async () => {
  try {
    const data = await usuarioStore.listarUsuarios()
    usuarios.value = data.users || []
  } catch (error) {
    console.error(error)
    notificarErro('Problema ao carregar usuários', error)
  }
}

const abrirModal = async () => {
  await listarUsuarios()
  if (props.contactId) {
    try {
      const data = await contatoStore.obterContato(props.contactId)
      setValues({
        name: data.name,
        number: data.number,
        email: data.email || '',
        wallets: data.wallets ? data.wallets.map(w => w.id || w) : []
      })
      extraInfo.value = data.extraInfo || []
    } catch (error) {
      console.error(error)
      notificarErro('Ocorreu um erro ao carregar o contato!', error)
    }
  } else {
    resetForm()
    extraInfo.value = []
  }
}

const fecharModal = () => {
  emit('update:modalContato', false)
  resetForm()
  extraInfo.value = []
}

const addExtraInfo = () => {
  extraInfo.value.push({ name: '', value: '' })
}

const removeExtraInfo = index => {
  extraInfo.value.splice(index, 1)
}

const onSubmit = handleSubmit(async values => {
  try {
    const payload = {
      ...values,
      extraInfo: extraInfo.value,
      number: '' + values.number
    }

    if (props.contactId) {
      const data = await contatoStore.editarContato(props.contactId, payload)
      emit('contatoModal:contato-editado', data)
      $q.notify({
        type: 'info',
        message: 'Contato editado!',
        position: 'top'
      })
    } else {
      const data = await contatoStore.criarContato(payload)
      emit('contatoModal:contato-criado', data)
      $q.notify({
        type: 'positive',
        message: 'Contato criado!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
    notificarErro('Ocorreu um erro ao salvar o contato', error)
  }
})
</script>

<style lang="scss" scoped></style>

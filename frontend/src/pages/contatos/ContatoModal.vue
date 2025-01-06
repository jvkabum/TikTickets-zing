<template>
  <q-dialog
    @show="fetchContact"
    @hide="$emit('update:modalContato', false)"
    :value="modalContato"
    persistent
  >
    <q-card
      class="q-pa-lg"
      style="min-width: 700px"
    >
      <q-card-section>
        <div class="text-h6">
          {{ contactId ? 'Editar Contato' : 'Adicionar Contato'  }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Dados Contato
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md">
        <c-input
          class="col-12"
          outlined
          v-model="contato.name"
          :validator="$v.contato.name"
          @blur="$v.contato.name.$touch"
          label="Nome"
        />
        <c-input
          class="col-12"
          outlined
          v-model="contato.number"
          :validator="$v.contato.number"
          @blur="$v.contato.number.$touch"
          mask="+#############"
          placeholder="+DDI DDD 99999 9999"
          fill-mask
          unmasked-value
          hint="Informe número com DDI e DDD"
          label="Número"
        />
        <c-input
          class="col-12"
          outlined
          dense
          rounded
          :validator="$v.contato.email"
          @blur="$v.contato.email.$touch"
          v-model="contato.email"
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
            Carteira
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-select
              square
              borderless
              v-model="contato.wallets"
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
                  v-on="itemEvents"
                >
                  <q-item-section>
                    <q-item-label v-html="opt.name"></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      :value="selected"
                      @input="toggleOption(opt)"
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
                    <q-item-label class="text-negative text-bold">
                      Ops... Sem carteiras disponíveis!!
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

            </q-select>
          </q-card-section>
        </q-card>
      <q-card-section class="q-pa-sm q-pl-md text-bold">
        Informações adicionais
      </q-card-section>
      <q-card-section class="q-pa-sm q-pl-md row q-col-gutter-md justify-center">
        <template v-for="(extraInfo, index) in contato.extraInfo">
          <div
            :key="index"
            class="col-12 row justify-center q-col-gutter-sm"
          >
            <q-input
              class="col-6"
              outlined
              dense
              rounded
              v-model="extraInfo.name"
              label="Descrição"
            />
            <q-input
              class="col-5"
              outlined
              dense
              rounded
              label="Informação"
              v-model="extraInfo.value"
            />
            <div class="col q-pt-md">
              <q-btn
                :key="index"
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
            @click="contato.extraInfo.push({name: null, value: null})"
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
          class="q-px-md "
        />
        <q-btn
          class="q-ml-lg q-px-md"
          rounded
          label="Salvar"
          color="positive"
          @click="saveContact"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { ObterContato, CriarContato, EditarContato } from 'src/service/contatos'
import { ListarUsuarios } from 'src/service/user'
export default {
  name: 'ContatoModal',
  props: {
    modalContato: {
      type: Boolean,
      default: false
    },
    contactId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      contato: {
        name: null,
        number: null,
        email: '',
        extraInfo: [],
        wallets: []
      },
      usuarios: []
    }
  },
  validations: {
    contato: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { email },
      number: { required, minLength: minLength(8) }
    }
  },
  methods: {
    async fetchContact () {
      try {
        await this.listarUsuarios()
        if (!this.contactId) return
        const { data } = await ObterContato(this.contactId)
        this.contato = data
        if (data.number.substring(0, 2) === '55') {
          this.contato.number = data.number.substring(0)
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro!', error)
      }
    },
    removeExtraInfo (index) {
      const newData = { ...this.contato }
      newData.extraInfo.splice(index, 1)
      this.contato = { ...newData }
    },
    async saveContact () {
      this.$v.contato.$touch()
      if (this.$v.contato.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      const contato = {
        ...this.contato,
        number: '' + this.contato.number // inserir o DDI do brasil para consultar o número
      }

      try {
        if (this.contactId) {
          const { data } = await EditarContato(this.contactId, contato)
          this.$emit('contatoModal:contato-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Contato editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarContato(contato)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Contato criado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('contatoModal:contato-criado', data)
        }
        this.$emit('update:modalContato', false)
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro ao criar o contato', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema ao carregar usuários', error)
      }
    }

  },
  destroyed () {
    this.$v.contato.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>

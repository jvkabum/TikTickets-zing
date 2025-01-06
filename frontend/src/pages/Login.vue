<template>
  <div class="q-pa-md bg-video">
    <video autoplay muted loop class="video-background">
      <source src="../assets/110694.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>
    <q-layout class="vertical-center">
      <q-page-container>
        <q-page class="flex justify-end items-center">
          <q-ajax-bar position="top"
            color="primary"
            size="5px" />
          <q-card bordered
            class="card q-pa-md shadow-10"
            style="border-top: 5px solid #3E72AF; background-color: rgba(255,255,255,0.75); border-radius: 20px">
            <q-card-section class="text-primary text-center">
            </q-card-section>
            <q-card-section class="text-primary">
              <div class="text-h6">Bem vindo!</div>
            </q-card-section>
            <q-card-section>
              <q-input class="q-mb-md"
                clearable
                v-model="form.email"
                placeholder="meu@email.com"
                @blur="$v.form.email.$touch"
                :error="$v.form.email.$error"
                error-message="Deve ser um e-mail válido."
                outlined
                @keypress.enter="fazerLogin">
                <template v-slot:prepend>
                  <q-icon name="mdi-email-outline"
                    class="cursor-pointer"
                    color='primary' />
                </template>
              </q-input>

              <q-input outlined
                v-model="form.password"
                :type="isPwd ? 'password' : 'text'"
                @keypress.enter="fazerLogin">
                <template v-slot:prepend>
                  <q-icon name="mdi-shield-key-outline"
                    class="cursor-pointer"
                    color='primary' />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>
            </q-card-section>
            <q-card-actions>
              <q-space />
              <q-btn class="q-mr-sm q-my-lg"
                style="width: 150px"
                color="primary"
                :loading="loading"
                @click="fazerLogin">
                Login
                <span slot="loading">
                  <q-spinner-puff class="on-left" />Logando...
                </span>
              </q-btn>
              <q-btn class="q-my-lg"
                style="width: 200px"
                color="primary"
                @click="clearCache">
                Limpar Cache
              </q-btn>
            </q-card-actions>

            <q-inner-loading :showing="loading" />
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'Login',
  data () {
    return {
      modalEsqueciSenha: false,
      emailRedefinicao: null,
      form: {
        email: null,
        password: null
      },
      contasCliente: {},
      isPwd: true,
      loading: false
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    },
    emailRedefinicao: { required, email }
  },
  methods: {
    fazerLogin () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Informe usuário e senha corretamente.')
        return
      }
      this.loading = true
      this.$store.dispatch('UserLogin', this.form)
        .then(data => {
          this.loading = false
        })
        .catch(err => {
          console.error('exStore', err)
          this.loading = false
        })
    },
    clearCache () {
      if (window.caches) {
        caches.keys().then(names => {
          for (const name of names) caches.delete(name)
        })
      }
      localStorage.clear()
      sessionStorage.clear()
      this.$q.notify('Cache do navegador limpo.')
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.bg-video {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.q-layout {
  position: relative;
  z-index: 2;
}

.card {
  width: 100%;
  max-width: 430px;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 3;
}
</style>

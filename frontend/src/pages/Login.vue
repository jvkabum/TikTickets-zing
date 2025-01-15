<template>
  <div class="q-pa-md bg-gradient" style="overflow: hidden;">
    <q-layout class="vertical-center">
      <q-page-container>
        <q-page class="flex justify-center items-center">
          <q-ajax-bar position="top"
            color="primary"
            size="5px" />
          <q-card bordered
            class="card q-pa-md shadow-8 card-modern"
            style="background-color: rgba(255,255,255,0.85); border-radius: 15px; display: flex; flex-direction: column; align-items: center; max-width: 350px; min-width: 320px; width: 100%; margin-top: 20px; margin-bottom: 20px;">
            <q-card-section class="text-primary text-center" style="width: 100%;">
              <q-img src="/whapichat-logo_5_transparent.png"
                spinner-color="white"
                style="height: 100px; max-width: 150px"
                class="q-mb-lg q-px-md" />
              <q-separator />
            </q-card-section>
            <q-card-section class="text-primary text-center" style="width: 100%;">
              <div class="text-h6">Bem-vindo!</div>
            </q-card-section>

            <q-card-section style="width: 100%;">
              <q-input class="q-mb-md input-modern"
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
                class="input-modern"
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

            <q-card-actions class="q-gutter-md" style="display: flex; align-items: center;"><br>
  <!-- Botão Login -->
  <q-btn
    class="q-mr-sm btn-modern"
    style="flex: 1; max-width: 500px; padding: 6px;"
    color="primary"
    :loading="loading"
    @click="fazerLogin">
    Login
    <span slot="loading">
      <q-spinner-puff class="on-left" />Logando...
    </span>
  </q-btn>

  <!-- Botão Limpar Cache -->
  <q-btn
    class="q-mr-sm btn-modern"
    style="flex: 1; width: 150px; max-width: 500px; padding: 10px; font-size: 10px;"
    color="green"
    @click="clearCache">
    Limpar Cache
  </q-btn>
</q-card-actions>

            <q-card-section class="text-primary text-center" style="width: 100%;">
              <div class="text-caption-h7">Desenvolvido por: GOR INFORMÁTICA</div>
              <a href="https://wa.me/556133597358" target="_blank" style="display: flex; align-items: center; justify-content: center; color: inherit; text-decoration: none;">
                <q-icon name="mdi-whatsapp" size="2em" color="primary" class="q-mr-sm"/>
                <span class="text-caption-h4">(61) 3359-7358</span>
              </a>
            </q-card-section>

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
    },
    clear () {
      this.form.email = ''
      this.form.password = ''
      this.$v.form.$reset()
    }
  }
}
</script>

<style scoped>
.bg-gradient {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  background: linear-gradient(135deg, #9fc5f0, #003459);
}

.card {
  width: 80%;
  max-width: 350px;
  min-width: 320px;
  margin-top: 0px;   /* Adiciona margem superior */
  margin-bottom: 20px; /* Adiciona margem inferior */
  animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Estilos para campos de entrada */
.input-modern .q-field__inner {
  border-radius: 8px;
  padding: 5px;
  margin: 0;
  overflow: hidden;
}

.input-modern .q-field__inner:hover {
  border-color: #ffffff;
}

.input-modern .q-field__control:focus-within {
  border-color: #f5f5f5;
  box-shadow: 0 0 0 2px rgba(62, 114, 175, 0.2);
}

.btn-modern {
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-modern:hover {
  background-color: #ffffff;
  transform: scale(1.05);
}

.card-modern {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: transparent;
  border: none;
}

.card-modern:hover {
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
}

/* Media Queries para dispositivos móveis */
@media (max-width: 768px) {
  .card {
    padding: 20px;
    width: 90%; /* Reduz a largura em dispositivos móveis */
    margin-top: 0px; /* Aumenta a margem superior */
    margin-bottom: 20px; /* Aumenta a margem inferior */
  }

  .q-img {
    max-width: 120px; /* Diminui o tamanho da imagem em telas pequenas */
  }

  .input-modern .q-field__inner {
    width: 100%; /* Garante que os inputs ocupem toda a largura */
  }

  .btn-modern {
    width: 100%; /* O botão ocupa toda a largura em telas pequenas */
  }
}

@media (max-width: 480px) {
  .card {
    padding: 15px;
    margin-top: 30px; /* Ajusta a margem superior */
    margin-bottom: 30px; /* Ajusta a margem inferior */
  }

  .q-img {
    height: 80px; /* Ajusta a altura da imagem */
  }

  .input-modern .q-field__inner {
    padding: 5px; /* Ajusta o padding para dispositivos menores */
  }
}
</style>

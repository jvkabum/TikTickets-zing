<template>
  <div class="bg-video">
    <video
      autoplay
      loop
      muted
      playsinline
      class="video-background"
    >
      <source
        src="/110694.mp4"
        type="video/mp4"
      />
    </video>
    <div class="overlay"></div>
    <q-layout class="vertical-center">
      <q-page-container>
        <q-page class="flex justify-end items-center">
          <q-ajax-bar
            position="top"
            color="primary"
            size="5px"
          />
          <q-card
            bordered
            class="card card-modern q-pa-md shadow-10"
          >
            <!-- Logo Section -->
            <q-card-section class="text-center q-pb-none">
              <q-img
                src="/izing-logo_5_transparent.png"
                spinner-color="primary"
                class="logo-img q-mb-md"
              />
              <q-separator class="q-mb-md" />
            </q-card-section>

            <!-- Welcome Message -->
            <q-card-section class="text-primary text-center q-pt-none">
              <div class="text-h5 text-weight-medium">Bem-vindo!</div>
              <div class="text-caption text-grey-7">Faça login para continuar</div>
            </q-card-section>

            <!-- Form Fields -->
            <q-card-section>
              <q-input
                class="q-mb-md input-modern"
                clearable
                v-model="email"
                placeholder="meu@email.com"
                :error="!!errors.email"
                :error-message="errors.email || 'Deve ser um e-mail válido.'"
                outlined
                @keypress.enter="onSubmit"
              >
                <template v-slot:prepend>
                  <q-icon
                    name="mdi-email-outline"
                    class="cursor-pointer"
                    color="primary"
                  />
                </template>
              </q-input>

              <q-input
                outlined
                class="input-modern"
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                :error="!!errors.password"
                :error-message="errors.password"
                placeholder="Sua senha"
                @keypress.enter="onSubmit"
              >
                <template v-slot:prepend>
                  <q-icon
                    name="mdi-shield-key-outline"
                    class="cursor-pointer"
                    color="primary"
                  />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </q-card-section>

            <!-- Action Buttons -->
            <q-card-actions class="q-px-md q-pb-md">
              <q-btn
                class="btn-modern full-width q-mb-sm"
                color="primary"
                :loading="loading"
                @click="onSubmit"
                unelevated
              >
                <q-icon name="mdi-login" class="q-mr-sm" />
                Entrar
                <template v-slot:loading>
                  <q-spinner-puff class="on-left" />Logando...
                </template>
              </q-btn>
              <q-btn
                class="btn-modern-outline full-width"
                outline
                color="grey-7"
                @click="clearCache"
              >
                <q-icon name="mdi-cached" class="q-mr-sm" />
                Limpar Cache
              </q-btn>
            </q-card-actions>

            <!-- Footer Contact -->
            <q-card-section class="text-center footer-contact q-pt-none">
              <q-separator class="q-mb-md" />
              <div class="text-caption text-grey-6 q-mb-xs">Desenvolvido por TikTickets</div>
              <a
                href="https://wa.me/5511997108958"
                target="_blank"
                class="contact-link"
              >
                <q-icon name="mdi-whatsapp" size="1.5em" color="positive" class="q-mr-xs" />
                <span class="text-body2">(11) 99710-8958</span>
              </a>
            </q-card-section>

            <q-inner-loading :showing="loading" />
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()

const isPwd = ref(true)
const loading = ref(false)

const validationSchema = toTypedSchema(
  zod.object({
    email: zod.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
    password: zod.string().min(1, 'Informe a senha')
  })
)

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: ''
  }
})

const { value: email } = useField('email')
const { value: password } = useField('password')

const onSubmit = handleSubmit(async values => {
  loading.value = true
  try {
    await authStore.handleLogin(values)
    router.push({ name: 'home-dashboard' })
  } catch (err) {
    console.error('Login error', err)
    $q.notify({
      type: 'negative',
      message: 'Erro ao fazer login. Verifique suas credenciais.',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
})

const clearCache = () => {
  if (window.caches) {
    caches.keys().then(names => {
      for (const name of names) caches.delete(name)
    })
  }
  localStorage.clear()
  sessionStorage.clear()
  $q.notify({
    type: 'info',
    message: 'Cache do navegador limpo.',
    position: 'top'
  })
}
</script>

<style scoped>
/* === Base Video Background === */
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
  z-index: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.q-layout {
  position: relative;
  z-index: 2;
  background: transparent !important;
}

.q-page-container {
  background: transparent !important;
}

/* FIX: Override global q-page gradient animation */
.q-page {
  background: transparent !important;
  animation: none !important;
}

/* === Card Styling with Animation === */
.card {
  width: 100%;
  max-width: 400px;
  min-width: 320px;
  margin-right: 100px; /* Espaço da borda direita */
  z-index: 3;
  animation: slideIn 0.6s ease-out;
}

.card-modern {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
}

/* Slide In Animation */
@keyframes slideIn {
  from {
    transform: translateY(-40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* === Logo === */
.logo-img {
  height: 80px;
  max-width: 180px;
}

/* === Modern Input Styling - Override Quasar Outlined === */
.input-modern.q-field--outlined :deep(.q-field__control) {
  border-radius: 12px !important;
  background: #ffffff !important;
}

.input-modern.q-field--outlined :deep(.q-field__control::before),
.input-modern.q-field--outlined :deep(.q-field__control::after) {
  border: 1px solid #d1d5db !important;
  border-radius: 12px !important;
}

.input-modern.q-field--outlined:hover :deep(.q-field__control::before) {
  border-color: #3e72af !important;
}

.input-modern.q-field--outlined.q-field--focused :deep(.q-field__control::after) {
  border: 2px solid #3e72af !important;
  border-radius: 12px !important;
}

.input-modern :deep(.q-field__native) {
  color: #1e293b !important;
}

.input-modern :deep(.q-field__native::placeholder) {
  color: #9ca3af !important;
}

/* === Modern Button Styling === */
.btn-modern {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(62, 114, 175, 0.35);
}

.btn-modern-outline {
  border-radius: 12px !important;
  text-transform: none;
  transition: all 0.3s ease;
}

.btn-modern-outline:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* === Footer Contact === */
.footer-contact {
  padding-top: 0;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #1e293b;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 8px;
}

.contact-link:hover {
  background: rgba(37, 211, 102, 0.1);
  color: #25d366;
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .card {
    max-width: 90%;
    margin: 20px;
  }

  .logo-img {
    height: 60px;
    max-width: 140px;
  }

  .btn-modern {
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .card {
    max-width: 95%;
    margin: 15px;
    padding: 16px !important;
  }

  .logo-img {
    height: 50px;
    max-width: 120px;
  }

  .text-h5 {
    font-size: 1.1rem !important;
  }

  .btn-modern {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>

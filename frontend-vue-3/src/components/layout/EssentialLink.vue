<template>
  <q-item
    clickable
    v-ripple
    :active="routeName === cRouterName"
    active-class="text-primary text-bold active-main-menu-item"
    @click="navigateTo"
    class="q-mx-sm q-my-xs rounded-all sidebar-menu-item"
    :class="{ 'text-negative text-bolder': color === 'negative' }"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption> </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  routeName: {
    type: String,
    default: 'dashboard'
  },
  icon: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()

const cRouterName = computed(() => route.name)

const navigateTo = () => {
  if (props.routeName !== cRouterName.value) {
    router.push({ name: props.routeName })
  }
}
</script>

<style lang="sass">
.sidebar-menu-item
  transition: all 0.2s ease
  border-radius: 12px !important

  &:hover
    background: rgba(0, 0, 0, 0.03)

.active-main-menu-item
  background: rgba(var(--q-primary), 0.1) !important
  color: $primary !important
  
  &::before
    content: ''
    position: absolute
    left: 0
    top: 20%
    bottom: 20%
    width: 4px
    background: $primary
    border-radius: 0 4px 4px 0

body.body--dark .active-main-menu-item
  background: rgba(255, 255, 255, 0.05) !important
</style>

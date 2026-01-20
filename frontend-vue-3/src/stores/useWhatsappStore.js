
export const useWhatsappStore = defineStore('whatsapp', () => {
  const whatsapps = ref([])

  const activeWhatsapps = computed(() => whatsapps.value.filter(w => w.status === 'CONNECTED'))

  const whatsappById = computed(() => id => whatsapps.value.find(w => w.id === id))

  function setWhatsapps(data) {
    whatsapps.value = data
  }

  function addWhatsapp(whatsapp) {
    const exists = whatsapps.value.some(w => w.id === whatsapp.id)
    if (!exists) {
      whatsapps.value.push(whatsapp)
    }
  }

  function updateWhatsapp(whatsapp) {
    const idx = whatsapps.value.findIndex(w => w.id === whatsapp.id)
    if (idx !== -1) {
      whatsapps.value[idx] = { ...whatsapps.value[idx], ...whatsapp }
    }
  }

  function removeWhatsapp(id) {
    const idx = whatsapps.value.findIndex(w => w.id === id)
    if (idx !== -1) {
      whatsapps.value.splice(idx, 1)
    }
  }

  function updateSession(session) {
    const idx = whatsapps.value.findIndex(w => String(w.id) === String(session.id))
    if (idx !== -1) {
      // Substituição completa do objeto para garantir reatividade total do Vue 3
      const updatedWhatsapp = { ...whatsapps.value[idx], ...session }
      whatsapps.value[idx] = updatedWhatsapp
      // Opcional: trigger manual se o array não reagir
      whatsapps.value = [...whatsapps.value]
    }
  }

  return {
    whatsapps,
    activeWhatsapps,
    whatsappById,
    setWhatsapps,
    addWhatsapp,
    updateWhatsapp,
    removeWhatsapp,
    updateSession
  }
})

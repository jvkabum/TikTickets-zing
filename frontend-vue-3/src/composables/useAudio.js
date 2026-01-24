import { ref } from 'vue'

/**
 * Composable para gerenciar gravação e reprodução de áudio
 */
export function useAudio () {
    const isRecording = ref(false)
    const isPaused = ref(false)
    const recordingTime = ref(0)
    const audioBlob = ref(null)
    const audioUrl = ref(null)

    let recorder = null
    let timerInterval = null

    /**
     * Inicializa o gravador de áudio (carrega dinamicamente para evitar erro com lamejs)
     */
    const initRecorder = async () => {
        try {
            const MicRecorder = (await import('mic-recorder-to-mp3')).default
            recorder = new MicRecorder({
                bitRate: 128
            })
        } catch (error) {
            console.error('Erro ao carregar MicRecorder:', error)
            throw error
        }
    }

    /**
     * Inicia a gravação de áudio
     */
    const startRecording = async () => {
        try {
            if (!recorder) await initRecorder()

            await recorder.start()
            isRecording.value = true
            isPaused.value = false
            recordingTime.value = 0

            timerInterval = setInterval(() => {
                recordingTime.value++
            }, 1000)

            return true
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error)
            return false
        }
    }

    /**
     * Para a gravação e retorna o blob de áudio
     */
    const stopRecording = async () => {
        try {
            if (!recorder || !isRecording.value) return null

            clearInterval(timerInterval)

            const [buffer, blob] = await recorder.stop().getMp3()
            audioBlob.value = blob
            audioUrl.value = URL.createObjectURL(blob)
            isRecording.value = false
            isPaused.value = false

            return {
                blob,
                url: audioUrl.value,
                duration: recordingTime.value
            }
        } catch (error) {
            console.error('Erro ao parar gravação:', error)
            isRecording.value = false
            return null
        }
    }

    /**
     * Cancela a gravação atual
     */
    const cancelRecording = () => {
        if (recorder && isRecording.value) {
            clearInterval(timerInterval)
            recorder.stop()
            isRecording.value = false
            isPaused.value = false
            recordingTime.value = 0
            audioBlob.value = null
            audioUrl.value = null
        }
    }

    /**
     * Formata o tempo de gravação para exibição (MM:SS)
     */
    const formattedTime = () => {
        const minutes = Math.floor(recordingTime.value / 60)
        const seconds = recordingTime.value % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    /**
     * Reproduz um áudio a partir de uma URL
     */
    const playAudio = (url) => {
        const audio = new Audio(url)
        audio.play()
        return audio
    }

    /**
     * Reproduz o som de notificação
     */
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sound.mp3')
            audio.volume = 0.5
            audio.play()
        } catch (error) {
            console.error('Erro ao reproduzir som de notificação:', error)
        }
    }

    /**
     * Limpa recursos de áudio
     */
    const cleanup = () => {
        if (audioUrl.value) {
            URL.revokeObjectURL(audioUrl.value)
        }
        cancelRecording()
    }

    return {
        // Estado reativo
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        audioUrl,
        // Métodos
        initRecorder,
        startRecording,
        stopRecording,
        cancelRecording,
        formattedTime,
        playAudio,
        playNotificationSound,
        cleanup
    }
}

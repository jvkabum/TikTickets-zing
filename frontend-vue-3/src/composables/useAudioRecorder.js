import { ref } from 'vue'
import { notificarErro } from 'src/utils/helpersNotifications'

let Mp3Recorder = null

export function useAudioRecorder() {
    const isRecording = ref(false)
    const isLoading = ref(false)

    const startRecording = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })

            // Lazy load MicRecorder para evitar erro com lamejs
            if (!Mp3Recorder) {
                const MicRecorder = (await import('mic-recorder-to-mp3')).default
                Mp3Recorder = new MicRecorder({ bitRate: 128 })
            }

            await Mp3Recorder.start()
            isRecording.value = true
            return true
        } catch (e) {
            console.error('Erro ao iniciar gravação:', e)
            notificarErro('Erro ao acessar microfone')
            return false
        }
    }

    const stopRecording = async () => {
        if (!Mp3Recorder || !isRecording.value) return null

        isLoading.value = true
        try {
            const [, blob] = await Mp3Recorder.stop().getMp3()
            isRecording.value = false

            if (blob.size < 1000) {
                return null // Áudio muito curto
            }

            return blob
        } catch (e) {
            console.error('Erro ao parar gravação:', e)
            notificarErro('Erro ao processar áudio')
            return null
        } finally {
            isLoading.value = false
        }
    }

    const cancelRecording = () => {
        if (Mp3Recorder && isRecording.value) {
            Mp3Recorder.stop()
            isRecording.value = false
        }
    }

    return {
        isRecording,
        isLoading,
        startRecording,
        stopRecording,
        cancelRecording
    }
}

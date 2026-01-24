import { ref } from 'vue'

/**
 * Composable para gerenciar upload de arquivos
 */
export function useFileUpload () {
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const previewUrl = ref(null)
    const selectedFile = ref(null)
    const error = ref(null)

    // Tipos de arquivo permitidos por categoria
    const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/webm', 'video/ogg'],
        audio: ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav'],
        document: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ]
    }

    // Limite de tamanho por tipo (em bytes)
    const maxSizes = {
        image: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024, // 50MB
        audio: 20 * 1024 * 1024, // 20MB
        document: 25 * 1024 * 1024 // 25MB
    }

    /**
     * Determina o tipo de arquivo baseado no MIME type
     */
    const getFileCategory = (mimeType) => {
        for (const [category, types] of Object.entries(allowedTypes)) {
            if (types.includes(mimeType)) {
                return category
            }
        }
        return null
    }

    /**
     * Valida um arquivo antes do upload
     */
    const validateFile = (file) => {
        error.value = null

        if (!file) {
            error.value = 'Nenhum arquivo selecionado'
            return false
        }

        const category = getFileCategory(file.type)
        if (!category) {
            error.value = 'Tipo de arquivo não permitido'
            return false
        }

        if (file.size > maxSizes[category]) {
            const maxMB = maxSizes[category] / (1024 * 1024)
            error.value = `Arquivo muito grande. Máximo permitido: ${maxMB}MB`
            return false
        }

        return true
    }

    /**
     * Seleciona um arquivo e gera preview se for imagem
     */
    const selectFile = (file) => {
        if (!validateFile(file)) {
            return false
        }

        selectedFile.value = file

        // Gerar preview para imagens
        if (file.type.startsWith('image/')) {
            previewUrl.value = URL.createObjectURL(file)
        } else {
            previewUrl.value = null
        }

        return true
    }

    /**
     * Cria um FormData para envio
     */
    const createFormData = (additionalData = {}) => {
        if (!selectedFile.value) return null

        const formData = new FormData()
        formData.append('medias', selectedFile.value)
        formData.append('body', selectedFile.value.name)
        formData.append('fromMe', true)

        // Adicionar dados extras
        for (const [key, value] of Object.entries(additionalData)) {
            formData.append(key, value)
        }

        return formData
    }

    /**
     * Limpa o arquivo selecionado
     */
    const clearFile = () => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
        }
        selectedFile.value = null
        previewUrl.value = null
        uploadProgress.value = 0
        error.value = null
    }

    /**
     * Obtém o ícone apropriado para o tipo de arquivo
     */
    const getFileIcon = (file) => {
        if (!file) return 'mdi-file'

        const category = getFileCategory(file.type)
        const icons = {
            image: 'mdi-image',
            video: 'mdi-video',
            audio: 'mdi-music',
            document: 'mdi-file-document'
        }
        return icons[category] || 'mdi-file'
    }

    /**
     * Formata o tamanho do arquivo para exibição
     */
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return {
        // Estado
        uploading,
        uploadProgress,
        previewUrl,
        selectedFile,
        error,
        // Métodos
        validateFile,
        selectFile,
        createFormData,
        clearFile,
        getFileIcon,
        getFileCategory,
        formatFileSize
    }
}

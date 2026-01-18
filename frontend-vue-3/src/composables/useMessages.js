import { parseISO } from 'date-fns'
import { orderBy } from 'lodash'

/**
 * Composable para manipulação e formatação de mensagens
 */
export function useMessages() {
    /**
     * Ordena mensagens por timestamp (mais antigas primeiro)
     */
    const orderMessages = (messages) => {
        return orderBy(messages, obj => parseISO(obj.timestamp || obj.createdAt), ['asc'])
    }

    /**
     * Ordena tickets por última mensagem (mais recentes primeiro)
     */
    const orderTickets = (tickets) => {
        return orderBy(tickets, obj => parseISO(obj.lastMessageAt || obj.updatedAt), ['desc'])
    }

    /**
     * Formata mensagem do WhatsApp (negrito, itálico, riscado)
     */
    const formatarMensagemWhatsapp = (body) => {
        if (!body) return ''

        const isAlphanumeric = (c) => {
            const x = c.charCodeAt(0)
            return (x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)
        }

        const applyStyle = (text, wildcard, opTag, clTag) => {
            const indices = []
            for (let i = 0; i < text.length; i++) {
                if (text[i] === wildcard) {
                    if (indices.length % 2) {
                        if (text[i - 1] !== ' ') {
                            if (typeof text[i + 1] === 'undefined' || !isAlphanumeric(text[i + 1])) {
                                indices.push(i)
                            }
                        }
                    } else {
                        if (typeof text[i + 1] !== 'undefined' && text[i + 1] !== ' ') {
                            if (typeof text[i - 1] === 'undefined' || !isAlphanumeric(text[i - 1])) {
                                indices.push(i)
                            }
                        }
                    }
                } else if (text[i].charCodeAt(0) === 10 && indices.length % 2) {
                    indices.pop()
                }
            }

            if (indices.length % 2) indices.pop()

            let e = 0
            let result = text
            indices.forEach((v, i) => {
                const t = i % 2 ? clTag : opTag
                const pos = v + e
                result = result.substr(0, pos) + t + result.substr(pos + 1)
                e += t.length - 1
            })
            return result
        }

        let formatted = body
        formatted = applyStyle(formatted, '_', '<i>', '</i>')
        formatted = applyStyle(formatted, '*', '<b>', '</b>')
        formatted = applyStyle(formatted, '~', '<s>', '</s>')
        formatted = formatted.replace(/\n/gi, '<br>')

        return formatted
    }

    /**
     * Trunca uma mensagem para exibição em preview
     */
    const truncateMessage = (message, maxLength = 50) => {
        if (!message) return ''
        if (message.length <= maxLength) return message
        return message.substring(0, maxLength) + '...'
    }

    /**
     * Verifica se a mensagem é de mídia
     */
    const isMediaMessage = (message) => {
        const mediaTypes = ['image', 'audio', 'video', 'document', 'sticker', 'ptt']
        return mediaTypes.includes(message?.mediaType)
    }

    /**
     * Obtém o ícone apropriado para o tipo de mídia
     */
    const getMediaIcon = (mediaType) => {
        const icons = {
            image: 'mdi-image',
            audio: 'mdi-microphone',
            video: 'mdi-video',
            document: 'mdi-file-document',
            sticker: 'mdi-sticker-emoji',
            ptt: 'mdi-microphone',
            location: 'mdi-map-marker',
            vcard: 'mdi-card-account-details'
        }
        return icons[mediaType] || 'mdi-file'
    }

    /**
     * Obtém o texto de preview para mensagens de mídia
     */
    const getMediaPreviewText = (message) => {
        const types = {
            image: '📷 Imagem',
            audio: '🎵 Áudio',
            video: '🎬 Vídeo',
            document: '📄 Documento',
            sticker: '🎨 Sticker',
            ptt: '🎤 Áudio',
            location: '📍 Localização',
            vcard: '👤 Contato'
        }
        return types[message?.mediaType] || message?.body || ''
    }

    /**
     * Verifica se a mensagem é do próprio usuário
     */
    const isFromMe = (message) => {
        return message?.fromMe === true
    }

    /**
     * Agrupa mensagens por data
     */
    const groupMessagesByDate = (messages) => {
        const groups = {}
        messages.forEach(msg => {
            const date = new Date(msg.timestamp || msg.createdAt).toLocaleDateString('pt-BR')
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(msg)
        })
        return groups
    }

    return {
        orderMessages,
        orderTickets,
        formatarMensagemWhatsapp,
        truncateMessage,
        isMediaMessage,
        getMediaIcon,
        getMediaPreviewText,
        isFromMe,
        groupMessagesByDate
    }
}

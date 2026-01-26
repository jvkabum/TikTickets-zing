import { nextTick } from 'vue'

export default function useEmoji() {
    /**
     * Insere um emoji na posição atual do cursor em um input ou textarea.
     * 
     * @param {Object|String} emoji O objeto emoji do picker ou string direta.
     * @param {Object} inputRef Referência reativa para o componente input (Quasar ou HTML nativo).
     * @param {String} currentValue O valor atual do texto no input.
     * @param {Function} callbackUpdate Função de callback para atualizar o valor (ex: emit ou setValues do vee-validate).
     * @returns {void}
     */
    const insertEmoji = (emoji, inputRef, currentValue, callbackUpdate) => {
        if (!inputRef) return

        // Tenta obter o elemento nativo, seja de um componente Quasar ou ref direta
        const el = inputRef.nativeEl || (inputRef.$refs && inputRef.$refs.input) || inputRef
        if (!el) {
            console.warn('useEmoji: Elemento nativo de input não encontrado.')
            return
        }

        // Extrai o caractere universalmente
        const char = emoji.i || emoji.data || (typeof emoji === 'string' ? emoji : '')
        if (!char) return

        // Obtém posições do cursor
        const startPos = el.selectionStart || 0
        const endPos = el.selectionEnd || 0
        const tmpStr = currentValue || ''

        // Constrói o novo texto
        const newValue = tmpStr.substring(0, startPos) + char + tmpStr.substring(endPos)

        // Atualiza o valor pai
        if (callbackUpdate) {
            callbackUpdate(newValue)
        }

        // Restaura o foco e posição do cursor
        nextTick(() => {
            el.focus()
            // Alguns browsers precisam de um pequeno delay ou double tick, mas geralmente nextTick basta
            el.setSelectionRange(startPos + char.length, startPos + char.length)
        })
    }

    return {
        insertEmoji
    }
}

import { boot } from 'quasar/wrappers'

export default boot(async () => {
    // Injectamos as classes do lamejs no escopo global
    // Isso é necessário porque o mic-recorder-to-mp3 as procura globalmente
    // ou via require('lamejs') que falha no Vite sem esse shim
    if (typeof window !== 'undefined') {
        const checkLame = () => {
            const lame = window.lamejs
            if (lame) {
                // Injetamos as classes no global. O lameGlobals no index.html já preparou o terreno.
                const globals = ['Lame', 'Presets', 'GainAnalysis', 'QuantizePVT', 'Quantize', 'Takehiro', 'Reservoir', 'MPEGMode', 'BitStream', 'VbrMode', 'Float', 'Arrays', 'System', 'Util', 'ShortBlock', 'WavHeader'];
                globals.forEach(g => {
                    if (lame[g]) window[g] = lame[g];
                });

                // Mapeamento extra caso o lamejs global seja o objeto exportado
                Object.keys(lame).forEach(key => {
                    if (!window[key]) window[key] = lame[key];
                });

                console.log('🎙️ LameJS Audio engine fully mapped to global scope.')
                return true
            }
            return false
        }

        if (!checkLame()) {
            const interval = setInterval(() => {
                if (checkLame()) clearInterval(interval)
            }, 100)
            setTimeout(() => clearInterval(interval), 5000)
        }
    }
})

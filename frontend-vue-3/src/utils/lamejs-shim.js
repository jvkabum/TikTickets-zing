// Shim para o Vite resolver 'lamejs' usando o objeto global carregado no index.html
const lame = window.lamejs || {}
export default lame
export const Mp3Encoder = lame.Mp3Encoder || window.Mp3Encoder
export const WavHeader = lame.WavHeader || window.WavHeader
export const Lame = lame.Lame || window.Lame
export const Presets = lame.Presets || window.Presets
export const MPEGMode = lame.MPEGMode || window.MPEGMode
export const BitStream = lame.BitStream || window.BitStream
export const GainAnalysis = lame.GainAnalysis || window.GainAnalysis

/**
 * Sound Manager — Local notification sounds using Web Audio API
 * No external CDN dependency. Generates sounds programmatically.
 */

const AudioContextClass = window.AudioContext || window.webkitAudioContext
let audioContext = null

function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContextClass()
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => { })
    }
    return audioContext
}

/**
 * Play a pleasant notification beep (for new orders)
 */
export function playNewOrderSound() {
    try {
        const audio = new Audio('/sounds/mixkit-human-male-enjoy-humm-129.wav')

        // Try to play the custom sound
        audio.play().catch(err => {
            // If browser blocks autoplay or file fails, fallback to synth beep
            if (import.meta.env.DEV) console.warn('Custom notification sound failed, falling back to synth beep:', err)
            playSynthBeep()
        })
    } catch (e) {
        // Silent fail — audio not critical
    }
}

/**
 * Fallback synth beep if the custom audio fails to play
 */
function playSynthBeep() {
    try {
        const ctx = getAudioContext()
        const now = ctx.currentTime

        // Two-tone ascending chime
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = freq
            gain.gain.setValueAtTime(0, now + i * 0.15)
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now + i * 0.15)
            osc.stop(now + i * 0.15 + 0.5)
        })
    } catch (e) {
        // Silent fail — audio not critical
    }
}

/**
 * Play an alert/warning beep (for cancelled orders)
 */
export function playCancelledOrderSound() {
    try {
        const ctx = getAudioContext()
        const now = ctx.currentTime

        // Descending two-tone alert
        const frequencies = [600, 400]
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.value = freq
            gain.gain.setValueAtTime(0, now + i * 0.2)
            gain.gain.linearRampToValueAtTime(0.35, now + i * 0.2 + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.35)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now + i * 0.2)
            osc.stop(now + i * 0.2 + 0.4)
        })
    } catch (e) {
        // Silent fail
    }
}

export default { playNewOrderSound, playCancelledOrderSound }

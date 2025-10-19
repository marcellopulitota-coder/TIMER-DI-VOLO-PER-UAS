
// Base64 decoding function
function decode(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Decode raw PCM audio data into an AudioBuffer
async function decodePcmAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const playAudioFromBase64 = async (audioContext: AudioContext, base64String: string): Promise<void> => {
    try {
        const decodedData = decode(base64String);
        // Gemini TTS provides 24000Hz mono audio
        const audioBuffer = await decodePcmAudioData(decodedData, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
    }
};

export const playBeep = (audioContext: AudioContext, frequency = 880, duration = 100): void => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Lower volume to be less jarring
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
};

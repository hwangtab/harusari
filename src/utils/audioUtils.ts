// Audio utility functions for retro sound effects

export const createNoiseBuffer = (audioContext: AudioContext, duration: number = 0.5): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < frameCount; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3; // Volume at 30%
  }

  return buffer;
};

export const createGlitchBuffer = (audioContext: AudioContext, duration: number = 0.3): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate glitchy digital noise
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const freq = 100 + Math.sin(t * 50) * 200; // Varying frequency
    const glitch = Math.random() > 0.7 ? (Math.random() * 2 - 1) : 0; // Random glitches
    data[i] = (Math.sin(t * freq * 2 * Math.PI) * 0.2) + (glitch * 0.1);
  }

  return buffer;
};

export const playTrashSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
    const buffer = createNoiseBuffer(audioContext, 0.2);
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    // Quick fade in/out to prevent clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.19);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + 0.2);
    
  } catch {
    console.log('Audio not supported or blocked by browser policy');
  }
};

export const playGlitchSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as typeof AudioContext))();
    const buffer = createGlitchBuffer(audioContext, 0.15);
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.14);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + 0.15);
    
  } catch {
    console.log('Audio not supported or blocked by browser policy');
  }
};
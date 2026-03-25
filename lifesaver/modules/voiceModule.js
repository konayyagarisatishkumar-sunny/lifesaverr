/**
 * voiceModule.js
 * Handles text-to-speech using the Web Speech API (SpeechSynthesis).
 * Reads emergency step instructions aloud to the user.
 */

let synth = window.speechSynthesis;
let currentUtterance = null;
let isSpeaking = false;

/**
 * Speaks the given text aloud using SpeechSynthesis.
 * @param {string} text - The text to speak.
 * @param {object} [options] - Optional TTS options
 * @param {number} [options.rate=0.9] - Speech rate (0.1 to 10)
 * @param {number} [options.pitch=1] - Speech pitch (0 to 2)
 * @param {number} [options.volume=1] - Volume (0 to 1)
 * @param {Function} [options.onEnd] - Callback when speech ends
 */
export function speak(text, options = {}) {
  if (!synth) {
    console.warn('[Voice] Web Speech API not supported in this browser.');
    return;
  }

  // Stop any current speech before starting new one
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  utterance.lang = 'en-US';

  // Pick a clear voice if available
  const voices = synth.getVoices();
  const preferred = voices.find(
    (v) => v.lang === 'en-US' && v.name.toLowerCase().includes('female')
  ) || voices.find((v) => v.lang === 'en-US') || voices[0];

  if (preferred) utterance.voice = preferred;

  utterance.onstart = () => {
    isSpeaking = true;
  };

  utterance.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.error('[Voice] Speech error:', e.error);
    isSpeaking = false;
  };

  currentUtterance = utterance;
  synth.speak(utterance);
}

/**
 * Stops the currently speaking audio immediately.
 */
export function stopSpeech() {
  if (synth && synth.speaking) {
    synth.cancel();
    isSpeaking = false;
    currentUtterance = null;
  }
}

/**
 * Returns whether audio is currently playing.
 * @returns {boolean}
 */
export function isSpeechActive() {
  return isSpeaking;
}

/**
 * Reads a full emergency data object aloud in sequence.
 * Reads steps, what to do, and what not to do.
 * @param {object} emergencyData - The loaded emergency JSON data
 * @param {HTMLElement} btn - The button element to update state
 */
export function readEmergencyInstructions(emergencyData, btn) {
  if (!emergencyData) return;

  if (isSpeaking) {
    stopSpeech();
    if (btn) {
      btn.innerHTML = '<span class="mr-2">🔊</span> Read Instructions';
      btn.classList.remove('speaking');
    }
    return;
  }

  if (btn) {
    btn.innerHTML = '<span class="mr-2">🔇</span> Stop Reading';
    btn.classList.add('speaking');
  }

  // Build full speech text from the emergency data
  const lines = [
    `${emergencyData.title} First Aid Instructions.`,
    `Summary: ${emergencyData.summary}`,
    `Steps:`,
    ...emergencyData.steps.map((step, i) => `Step ${i + 1}: ${step}`),
    `What to do:`,
    ...emergencyData.what_to_do,
    `What NOT to do:`,
    ...emergencyData.what_not_to_do,
    `When to call an ambulance:`,
    ...emergencyData.when_to_call_ambulance,
  ];

  const fullText = lines.join('. ');

  speak(fullText, {
    rate: 0.88,
    onEnd: () => {
      if (btn) {
        btn.innerHTML = '<span class="mr-2">🔊</span> Read Instructions';
        btn.classList.remove('speaking');
      }
    },
  });
}

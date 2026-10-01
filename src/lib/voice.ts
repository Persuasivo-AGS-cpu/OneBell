// Voz en español de México con la síntesis del navegador. Si no existe, no hace nada.
export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-MX";
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").toLowerCase() === "es-mx") ?? synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("es"));
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch { /* sin voz */ }
}
export const stopSpeaking = () => { try { window.speechSynthesis?.cancel(); } catch { /* sin voz */ } };

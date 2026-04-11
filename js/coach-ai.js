// --- PHASE 2.1: HEAD COACH CHAT & VOICE API ---
window.coachSpeak = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let msg = new SpeechSynthesisUtterance(text);
        
        let voices = window.speechSynthesis.getVoices();
        let femaleVoice = voices.find(v => 
            v.name.includes("Samantha") || 
            v.name.includes("Victoria") || 
            v.name.includes("Karen") || 
            (v.name.includes("Female") && v.lang.startsWith("en")) ||
            (v.name.includes("Siri") && !v.name.includes("Male"))
        );
        
        if (femaleVoice) {
            msg.voice = femaleVoice;
        }
        
        msg.rate = 1.05; 
        msg.pitch = 1.25; 
        msg.lang = 'en-US';
        // Audio apagado por solicitud del Jefe de Operaciones 
        // window.speechSynthesis.speak(msg);
    }
};

window.openHeadCoachChat = function() {
    let modal = document.getElementById('coach-chat-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'coach-chat-modal';
        modal.className = 'chat-modal';
        modal.innerHTML = `
            <div class="chat-modal-content">
                <div class="chat-header">
                    <button onclick="document.getElementById('coach-chat-modal').style.display='none'" style="background:none;border:none;color:white;cursor:pointer;padding:8px;"><i data-lucide="chevron-down"></i></button>
                    <div class="coach-avatar"><i data-lucide="shield"></i></div>
                    <div>
                        <h3 style="color:white; font-size:16px; font-weight:800; margin:0;">HEAD COACH</h3>
                        <span style="color:var(--accent-color); font-size:12px; font-weight:600;">ACTIVE</span>
                    </div>
                </div>
                <div class="chat-messages" id="chat-history">
                    <div class="msg-bubble msg-coach">
                        I am your Senior Trainer. Focus on form, respect the iron, and don't skip your rests. How is your CNS feeling today?
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="chat-input-msg" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') window.sendCoachMsg()">
                    <button class="voice-btn" onclick="window.sendCoachMsg()"><i data-lucide="mic" style="width:20px;height:20px;"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
    modal.style.display = 'flex';
};

window.generateCoachResponse = function(text) {
    let t = text.toLowerCase();
    if(t.includes("dieta") || t.includes("comer") || t.includes("eat") || t.includes("food") || t.includes("diet") || t.includes("protein")) {
        return "Nutrition is 80% of the game. Eat in a slight caloric surplus with 1.6g of protein per kg of bodyweight to build mass. Hydrate properly before our next session.";
    } else if(t.includes("duele") || t.includes("pain") || t.includes("lesion") || t.includes("hurt") || t.includes("sore")) {
        return "Stop immediately if you feel sharp pain. Check your form tracking. Muscle soreness (DOMS) is normal, but joint pain means you need to rest and stretch.";
    } else if(t.includes("dias") || t.includes("days") || t.includes("progreso") || t.includes("resultados") || t.includes("results")) {
        return "Train 3-4 days a week with maximum intensity. Consistency builds iron. Your Central Nervous System needs 48 hours to recover between heavy blocks.";
    } else if(t.includes("pecho") || t.includes("chest") || t.includes("brazo") || t.includes("biceps") || t.includes("arms")) {
        return "We do full-body explosive movements here, but to isolate arms and chest, add push-ups and strictly controlled rows. Respect the tension.";
    } else if(t.includes("hola") || t.includes("hello") || t.includes("hi")) {
        return "I am ready when you are. Focus on your breathing and let's get to work.";
    }
    return "I am your Senior Trainer. Keep your focus sharp, don't skip rests, and track your metrics. What else do you need?";
};

window.sendCoachMsg = function() {
    let input = document.getElementById('chat-input-msg');
    let text = input.value.trim();
    if(!text) return;
    
    let history = document.getElementById('chat-history');
    history.innerHTML += \`<div class="msg-bubble msg-user">\${text}</div>\`;
    input.value = '';
    
    setTimeout(() => {
        let response = window.generateCoachResponse(text);
        history.innerHTML += \`<div class="msg-bubble msg-coach">\${response}</div>\`;
        history.scrollTop = history.scrollHeight;
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        // Audio apagado por solicitud del Jefe de Operaciones 
        // window.coachSpeak(response);
    }, 1000);
    history.scrollTop = history.scrollHeight;
};

import sys

with open('app.js', 'r') as f:
    content = f.read()

# 1. Inject FAB into renderHome
target_home = """        quickStatsHTML + heroCardHTML + horizontalCardsHTML + progressHTML +
    '</div>';

    lucide.createIcons();
}"""

replacement_home = """        quickStatsHTML + heroCardHTML + horizontalCardsHTML + progressHTML +
    '</div>' +
    '<button class="fab-coach" onclick="window.openHeadCoachChat()">' +
        '<i data-lucide="message-circle" style="width: 28px; height: 28px; color: white;"></i>' +
    '</button>';

    lucide.createIcons();
}"""

if target_home in content:
    content = content.replace(target_home, replacement_home)
else:
    print("Failed to patch renderHome")
    sys.exit(1)


# 2. Append Chat Logic and Voice API
chat_logic = """

// --- PHASE 2.1: HEAD COACH CHAT & VOICE API ---
window.coachSpeak = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let msg = new SpeechSynthesisUtterance(text);
        msg.rate = 1.0;
        msg.pitch = 0.9;
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
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
        lucide.createIcons();
    }
    modal.style.display = 'flex';
};

window.sendCoachMsg = function() {
    let input = document.getElementById('chat-input-msg');
    let text = input.value.trim();
    if(!text) return;
    
    let history = document.getElementById('chat-history');
    history.innerHTML += `<div class="msg-bubble msg-user">${text}</div>`;
    input.value = '';
    
    setTimeout(() => {
        history.innerHTML += `<div class="msg-bubble msg-coach">Stop immediately if you feel sharp pain. Check your hip hinge tracking. Focus on recovery and let's switch to Glute Bridges to activate the CNS.</div>`;
        history.scrollTop = history.scrollHeight;
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 1000);
    history.scrollTop = history.scrollHeight;
};
"""

content += chat_logic


# 3. Rewrite renderWorkoutPlayer logic for Rest Phase
# The easiest way to rewrite the rest logic is to replace the generic "onclick='window.renderWorkoutPlayer(blockIndex + 1)'" of the COMPLETE SET button.

target_btn = """onclick="' + 
                (blockIndex + 1 === totalBlocks ? 'window.finishWorkoutSession()' : ('window.renderWorkoutPlayer(' + (blockIndex + 1) + ')')) + '">' +
                '<i data-lucide="check-circle" style="width: 24px; height: 24px; stroke-width: 2.5;"></i> ' + (blockIndex + 1 === totalBlocks ? 'FINISH WORKOUT' : 'COMPLETE SET') +
            '</button>'"""

replacement_btn = """onclick="' + 
                (blockIndex + 1 === totalBlocks ? 'window.finishWorkoutSession()' : ('window.startRestPhase(' + blockIndex + ', ' + parseInt((b.rest || "45").replace("s","")) + ')')) + '">' +
                '<i data-lucide="check-circle" style="width: 24px; height: 24px; stroke-width: 2.5;"></i> ' + (blockIndex + 1 === totalBlocks ? 'FINISH WORKOUT' : 'COMPLETE SET') +
            '</button>'"""

if target_btn in content:
    content = content.replace(target_btn, replacement_btn)
else:
    print("Failed to patch COMPLETE SET button")
    sys.exit(1)


# 4. Inject Rest Phase logic
rest_logic = """

window.workoutTimerInterval = null;

window.startRestPhase = function(blockIndex, restSeconds) {
    let todaysWorkout = state.currentProgram?.workouts?.[0];
    let nextExName = todaysWorkout.blocks[blockIndex+1].exercise;
    let exercisesDB = state.routinesDB ? state.routinesDB.exercises : null;
    if(exercisesDB && exercisesDB[nextExName]) nextExName = exercisesDB[nextExName].name;
    
    window.coachSpeak("Set completed. Rest for " + restSeconds + " seconds. Up next: " + nextExName);
    
    mainContent.innerHTML = `
        <div class="page hide-scrollbar" style="height: 100%; display: flex; flex-direction: column; background: #0A0F0E; color: #FFF;">
            <header style="display:flex; justify-content:flex-end; padding: calc(var(--spacing-lg) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md);">
                <button onclick="window.renderWorkoutPlayer(${blockIndex + 1})" style="background:rgba(255,255,255,0.1); border:none; padding:10px 20px; border-radius:20px; color:white; font-weight:700;">Skip Rest</button>
            </header>
            
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <h3 style="color:rgba(255,255,255,0.5); font-size:18px; text-transform:uppercase; letter-spacing:2px; margin-bottom:40px;">Recovery Phase</h3>
                
                <div style="width: 240px; height: 240px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.4); box-shadow: 0 0 60px rgba(234,99,44,0.15); position: relative;">
                   <svg width="240" height="240" style="position: absolute; top: 0; left: 0; transform: rotate(-90deg);"><circle cx="120" cy="120" r="114" stroke="rgba(255,255,255,0.05)" stroke-width="12" fill="none"></circle><circle id="rest-timer-circle" cx="120" cy="120" r="114" stroke="var(--accent-color)" stroke-width="12" fill="none" stroke-dasharray="716" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear; stroke-linecap: round;"></circle></svg>
                   <span id="rest-timer-text" style="font-size: 72px; font-weight: 900; color: var(--accent-color); font-variant-numeric: tabular-nums; text-shadow: 0 2px 20px rgba(234,99,44,0.4);">${restSeconds}</span>
                </div>
                
                <div style="margin-top:40px; text-align:center;">
                    <p style="color:var(--text-tertiary); font-size:14px; text-transform:uppercase; font-weight:700; margin-bottom:8px;">Up Next</p>
                    <h2 style="font-size:24px; font-weight:800; color:white;">${nextExName}</h2>
                </div>
            </div>
            
            <button class="fab-coach" onclick="window.openHeadCoachChat()" style="position:absolute; bottom:40px; right:20px;">
                <i data-lucide="shield-alert" style="width: 28px; height: 28px; color: white;"></i>
            </button>
        </div>
    `;
    lucide.createIcons();
    
    let timeLeft = restSeconds;
    let initialDash = 716; // 2 * PI * 114
    let circle = document.getElementById("rest-timer-circle");
    let textNode = document.getElementById("rest-timer-text");
    
    if(window.workoutTimerInterval) clearInterval(window.workoutTimerInterval);
    
    window.workoutTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            textNode.innerText = timeLeft;
            circle.style.strokeDashoffset = initialDash - (timeLeft / restSeconds) * initialDash;
            
            if (timeLeft === 3) window.coachSpeak("3");
            if (timeLeft === 2) window.coachSpeak("2");
            if (timeLeft === 1) window.coachSpeak("1");
            
            if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) {
                if (navigator.vibrate) navigator.vibrate(200);
                window.playBeep(440, 'sine', 0.1, 0.5);
            }
        } else {
            clearInterval(window.workoutTimerInterval);
            if(navigator.vibrate) navigator.vibrate([300, 100, 300]);
            window.playBeep(880, 'square', 0.3, 0.5);
            window.coachSpeak("Go!");
            window.renderWorkoutPlayer(blockIndex + 1);
        }
    }, 1000);
};
"""
content += rest_logic

with open('app.js', 'w') as f:
    f.write(content)

print("Patch applied.")

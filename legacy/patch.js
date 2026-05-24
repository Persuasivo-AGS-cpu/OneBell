window.showInfoModal = function(exerciseId) {
    let exercisesDB = state.routinesDB ? state.routinesDB.exercises : null;
    let ex = exercisesDB && exercisesDB[exerciseId] ? exercisesDB[exerciseId] : { name: exerciseId, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400' };
    
    let instructionsHTML = ex.instructions ? ex.instructions.map(i => '<li style="margin-bottom:8px;">' + i + '</li>').join('') : '<li>Mantén una postura firme.</li><li>Ejecuta el movimiento con control.</li>';
    let mistakesHTML = ex.mistakes ? ex.mistakes.map(m => '<li style="margin-bottom:8px;">' + m + '</li>').join('') : '<li>Perder la tensión del core.</li>';

    let mediaHTML = "";
    if (ex.frames && ex.frames.length >= 3) {
        mediaHTML = '<div class="stop-motion-container">' +
            '<img src="' + ex.frames[0] + '" class="stop-motion-frame frame-1-of-3">' +
            '<img src="' + ex.frames[1] + '" class="stop-motion-frame frame-2-of-3">' +
            '<img src="' + ex.frames[2] + '" class="stop-motion-frame frame-3-of-3">' +
        '</div>';
    } else {
         mediaHTML = '<div style="width: 100%; height: 200px; border-radius: 12px; margin-bottom: 24px; background: url(' + ex.img + ') center/cover; position: relative;"></div>';
    }

    let infoModalHTML = '<div id="info-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px); display: flex;">' +
        '<div style="background: #111A18; border-radius: 20px; padding: 32px 24px; width: 100%; max-width: 400px; max-height: 80vh; overflow-y: auto; position: relative; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">' +
            '<button onclick="document.body.removeChild(document.getElementById(&apos;info-modal&apos;))" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: none; width: 32px; height: 32px; border-radius: 50%; color: white; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: background 0.2s; z-index: 2;"><i data-lucide="x" style="width:18px;height:18px;"></i></button>' +
            mediaHTML +
            '<h3 style="color: var(--accent-color); font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 8px;">Instrucciones</h3>' +
            '<h2 style="color: #FFF; font-size: 26px; font-weight: 800; margin-bottom: 20px; letter-spacing: -0.5px;">' + ex.name + '</h2>' +
            '<div style="color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.6; margin-bottom: 32px;">' +
                '<ul style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px;">' + instructionsHTML + '</ul>' +
            '</div>' +
            '<h3 style="color: #ff453a; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 12px;">Errores Comunes</h3>' +
            '<div style="color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.6;">' +
                '<ul style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px;">' + mistakesHTML + '</ul>' +
            '</div>' +
        '</div>' +
    '</div>';

    let existingModal = document.getElementById('info-modal');
    if (existingModal) document.body.removeChild(existingModal);
    
    document.body.insertAdjacentHTML('beforeend', infoModalHTML);
    lucide.createIcons();
};

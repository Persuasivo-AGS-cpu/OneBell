// Initialize icons
lucide.createIcons();

window.generateAlgorithmicProgram = function(profile, exerciseDB) {
    let levelMap = { 'beginner': 'Beginner', 'intermediate': 'Intermediate', 'advanced': 'Advanced'};
    let targetLevel = levelMap[profile.experience] || 'Beginner';
    
    let eligible = Object.keys(exerciseDB).filter(exKey => {
        let ex = exerciseDB[exKey];
        if(ex.name.toLowerCase().includes('double') && !profile.hasDoubleKettlebells) return false;
        
        let levMatch = (ex.level === targetLevel) || (targetLevel === 'Advanced' && ex.level === 'Intermediate') || (targetLevel === 'Intermediate' && ex.level === 'Beginner');
        return levMatch;
    });

    let isStrength = profile.goal === 'build-strength'; 

    let workouts = [];
    let daysToBuild = profile.trainingDays || 3;
    
    for(let i=1; i<=daysToBuild; i++) {
        let shuffled = eligible.sort(() => 0.5 - Math.random());
        let blockKeys = shuffled.slice(0, 4);
        if(blockKeys.length < 4) blockKeys = Object.keys(exerciseDB).slice(0, 4);

        let blocks = blockKeys.map((key) => {
            let ex = exerciseDB[key];
            
            let baseSets = targetLevel === 'Beginner' ? 3 : (targetLevel === 'Intermediate' ? 4 : 5);
            
            let repsStandard, restStandard;
            if (isStrength) {
                repsStandard = targetLevel === 'Beginner' ? "6" : (targetLevel === 'Intermediate' ? "8" : "10");
                restStandard = targetLevel === 'Beginner' ? "120s" : (targetLevel === 'Intermediate' ? "90s" : "60s");
            } else { // Metabolic / Conditioning
                repsStandard = targetLevel === 'Beginner' ? "12" : (targetLevel === 'Intermediate' ? "15" : "20");
                restStandard = targetLevel === 'Beginner' ? "60s" : (targetLevel === 'Intermediate' ? "45s" : "30s");
            }

            let focus = ex.focus || "Strength";
            let formattedReps = `${baseSets}x${repsStandard}`;
            let rest = restStandard;

            if(focus === 'Conditioning') {
                let dur = targetLevel === 'Beginner' ? "30s" : (targetLevel === 'Intermediate' ? "45s" : "60s");
                formattedReps = `${baseSets} x ${dur}`;
                rest = "30s";
            } else if(focus === 'Core') {
                let repsCore = targetLevel === 'Beginner' ? "10" : (targetLevel === 'Intermediate' ? "15" : "20");
                formattedReps = `${baseSets} x ${repsCore}`;
                rest = "30s";
            } else if (focus === 'Power') {
                formattedReps = `${baseSets}x5`;
                rest = "120s";
            }

            // Target naming checks for distance / isometric
            let n = ex.name.toLowerCase();
            if (n.includes('walk') || n.includes('carry') || n.includes('farmers')) {
                let dist = targetLevel === 'Beginner' ? "15m" : (targetLevel === 'Intermediate' ? "20m" : "30m");
                formattedReps = `${baseSets} x ${dist}`; 
            } else if (n.includes('plank') || n.includes('hold') || n.includes('prying')) {
                let dur = targetLevel === 'Beginner' ? "20s" : (targetLevel === 'Intermediate' ? "30s" : "45s");
                formattedReps = `${baseSets} x ${dur}`;
            }

            return {
                exercise: key,
                reps: formattedReps,
                rest: rest
            };
        });

        workouts.push({
            day_id: "D" + i,
            title: isStrength ? ("Strength Builder " + i) : ("Metabolic Engine " + i),
            duration: isStrength ? 45 : 30,
            focus: isStrength ? "Strength" : "Metabolic",
            blocks: blocks
        });
    }

    return {
        program_name: targetLevel + " " + (isStrength ? "Strength Protocol" : "Endurance Matrix"),
        theme_color: isStrength ? "#1f3f3a" : "#EA632C",
        workouts: workouts
    };
};

// --- STATE MANAGEMENT ---
const state = {
    currentTab: 'home',
    hasCompletedOnboarding: false,
    routinesDB: null,
    currentProgram: null,
    userProfile: {
        goal: null,
        experience: null,
        weight: null,
        isCustomWeight: false,
        hasDoubleKettlebells: false,
        unit: 'kg',
        daysPerWeek: null,
        duration: null,
        age: '',
        height: '',
        bodyWeight: '',
        workoutHistory: [],
        programStartDate: null,
        longestStreak: 0,
        targetWeight: null,
        weightHistory: []
    }
};

// --- DATA HELPERS ---
window.getStats = function() {
    const history = state.userProfile.workoutHistory || [];
    const workouts = history.length;
    let totalMinutes = 0;
    let totalKcal = 0;
    
    history.forEach(session => {
        totalMinutes += (session.duration || 20);
        totalKcal += (session.kcal || 200);
    });
    
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    return {
        count: workouts,
        time: `${h}h ${m}m`,
        kcal: totalKcal.toLocaleString()
    };
};

window.getStreak = function() {
    const history = state.userProfile.workoutHistory || [];
    if (history.length === 0) return { current: 0, longest: state.userProfile.longestStreak || 0 };
    
    // Simple streak calculation (daily)
    const sortedDates = history.map(h => new Date(h.date).setHours(0,0,0,0))
                               .filter((v, i, a) => a.indexOf(v) === i) // unique days
                               .sort((a, b) => b - a); // newest first
                               
    let currentStreak = 0;
    const today = new Date().setHours(0,0,0,0);
    const yesterday = today - 86400000;
    
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            if (sortedDates[i] - sortedDates[i+1] === 86400000) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    
    if (currentStreak > (state.userProfile.longestStreak || 0)) {
        state.userProfile.longestStreak = currentStreak;
        saveState();
    }
    
    return { current: currentStreak, longest: state.userProfile.longestStreak || 0 };
};

window.getProgramWeek = function() {
    if (!state.userProfile.programStartDate) return 1;
    const start = new Date(state.userProfile.programStartDate);
    const diff = new Date() - start;
    const week = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)) || 1;
    return Math.min(12, week);
};

window.logWorkout = function(workout) {
    if (!state.userProfile.workoutHistory) state.userProfile.workoutHistory = [];
    
    let duration = workout.actualDuration || workout.duration || 20;
    
    // MET-based calculation: MET * 3.5 * weight(kg) / 200 = kcal/min
    let weightKg = parseFloat(state.userProfile.bodyWeight) || 75;
    // (Assuming bodyWeight is stored in kg since no option in onboarding converts it yet, but just in case)
    let met = 7.5; // Average MET for Kettlebell Training
    let calculatedKcal = Math.round(((met * 3.5 * weightKg) / 200) * duration);
    
    state.userProfile.workoutHistory.push({
        id: Date.now(),
        date: new Date().toISOString(),
        name: workout.title || "Daily Workout",
        duration: duration,
        kcal: calculatedKcal
    });
    
    saveState();
};

window.finishWorkoutSession = function() {
    let durationMinutes = 20; // fallback
    if (window.workoutSessionStartTime) {
        const diffMs = Date.now() - window.workoutSessionStartTime;
        durationMinutes = Math.max(1, Math.round(diffMs / 60000));
        window.workoutSessionStartTime = null; // reset
    }

    if (state.currentProgram && state.currentProgram.workouts && state.currentProgram.workouts.length > 0) {
        let workout = state.currentProgram.workouts[0];
        workout.actualDuration = durationMinutes;
        window.logWorkout(workout);
    }
    
    window.showNotification("Workout Completed! Progress and Kcal logged.");
    window.renderPage();
};

function saveState() {
    localStorage.setItem('onebell_state', JSON.stringify({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userProfile: state.userProfile
    }));
}

function loadState() {
    try {
        const saved = localStorage.getItem('onebell_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.userProfile) {
                state.userProfile = { ...state.userProfile, ...parsed.userProfile };
            }
            state.hasCompletedOnboarding = !!parsed.hasCompletedOnboarding;
        }
    } catch (e) {
        console.error("Error loading state", e);
    }
}
loadState();

let onboardingStep = 0;
const totalSteps = 7;

const onboardingData = {
    goal: [
        { id: 'burn-fat', title: 'Burn fat', icon: 'flame' },
        { id: 'build-strength', title: 'Build strength', icon: 'dumbbell' },
        { id: 'balanced', title: 'Balanced fitness', icon: 'activity' },
        { id: 'conditioning', title: 'Conditioning', icon: 'heart' }
    ],
    experience: [
        { id: 'beginner', title: 'Beginner', icon: 'star' },
        { id: 'intermediate', title: 'Intermediate', icon: 'zap' },
        { id: 'advanced', title: 'Advanced', icon: 'award' }
    ],
    weights: [8, 10, 12, 16, 20, 24],
    days: [2, 3, 4, 5],
    durations: [15, 20, 30]
};

// --- VIEW MANAGEMENT ---
let mainContent;
let navItems;

window.showNotification = function(msg) {
    let toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = 'env(safe-area-inset-top, 20px)';
    toast.style.left = '50%';
    toast.style.width = '90%';
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
    toast.style.background = '#111A18'; // Forced dark modern color
    toast.style.color = '#FFF'; // High contrast white
    toast.style.padding = '16px 24px';
    toast.style.borderRadius = '20px';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '15px';
    toast.style.textAlign = 'center';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.innerText = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

function initUIBlocks() {
    mainContent = document.getElementById('main-content');
    navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            window.setActiveTab(item.dataset.tab);
        });
    });
}

window.renderPage = renderPage;

function renderPage() {
    if (!state.hasCompletedOnboarding) {
        document.getElementById('bottom-nav').style.display = 'none';
        mainContent.style.paddingBottom = '0';
        renderOnboarding();
        lucide.createIcons();
        return;
    }

    document.getElementById('bottom-nav').style.display = 'flex';
    mainContent.style.paddingBottom = 'var(--nav-height)';
    
    switch (state.currentTab) {
        case 'home': renderHome(); break;
        case 'program': renderProgram(); break;
        case 'exercises': renderExercises(); break;
        case 'progress': renderProgress(); break;
        case 'profile': renderProfile(); break;
        default: renderHome();
    }
    
    // Añadir animación a la página activa
    const activePage = document.querySelector('.page');
    if(activePage) {
        activePage.classList.add('page-enter');
    }
    
    lucide.createIcons();
}

window.setActiveTab = function(tabId, pushHistory = true) {
    state.currentTab = tabId;
    navItems.forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (pushHistory) {
        window.history.pushState({ tab: tabId }, '', '#' + tabId);
    }
    
    renderPage();
};

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tab) {
        window.setActiveTab(e.state.tab, false);
    } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            window.setActiveTab(hash, false);
        } else {
            window.setActiveTab('home', false);
        }
    }
});



// --- ONBOARDING LOGIC ---
function renderOnboarding() {
    if (onboardingStep === 0) {
        // Step 1 - Welcome
        mainContent.innerHTML = '<div class="onboarding-container" style="justify-content: flex-end; padding-bottom: 40px; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, var(--bg-color) 90%), url(./assets/onboarding_hero_40yo.png) center center/cover no-repeat; position: relative;">' +
            '<div style="position: relative; z-index: 2; text-align: center;">' +
                '<h1 class="onboarding-title" style="font-size: 42px;">One kettlebell.<br><span class="accent">Real strength.</span></h1>' +
                '<p class="onboarding-subtitle" style="font-size: 18px; margin-top: 16px;">Train with a smart 12-week kettlebell program designed around one kettlebell.</p>' +
                '<button class="btn btn-primary" id="btn-start-onboarding" style="font-size: 18px; margin-top: 32px; width: 100%;">Start</button>' +
            '</div>' +
        '</div>';
        document.getElementById('btn-start-onboarding').addEventListener('click', () => {
            onboardingStep = 1;
            renderOnboarding();
        });
        return;
    }

    const progress = (onboardingStep / totalSteps) * 100;
    let stepContent = '';
    let validationPassed = false;
    
    if (onboardingStep === 1) { 
        // Step 2 - Goal
        validationPassed = state.userProfile.goal !== null;
        stepContent = '<h2 class="onboarding-title" style="margin-bottom: 32px;">What is your training goal?</h2>' +
            '<div class="options-container">' +
            onboardingData.goal.map(g => '<div class="option-card ' + (state.userProfile.goal === g.id ? 'selected' : '') + '" data-id="' + g.id + '" style="padding: 20px;">' +
                '<div class="option-card-icon"><i data-lucide="' + g.icon + '"></i></div>' +
                '<div class="option-card-content"><h3 style="font-size: 18px;">' + g.title + '</h3></div>' +
            '</div>').join('') + '</div>';
    } else if (onboardingStep === 2) { 
        // Step 3 - Experience
        validationPassed = state.userProfile.experience !== null;
        stepContent = '<h2 class="onboarding-title" style="margin-bottom: 32px;">What is your kettlebell experience?</h2>' +
            '<div class="options-container">' +
            onboardingData.experience.map(e => '<div class="option-card ' + (state.userProfile.experience === e.id ? 'selected' : '') + '" data-id="' + e.id + '" style="padding: 20px;">' +
                '<div class="option-card-icon"><i data-lucide="' + e.icon + '"></i></div>' +
                '<div class="option-card-content"><h3 style="font-size: 18px;">' + e.title + '</h3></div>' +
            '</div>').join('') + '</div>';
    } else if (onboardingStep === 3) { 
        // Step 4 - Weight
        validationPassed = state.userProfile.weight !== null && state.userProfile.weight > 0;
        stepContent = '<h2 class="onboarding-title" style="margin-bottom: 32px;">What kettlebell weight do you have?</h2>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            onboardingData.weights.map(w => '<div class="option-card ' + (state.userProfile.weight == w.toString() && !state.userProfile.isCustomWeight ? 'selected' : '') + '" data-weight="' + w + '" style="justify-content: center; padding: 24px;">' +
                '<h3 style="font-size: 24px; font-weight: 800; color: var(--primary-color); margin: 0;">' + w + 'kg</h3>' +
            '</div>').join('') + 
            '<div class="option-card ' + (state.userProfile.isCustomWeight ? 'selected' : '') + '" id="btn-custom-weight" style="justify-content: center; padding: 24px;">' +
                '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin: 0;">Custom</h3>' +
            '</div>' +
            '</div>' +
            (state.userProfile.isCustomWeight ? '<div style="margin-top: 24px;"><input type="number" id="custom-weight-input" placeholder="Weight in kg" value="' + (state.userProfile.weight || '') + '" style="width: 100%; padding: 20px; font-size: 20px; font-weight: 700; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.2); outline: none;"></div>' : '');
    } else if (onboardingStep === 4) { 
        // Step 5 - Schedule & Duration
        validationPassed = state.userProfile.daysPerWeek !== null && state.userProfile.duration !== null;
        stepContent = '<h2 class="onboarding-title" style="margin-bottom: 24px; font-size: 24px;">How many days per week do you want to train?</h2>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 40px;">' +
            onboardingData.days.map(d => '<div class="option-card ' + (state.userProfile.daysPerWeek === d ? 'selected' : '') + '" data-day="' + d + '" style="justify-content: center; padding: 16px;">' +
                '<h3 style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin: 0;">' + d + ' days</h3>' +
            '</div>').join('') + '</div>' +
            
            '<h2 class="onboarding-title" style="margin-bottom: 24px; font-size: 24px;">Workout duration</h2>' +
            '<div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">' +
            onboardingData.durations.map(dur => '<div class="option-card ' + (state.userProfile.duration === dur ? 'selected' : '') + '" data-duration="' + dur + '" style="flex: 1; justify-content: center; padding: 16px;">' +
                '<h3 style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin: 0; white-space: nowrap;">' + dur + ' min</h3>' +
            '</div>').join('') + '</div>';
    } else if (onboardingStep === 5) { 
        // Step 6 - Body info
        validationPassed = state.userProfile.age && state.userProfile.height && state.userProfile.bodyWeight;
        stepContent = '<h2 class="onboarding-title">Body information</h2>' +
            '<p class="onboarding-subtitle">This is used to calculate BMI and personalize your training volume.</p>' +
            '<div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">' +
                '<div>' +
                    '<label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: block;">Age</label>' +
                    '<input type="number" id="input-age" placeholder="Years" value="' + state.userProfile.age + '" style="width: 100%; padding: 20px; font-size: 18px; font-weight: 600; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.1); outline: none;">' +
                '</div>' +
                '<div style="display: flex; gap: 16px;">' +
                    '<div style="flex: 1;">' +
                        '<label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: block;">Height (cm)</label>' +
                        '<input type="number" id="input-height" placeholder="cm" value="' + state.userProfile.height + '" style="width: 100%; padding: 20px; font-size: 18px; font-weight: 600; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.1); outline: none;">' +
                    '</div>' +
                    '<div style="flex: 1;">' +
                        '<label style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: block;">Weight (kg)</label>' +
                        '<input type="number" id="input-weight" placeholder="kg" value="' + state.userProfile.bodyWeight + '" style="width: 100%; padding: 20px; font-size: 18px; font-weight: 600; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.1); outline: none;">' +
                    '</div>' +
                '</div>' +
            '</div>';
    } else if (onboardingStep === 6) {
        // Step 7 - AI Processing & Program ready
        mainContent.innerHTML = '<div class="loading-screen" style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-color);">' +
            '<div class="ai-radar-container">' +
                '<div class="radar-ring"></div>' +
                '<div class="radar-ring"></div>' +
                '<div class="radar-ring"></div>' +
                '<i data-lucide="cpu" style="width: 42px; height: 42px; color: var(--accent-color); position: absolute;" class="ai-wow-pulse"></i>' +
            '</div>' +
            '<h2 id="wow-title" style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; text-align:center; padding: 0 20px; height: 32px; transition: opacity 0.3s; letter-spacing:-0.4px;">Initializing AI Engine...</h2>' +
            '<p id="wow-subtitle" style="color: var(--text-secondary); margin-bottom: 40px; font-size: 15px; height: 20px; transition: opacity 0.3s; opacity: 0.8;">Connecting to OneBell database</p>' +
            '<div style="width: 60%; max-width: 240px; height: 4px; background: var(--card-bg-elevated); border-radius: 2px; overflow: hidden;">' +
                '<div id="wow-progress" style="width: 0%; height: 100%; background: var(--accent-color); transition: width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);"></div>' +
            '</div>' +
        '</div>';
        lucide.createIcons();
        
        const sequences = [
            { t: "Analyzing biometrics data...", s: "Calculating BMR and energy baselines", p: 15 },
            { t: "Scanning kettlebell mechanics...", s: "Evaluating experience & tension rules", p: 35 },
            { t: "Structuring 12-week macrocycles...", s: "Defining progressive overload", p: 55 },
            { t: "Compiling workout database...", s: "Selecting optimal exercises", p: 75 },
            { t: "Finalizing OneBell protocol...", s: "Calibrating rest intervals", p: 90 },
            { t: "Program Synthesis Complete", s: "Ready for deployment.", p: 100 }
        ];
        
        let seqIndex = 0;
        let wowInterval = setInterval(() => {
            if(seqIndex >= sequences.length) {
                clearInterval(wowInterval);
                return;
            }
            let sq = sequences[seqIndex];
            
            let tEl = document.getElementById('wow-title');
            let sEl = document.getElementById('wow-subtitle');
            let pEl = document.getElementById('wow-progress');
            
            if(tEl && sEl && pEl) {
                tEl.style.opacity = 0;
                sEl.style.opacity = 0;
                setTimeout(() => {
                    tEl.innerText = sq.t;
                    sEl.innerText = sq.s;
                    pEl.style.width = sq.p + '%';
                    tEl.style.opacity = 1;
                    sEl.style.opacity = 1;
                }, 150);
            }
            seqIndex++;
        }, 800);
        
        // Simulate AI fetch and compile
        fetch('./routines.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                state.routinesDB = data;
                // Basic matching logic based on profile (fallback to iron clad)
                state.currentProgram = window.generateAlgorithmicProgram(state.userProfile, data.exercises);
                saveState();
                
                setTimeout(() => {
                    mainContent.innerHTML = '<div class="onboarding-container" style="justify-content: center; align-items: center; text-align: center; background: var(--bg-color);">' +
                        '<div style="width: 96px; height: 96px; border-radius: 50%; background: ' + (state.currentProgram.theme_color || 'var(--primary-color)') + '; margin-bottom: 32px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">' +
                            '<i data-lucide="check" style="width: 48px; height: 48px; color: white;"></i>' +
                        '</div>' +
                        '<h2 style="font-size: 40px; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px; color: var(--primary-color);">Your OneBell program is ready.</h2>' +
                        '<p style="color: var(--text-secondary); font-size: 16px; font-weight: 500; margin-bottom: 48px;">12 weeks of customized kettlebell training based on the <strong style="color: var(--accent-color)">' + state.currentProgram.program_name + '</strong> protocol.</p>' +
                        '<button class="btn btn-primary" id="btn-finish-onboarding" style="font-size: 18px; width: 100%;">Start training</button>' +
                    '</div>';
                    lucide.createIcons();
                    
                    document.getElementById('btn-finish-onboarding').addEventListener('click', () => {
                        state.hasCompletedOnboarding = true;
                        state.userProfile.programStartDate = new Date().toISOString();
                        saveState();
                        renderPage();
                    });
                }, 5200); // Wait for the WOW moment animation
            }).catch(e => {
                console.error("Error loading routines:", e);
                state.hasCompletedOnboarding = true;
                renderPage();
            });
            
        return;
    }

    // Standard wrapper for steps 1-5
    let backBtnHTML = onboardingStep > 1 ? '<button id="btn-back-step" style="background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;"><i data-lucide="arrow-left" style="width: 24px; height: 24px;"></i></button>' : '<div style="width: 44px; height: 44px;"></div>';
    
    mainContent.innerHTML = '<div class="onboarding-container">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">' +
            backBtnHTML +
            '<div class="progress-bar-bg" style="margin-bottom: 0; flex: 1; margin: 0 16px;"><div class="progress-bar-fill" style="width: ' + progress + '%"></div></div>' +
            '<div style="width: 44px; height: 44px;"></div>' +
        '</div>' +
        '<div class="onboarding-step">' + stepContent + '</div>' +
        '<div class="onboarding-footer">' +
            '<button class="btn btn-primary" id="btn-next-step" style="opacity: ' + (validationPassed ? '1' : '0.5') + '; pointer-events: ' + (validationPassed ? 'auto' : 'none') + ';">Continue</button>' +
        '</div>' +
    '</div>';

    lucide.createIcons();

    if (document.getElementById('btn-back-step')) {
        document.getElementById('btn-back-step').addEventListener('click', () => {
            onboardingStep--;
            renderOnboarding();
        });
    }

    // Reattach listeners dynamically
    if (onboardingStep === 1) {
        document.querySelectorAll('.option-card').forEach(card => card.addEventListener('click', () => { state.userProfile.goal = card.dataset.id; renderOnboarding(); }));
    } else if (onboardingStep === 2) {
        document.querySelectorAll('.option-card').forEach(card => card.addEventListener('click', () => { state.userProfile.experience = card.dataset.id; renderOnboarding(); }));
    } else if (onboardingStep === 3) {
        document.querySelectorAll('.option-card[data-weight]').forEach(card => card.addEventListener('click', () => {
            state.userProfile.weight = card.dataset.weight;
            state.userProfile.isCustomWeight = false;
            renderOnboarding();
        }));
        document.getElementById('btn-custom-weight').addEventListener('click', () => {
            state.userProfile.isCustomWeight = true;
            state.userProfile.weight = '';
            renderOnboarding();
        });
        const customInput = document.getElementById('custom-weight-input');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                state.userProfile.weight = e.target.value;
                const btn = document.getElementById('btn-next-step');
                if (parseFloat(e.target.value) > 0) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; } 
                else { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
            });
            setTimeout(() => customInput.focus(), 100);
        }
    } else if (onboardingStep === 4) {
        document.querySelectorAll('.option-card[data-day]').forEach(card => card.addEventListener('click', () => {
            state.userProfile.daysPerWeek = parseInt(card.dataset.day);
            renderOnboarding();
        }));
        document.querySelectorAll('.option-card[data-duration]').forEach(card => card.addEventListener('click', () => {
            state.userProfile.duration = parseInt(card.dataset.duration);
            renderOnboarding();
        }));
    } else if (onboardingStep === 5) {
        const checkValidBody = () => {
            const btn = document.getElementById('btn-next-step');
            if (state.userProfile.age && state.userProfile.height && state.userProfile.bodyWeight) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; } 
            else { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
        };
        const ageInput = document.getElementById('input-age');
        const heightInput = document.getElementById('input-height');
        const weightInput = document.getElementById('input-weight');
        ageInput.addEventListener('input', (e) => { state.userProfile.age = e.target.value; checkValidBody(); });
        heightInput.addEventListener('input', (e) => { state.userProfile.height = e.target.value; checkValidBody(); });
        weightInput.addEventListener('input', (e) => { state.userProfile.bodyWeight = e.target.value; checkValidBody(); });
    }

    document.getElementById('btn-next-step').addEventListener('click', () => {
        onboardingStep++;
        renderOnboarding();
    });
}

// ----- THE REST OF THE APP -----

function renderHome() {
    let name = state.userProfile.name || "Athlete";
    let greeting = "Good morning";
    const hr = new Date().getHours();
    if (hr >= 12 && hr < 18) greeting = "Good afternoon";
    if (hr >= 18) greeting = "Good evening";

    // Use loaded AI program or fallback
    let programData = state.currentProgram || {
        program_name: "Foundation of Iron", theme_color: "var(--primary-color)",
        workouts: [{ title: "Kettlebell Full Body", duration: 18, focus: "Fat burn", blocks: [
            { exercise: "goblet_squat", reps: "3x10" }, { exercise: "swing", reps: "3x15" }
        ]}]
    };
    let todaysWorkout = programData.workouts[0];
    let exercisesDB = state.routinesDB ? state.routinesDB.exercises : null;

    let heroCardHTML = '<div class="workout-card" style="background: linear-gradient(145deg, ' + (programData.theme_color || 'var(--primary-color)') + ' 0%, #10211e 100%); border-radius: var(--border-radius-xl); padding: 24px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); margin-bottom: 32px;">' +
        '<div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: var(--accent-color); opacity: 0.15; filter: blur(40px); border-radius: 50%; pointer-events: none;"></div>' +
        '<h3 style="font-size: 13px; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; position: relative;">Today\'s Workout</h3>' +
        '<h2 style="font-size: 28px; font-weight: 800; line-height: 1.1; color: #FFF; position: relative; margin-bottom: 12px; letter-spacing: -0.5px;">' + todaysWorkout.title + '</h2>' +
        '<div style="display: flex; gap: 8px; margin-bottom: 24px; position: relative;">' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">' + todaysWorkout.duration + ' min</span>' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">' + todaysWorkout.focus + '</span>' +
        '</div>' +
        '<div style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px; position: relative;">' +
            '<ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; line-height: 1.6;">' +
                todaysWorkout.blocks.map(b => {
                    let exName = exercisesDB && exercisesDB[b.exercise] ? exercisesDB[b.exercise].name : b.exercise;
                    return '<li>' + exName + ' (' + b.reps + ')</li>';
                }).join('') +
            '</ul>' +
        '</div>' +
        '<button class="btn btn-accent" id="btn-start-workout" style="width: 100%; border-radius: 12px; font-size: 16px; font-weight: 800; padding: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; position: relative; box-shadow: 0 4px 15px rgba(234, 99, 44, 0.4);" onclick="window.startWorkoutFlow()">' +
            '<i data-lucide="play" fill="currentColor" style="width: 20px; height: 20px;"></i> START WORKOUT' +
        '</button>' +
    '</div>';

    // Horizontal exercises dynamic map
    let horizontalCardsHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Workout Summary</h3>' +
        '<div class="hide-scrollbar" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;">' +
        todaysWorkout.blocks.map(b => {
            let ex = exercisesDB && exercisesDB[b.exercise] ? exercisesDB[b.exercise] : { name: b.exercise, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400' };
            return '<div role="button" tabindex="0" onclick="window.showInfoModal(\'' + b.exercise + '\')" style="cursor: pointer; background: var(--card-bg); border-radius: var(--border-radius-md); overflow: hidden; min-width: 140px; flex-shrink: 0; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); scroll-snap-align: start; transition: transform 0.2s;">' +
                '<div style="width: 100%; height: 100px; background: url(' + ex.img + ') center/cover;"></div>' +
                '<div style="padding: 12px;">' +
                    '<h4 style="font-size: 14px; font-weight: 700; color: var(--primary-color); line-height: 1.2; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 34px;">' + ex.name + '</h4>' +
                    '<span style="font-size: 12px; font-weight: 800; color: var(--accent-color);">' + b.reps + '</span>' +
                '</div>' +
            '</div>';
        }).join('') +
        '</div></div>';

    // Dynamic Stats
    const stats = window.getStats();
    const currentWeek = window.getProgramWeek();
    const totalProgramWorkouts = (state.userProfile.daysPerWeek || 3) * 12;
    const programProgressPct = Math.min(100, Math.round((stats.count / totalProgramWorkouts) * 100));

    let quickStatsHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;">' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.count + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.time + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Time</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.kcal + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Kcal</div>' +
        '</div>' +
    '</div>';

    // Circular Progress dynamic
    let progressHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Program progress</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Week ' + currentWeek + ' of 12</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">' + programProgressPct + '%<br><span style="color: var(--text-secondary); font-size: 18px;">Complete</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--accent-color) ' + programProgressPct + '%, rgba(255,255,255,0.03) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<span style="font-size: 18px; font-weight: 800; color: var(--primary-color); letter-spacing: -0.5px;">' + programProgressPct + '%</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        '<header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">' +
            '<div>' +
                '<h2 style="font-size: 16px; color: var(--text-secondary); font-weight: 600;">' + greeting + ', ' + name + '</h2>' +
                '<h1 style="font-size: 28px; font-weight: 800; margin-top: 4px; letter-spacing: -0.5px; color: var(--primary-color);">Ready to train?</h1>' +
            '</div>' +
            '<div style="display: flex; gap: 12px;">' +
                '<div role="button" tabindex="0" style="width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.05); position: relative;" onclick="window.showNotification(`Time to rest! Make sure you drink water.`)">' +
                    '<i data-lucide="bell" style="color: var(--primary-color); width: 22px; height: 22px; stroke-width: 2;"></i>' +
                    '<div style="position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: var(--accent-color); border-radius: 50%; border: 2px solid var(--card-bg);"></div>' +
                '</div>' +
                '<div role="button" tabindex="0" style="width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.05);" onclick="window.setActiveTab(`profile`)">' +
                    '<i data-lucide="user" style="color: var(--primary-color); width: 22px; height: 22px; stroke-width: 2;"></i>' +
                '</div>' +
            '</div>' +
        '</header>' +
        quickStatsHTML + heroCardHTML + horizontalCardsHTML + progressHTML +
    '</div>' +
    '<button class="fab-coach" onclick="window.openHeadCoachChat()">' +
        '<i data-lucide="message-circle" style="width: 28px; height: 28px; color: white;"></i>' +
    '</button>';

    lucide.createIcons();
}

function renderProgram() {
    const currentWeek = window.getProgramWeek();
    const history = state.userProfile.workoutHistory || [];
    const workoutsPerWeek = state.userProfile.daysPerWeek || 3;
    
    // Header dynamic
    let headerHTML = '<header style="margin-bottom: 24px;">' +
        '<h2 style="font-size: 14px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Método Dinámico OneBell</h2>' +
        '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Tu Programa</h1>' +
    '</header>';

    // Phase Card dynamic
    let phase = currentWeek <= 4 ? "Fase de Fundamentos" : (currentWeek <= 8 ? "Fase de Fuerza" : "Fase de Poder");
    let phaseCardHTML = '<div style="background: var(--card-bg-elevated); border-radius: var(--border-radius-lg); padding: 24px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.03);">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">Semana ' + currentWeek + ' &mdash; ' + phase + '</h3>' +
        '<p style="font-size: 14px; font-weight: 500; color: var(--text-secondary); line-height: 1.5;">' + (currentWeek <= 4 ? "Construyendo técnica de kettlebell." : "Aumentando carga mecánica.") + '</p>' +
    '</div>';

    // Fetch real state
    let programData = state.currentProgram || {
        program_name: "Foundation of Iron", theme_color: "var(--primary-color)",
        workouts: [{ title: "Kettlebell Full Body", duration: 18, focus: "Fat burn", blocks: [
            { exercise: "goblet_squat", reps: "3x10" }, { exercise: "swing", reps: "3x15" }
        ]}]
    };
    let todaysWorkout = programData.workouts[0];
    let exercisesDB = state.routinesDB ? state.routinesDB.exercises : null;

    // Weekly Calendar dynamic
    const weekDays = ['M','T','W','T','F','S','S'];
    let d = new Date();
    let todayIndex = (d.getDay() + 6) % 7; 
    let historyDates = history.map(h => new Date(h.date).toDateString());
    
    let calendarHTML = '<div style="margin-bottom: 32px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
        weekDays.map((dStr, index) => {
            let bg = 'transparent', color = 'var(--text-tertiary)', border = 'none';
            // Find Date object for this day of current week
            let dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - (todayIndex - index));
            let dateStr = dateObj.toDateString();
            
            let isCompleted = historyDates.includes(dateStr);
            let isToday = index === todayIndex;
            
            if (isCompleted) {
                 bg = 'var(--primary-color)'; color = '#FFF';
            } else if (isToday) {
                 border = '2px solid var(--accent-color)'; color = 'var(--primary-color)';
            }
            
            return '<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">' +
                '<span style="font-size: 12px; font-weight: 700; color: ' + (isToday ? 'var(--accent-color)' : 'var(--text-tertiary)') + ';">' + dStr + '</span>' +
                '<div style="width: 36px; height: 36px; border-radius: 50%; background: ' + bg + '; border: ' + border + '; display: flex; align-items: center; justify-content: center; color: ' + color + ';">' +
                    '<span style="font-weight: 700; font-size: 14px;"></span>' +
                '</div>' +
            '</div>';
        }).join('') +
    '</div></div>';

    // Today Workout Card (Dynamic)
    let todayWorkoutHTML = '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Hoy</h3>' +
        '<div class="workout-card" style="background: linear-gradient(145deg, ' + (programData.theme_color || 'var(--primary-color)') + ' 0%, #10211e 100%); border-radius: var(--border-radius-xl); padding: 24px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); margin-bottom: 32px;">' +
        '<div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: var(--accent-color); opacity: 0.15; filter: blur(40px); border-radius: 50%; pointer-events: none;"></div>' +
        '<h2 style="font-size: 28px; font-weight: 800; line-height: 1.1; color: #FFF; position: relative; margin-bottom: 12px; letter-spacing: -0.5px;">' + todaysWorkout.title + '</h2>' +
        '<div style="display: flex; gap: 8px; margin-bottom: 24px; position: relative;">' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">' + todaysWorkout.duration + ' min</span>' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">' + todaysWorkout.focus + '</span>' +
        '</div>' +
        '<div style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px; position: relative;">' +
            '<ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; line-height: 1.6;">' +
                todaysWorkout.blocks.map(b => {
                    let exName = exercisesDB && exercisesDB[b.exercise] ? exercisesDB[b.exercise].name : b.exercise;
                    return '<li>' + exName + ' (' + b.reps + ')</li>';
                }).join('') +
            '</ul>' +
        '</div>' +
        '<button class="btn btn-accent" style="width: 100%; border-radius: 12px; font-size: 16px; font-weight: 800; padding: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; position: relative; box-shadow: 0 4px 15px rgba(234, 99, 44, 0.4);" onclick="window.startWorkoutFlow()">' +
            '<i data-lucide="play" fill="currentColor" style="width: 20px; height: 20px;"></i> START WORKOUT' +
        '</button>' +
    '</div>';

    // Upcoming Workouts
    let upcomingHTML = '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Upcoming</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: var(--border-radius-sm); background: var(--card-bg-elevated); display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-weight: 800; font-size: 16px;">THU</div>' +
                '<div style="flex: 1;"><h4 style="font-size: 16px; font-weight: 700; color: var(--primary-color);">Lower Body Strength</h4><p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 4px;">Strength &bull; 20 min</p></div>' +
                '<i data-lucide="lock" style="color: var(--text-tertiary); width: 20px; height: 20px;"></i>' +
            '</div>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: var(--border-radius-sm); background: var(--card-bg-elevated); display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-weight: 800; font-size: 16px;">FRI</div>' +
                '<div style="flex: 1;"><h4 style="font-size: 16px; font-weight: 700; color: var(--primary-color);">Core &amp; Conditioning</h4><p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 4px;">Conditioning &bull; 15 min</p></div>' +
                '<i data-lucide="lock" style="color: var(--text-tertiary); width: 20px; height: 20px;"></i>' +
            '</div>' +
        '</div>';

    // Program Progress Card dynamic
    const totalProg = (workoutsPerWeek * 12);
    const progPct = Math.min(100, Math.round((history.length / totalProg) * 100));
    let progressHTML = '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Foundation of Iron</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">Week ' + currentWeek + '<br><span style="color: var(--text-secondary); font-size: 18px;">of 12</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--accent-color) ' + progPct + '%, rgba(255,255,255,0.03) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<span style="font-size: 18px; font-weight: 800; color: var(--primary-color); letter-spacing: -0.5px;">' + progPct + '%</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Workout History dynamic
    let historyEntries = history.slice(-3).reverse().map(h => {
        const d = new Date(h.date);
        const dayName = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
        return '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03); margin-bottom: 8px;">' +
                '<div style="width: 48px; height: 48px; border-radius: var(--border-radius-sm); background: rgba(75, 208, 160, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-weight: 800; font-size: 14px;">' + dayName + '</div>' +
                '<div style="flex: 1;"><h4 style="font-size: 16px; font-weight: 700; color: var(--primary-color);">' + h.name + '</h4><p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 4px;">' + h.duration + ' min &bull; ' + h.kcal + ' kcal</p></div>' +
                '<i data-lucide="check-circle" style="color: var(--primary-color); width: 22px; height: 22px;"></i>' +
            '</div>';
    }).join("");

    let historyHTML = '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Completed Workouts</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px;">' +
            (historyEntries.length > 0 ? historyEntries : '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; border: 1px dashed rgba(31,63,58,0.2);"><p style="color: var(--text-tertiary); font-size: 14px; font-weight: 600;">No workouts recorded yet.</p></div>') +
        '</div>';

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        headerHTML + phaseCardHTML + calendarHTML + todayWorkoutHTML + upcomingHTML + progressHTML + historyHTML +
    '</div>';
    
    lucide.createIcons();
}

window.renderExerciseDetail = function(id) {
    // Hide bottom nav for immersive detail view
    document.getElementById('bottom-nav').style.display = 'none';
    
    // Fetch exercise data from routinesDB, fallback to stub if not found
    let ex = null;
    if (state.routinesDB && state.routinesDB.exercises && state.routinesDB.exercises[id]) {
        ex = state.routinesDB.exercises[id];
    } else {
        // Fallback stub for safety
        ex = {
            name: id || 'Kettlebell Swing',
            difficulty: 'Beginner',
            target: 'Full Body',
            weight: '16kg - 24kg',
            img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
            instructions: ['Stand with feet shoulder-width apart...'],
            mistakes: ['Squatting instead of hinging...']
        };
    }

    // Default values if missing
    let target = ex.target || 'Full Body';
    let weight = ex.weight || '16kg - 24kg';
    let difficulty = ex.level || ex.difficulty || 'Beginner';
    
    let instructionsHtml = (ex.instructions || []).map(step => '<li style="margin-bottom: 12px; padding-left: 8px;">' + step + '</li>').join('');
    let mistakesHtml = (ex.mistakes || []).map(mistake => '<li style="margin-bottom: 12px; padding-left: 8px;">' + mistake + '</li>').join('');

    // Visual HTML logic: stop-motion via frames, or single image
    let visualHtml = '';
    if (ex.frames && ex.frames.length > 0) {
        let frameDuration = 1.8; // 1.8 seconds total
        let step = frameDuration / ex.frames.length;
        
        let framesHtml = ex.frames.map((frameSrc, index) => {
            let delay = (index * step).toFixed(2);
            return '<img src="' + frameSrc + '" class="frame" style="animation: play-frames ' + frameDuration + 's infinite; animation-delay: ' + delay + 's;" alt="' + ex.name + ' frame">';
        }).join('');
        
        visualHtml = '<div class="stop-motion-container">' +
            framesHtml +
            '<div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 24px; background: linear-gradient(to top, rgba(31,63,58,0.9), transparent); z-index: 2;">' +
                '<span style="background: var(--accent-color); color: #FFF; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">' + difficulty + '</span>' +
                '<h1 style="color: #FFF; font-size: 32px; font-weight: 800; margin-top: 8px; letter-spacing: -0.5px; position: relative;">' + ex.name + '</h1>' +
            '</div>' +
        '</div>';
    } else {
        let visualBg = ex.img || ex.visual || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop';
        visualHtml = '<div style="width: 100%; height: 300px; background: url(&apos;' + visualBg + '&apos;) center/cover no-repeat; position: relative;">' +
            '<div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 24px; background: linear-gradient(to top, rgba(31,63,58,0.9), transparent);">' +
                '<span style="background: var(--accent-color); color: #FFF; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">' + difficulty + '</span>' +
                '<h1 style="color: #FFF; font-size: 32px; font-weight: 800; margin-top: 8px; letter-spacing: -0.5px;">' + ex.name + '</h1>' +
            '</div>' +
        '</div>';
    }

    let html = '<div class="page no-scrollbar" style="height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--bg-color); overflow-y: auto; padding: 0;">' +
        // Header with back button
        '<header style="display: flex; justify-content: space-between; align-items: center; padding: calc(var(--spacing-lg) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md); background: var(--card-bg); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid rgba(31,63,58,0.05);">' +
            '<button onclick="document.getElementById(&apos;bottom-nav&apos;).style.display=&apos;flex&apos;; window.setActiveTab(&apos;exercises&apos;)" style="background: transparent; border: none; display: flex; align-items: center; justify-content: center; color: var(--primary-color); cursor: pointer;"><i data-lucide="arrow-left" style="width: 24px; height: 24px;"></i></button>' +
            '<span style="font-weight: 800; color: var(--primary-color); font-size: 16px;">Detail</span>' +
            '<div style="width: 24px;"></div>' +
        '</header>' +

        // Large Visual
        visualHtml +

        // Quick Metadata
        '<div style="padding: 24px var(--spacing-md);">' +
            '<div style="display: flex; gap: 12px; margin-bottom: 32px; overflow-x: auto;" class="hide-scrollbar">' +
                '<div style="background: var(--card-bg); padding: 12px 16px; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm); flex-shrink: 0;">' +
                    '<h4 style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Target</h4>' +
                    '<p style="font-size: 14px; font-weight: 700; color: var(--primary-color); margin-top: 4px;">' + target + '</p>' +
                '</div>' +
                '<div style="background: var(--card-bg); padding: 12px 16px; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm); flex-shrink: 0;">' +
                    '<h4 style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Weight</h4>' +
                    '<p style="font-size: 14px; font-weight: 700; color: var(--primary-color); margin-top: 4px;">' + weight + '</p>' +
                '</div>' +
            '</div>' +

            // Instructions
            '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Technique</h3>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); margin-bottom: 32px;">' +
                '<ol style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 15px; font-weight: 500; line-height: 1.6;">' +
                    instructionsHtml +
                '</ol>' +
            '</div>' +

            // Mistakes
            '<h3 style="font-size: 20px; font-weight: 800; color: var(--danger-color); margin-bottom: 16px;">Common Mistakes</h3>' +
            '<div style="background: rgba(234, 99, 44, 0.05); border-radius: var(--border-radius-lg); padding: 20px; border: 1px solid rgba(234, 99, 44, 0.1); margin-bottom: 40px;">' +
                '<ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 15px; font-weight: 500; line-height: 1.6;">' +
                    mistakesHtml +
                '</ul>' +
            '</div>' +
        '</div>' +
    '</div>';

    mainContent.innerHTML = html;
    lucide.createIcons();
};

window.activeFilter = window.activeFilter || 'All';

window.setExerciseFilter = function(filter) {
    window.activeFilter = filter;
    renderPage();
};

function renderExercises() {
    const filters = ['Beginner', 'Intermediate', 'Advanced', 'Strength', 'Power', 'Core', 'Conditioning'];
    const filterMap = { 'All': 'Todos', 'Beginner': 'Principiante', 'Intermediate': 'Intermedio', 'Advanced': 'Avanzado', 'Strength': 'Fuerza', 'Power': 'Poder', 'Core': 'Core', 'Conditioning': 'Cardio' };
    let exercisesList = [];
    if (state.routinesDB && state.routinesDB.exercises) {
        exercisesList = Object.keys(state.routinesDB.exercises).map(key => {
            let ex = state.routinesDB.exercises[key];
            return {
                id: key,
                name: ex.name,
                level: ex.level || 'Beginner',
                focus: ex.focus || 'Strength',
                img: ex.img || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop'
            };
        });
    }

    if(window.activeFilter !== 'All') {
        exercisesList = exercisesList.filter(ex => ex.level === window.activeFilter || ex.focus === window.activeFilter);
    }

    let html = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        '<header style="margin-bottom: 24px;">' +
            '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Ejercicios</h1>' +
            '<div style="margin-top: 16px; background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(31,63,58,0.08); box-shadow: var(--shadow-sm);">' +
                '<i data-lucide="search" style="color: var(--text-tertiary); width: 22px;"></i>' +
                '<input type="text" placeholder="Buscar movimientos..." style="background: transparent; border: none; color: var(--text-primary); font-size: 16px; width: 100%; outline: none; font-weight: 500;">' +
            '</div>' +
        '</header>' +

        // Filter Chips
        '<div class="hide-scrollbar" style="display: flex; gap: 12px; overflow-x: auto; margin-bottom: 32px; padding-bottom: 4px;">' +
            '<div role="button" tabindex="0" onclick="window.setExerciseFilter(\'All\')" style="background: ' + (window.activeFilter === 'All' ? 'var(--primary-color)' : 'var(--card-bg)') + '; color: ' + (window.activeFilter === 'All' ? '#FFF' : 'var(--text-secondary)') + '; padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 700; white-space: nowrap; box-shadow: var(--shadow-sm); cursor: pointer; transition: 0.2s;">Todos</div>' +
            filters.map(f => '<div role="button" tabindex="0" onclick="window.setExerciseFilter(\'' + f + '\')" style="background: ' + (window.activeFilter === f ? 'var(--primary-color)' : 'var(--card-bg)') + '; color: ' + (window.activeFilter === f ? '#FFF' : 'var(--text-secondary)') + '; padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 600; white-space: nowrap; border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm); cursor: pointer; transition: 0.2s;">' + filterMap[f] + '</div>').join('') +
        '</div>' +

        // Exercise Grid
        '<div style="display: flex; flex-direction: column; gap: 16px;">' +
            exercisesList.map(ex => 
                '<div role="button" tabindex="0" style="background: var(--card-bg); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); display: flex; align-items: center; padding: 12px; gap: 16px; cursor: pointer;" onclick="window.renderExerciseDetail(&apos;' + ex.id + '&apos;)">' +
                    '<div style="width: 80px; height: 80px; border-radius: var(--border-radius-sm); background: url(&apos;' + ex.img + '&apos;) center/cover no-repeat;"></div>' +
                    '<div style="flex: 1;">' +
                        '<h3 style="font-size: 17px; font-weight: 800; color: var(--primary-color); margin-bottom: 4px;">' + ex.name + '</h3>' +
                        '<span style="font-size: 12px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(31,63,58,0.2); padding-right: 6px; margin-right: 6px;">' + filterMap[ex.level] + '</span>' +
                        '<span style="font-size: 12px; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.5px;">' + filterMap[ex.focus] + '</span>' +
                    '</div>' +
                    '<i data-lucide="chevron-right" style="color: var(--text-tertiary); width: 20px; height: 20px;"></i>' +
                '</div>'
            ).join('') +
        '</div>' +
    '</div>';

    mainContent.innerHTML = html;
    lucide.createIcons();
}

function renderProgress() {
    const currentWeek = window.getProgramWeek();
    const stats = window.getStats();
    const streak = window.getStreak();
    const totalProgWorkouts = (state.userProfile.daysPerWeek || 3) * 12;
    const progPct = Math.min(100, Math.round((stats.count / totalProgWorkouts) * 100));

    let headerHTML = '<header style="margin-bottom: 24px;">' +
        '<h2 style="font-size: 14px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Semana ' + currentWeek + ' de 12</h2>' +
        '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Tu Progreso</h1>' +
    '</header>';

    let streakCardHTML = '<div style="background: linear-gradient(145deg, var(--accent-color) 0%, #FF8C61 100%); border-radius: var(--border-radius-lg); padding: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2); margin-bottom: 24px; color: #FFF; display: flex; align-items: center; justify-content: space-between;">' +
        '<div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: #FFF; opacity: 0.1; filter: blur(30px); border-radius: 50%;"></div>' +
        '<div style="position: relative; z-index: 2;">' +
            '<h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: rgba(255,255,255,0.8);">Racha Actual</h3>' +
            '<div style="display: flex; align-items: baseline; gap: 8px;">' +
                '<h2 style="font-size: 42px; font-weight: 800; line-height: 1; letter-spacing: -1px;">' + streak.current + '</h2>' +
                '<span style="font-size: 18px; font-weight: 700;">days</span>' +
            '</div>' +
            '<p style="font-size: 13px; font-weight: 600; margin-top: 8px; color: rgba(255,255,255,0.8);">Longest streak: ' + streak.longest + ' días</p>' +
        '</div>' +
        '<i data-lucide="flame" fill="currentColor" style="width: 48px; height: 48px; color: #FFF; opacity: 0.9; position: relative; z-index: 2;"></i>' +
    '</div>';

    let statsHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;">' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.count + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.time + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Time</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">' + stats.kcal + '</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Kcal</div>' +
        '</div>' +
    '</div>';

    let programProgressHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Program Progress</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Foundation of Iron</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">' + progPct + '%<br><span style="color: var(--text-secondary); font-size: 18px;">Completed</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--primary-color) ' + progPct + '%, rgba(75, 208, 160, 0.1) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<i data-lucide="target" style="color: var(--primary-color); width: 24px; height: 24px;"></i>' +
                '</div>' +
            '</div>' +
        '</div></div>';

    // Activity bar chart dynamic
    const weekDays = ['M','T','W','T','F','S','S'];
    let d = new Date();
    let todayIndex = (d.getDay() + 6) % 7; 
    let historyDates = (state.userProfile.workoutHistory || []).map(h => new Date(h.date).toDateString());
    
    const chartBars = weekDays.map((dStr, index) => {
        let dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - (todayIndex - index));
        let dateStr = dateObj.toDateString();
        let isActive = historyDates.includes(dateStr);
        let pct = isActive ? '100%' : '5px';
        return { day: dStr, h: pct, active: isActive };
    });

    let chartHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Weekly Activity</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-end; height: 120px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(31,63,58,0.05);">' +
                chartBars.map(b => '<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; height: 100%;">' +
                    '<div style="width: 100%; max-width: 24px; height: 100%; display: flex; align-items: flex-end; justify-content: center;">' +
                        '<div style="width: 100%; background: ' + (b.active ? 'var(--primary-color)' : 'var(--card-bg-elevated)') + '; border-radius: 4px; height: ' + b.h + '; transition: height 0.5s ease;"></div>' +
                    '</div>' +
                '</div>').join('') +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                chartBars.map(b => '<div style="width: 100%; text-align: center; font-size: 12px; font-weight: 700; color: ' + (b.active ? 'var(--primary-color)' : 'var(--text-tertiary)') + ';">' + b.day + '</div>').join('') +
            '</div>' +
        '</div></div>';

    // Strength Progress
    let strengthHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Progreso de Fuerza</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
                '<h4 style="font-size: 16px; font-weight: 800; color: var(--primary-color);">Goblet Squat (Estimado)</h4>' +
                '<span style="background: rgba(50, 215, 75, 0.1); color: var(--success-color); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px;"><i data-lucide="trending-up" style="width: 12px; height: 12px; stroke-width: 3;"></i> + Volumen</span>' +
            '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 12px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px dashed rgba(31,63,58,0.08);">' +
                    '<span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">Semana 1</span>' +
                    '<span style="font-size: 15px; font-weight: 700; color: var(--text-secondary);">3 &times; 6</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<span style="font-size: 14px; font-weight: 600; color: var(--primary-color);">Semana ' + currentWeek + '</span>' +
                    '<span style="font-size: 15px; font-weight: 800; color: var(--primary-color);">4 &times; 8</span>' +
                '</div>' +
            '</div>' +
        '</div></div>';

    // Achievements Dynamic
    let rawAchievements = [];
    if (stats.count >= 1) rawAchievements.push({icon: "check-circle", color: "#32d74b", bg: "rgba(50, 215, 75, 0.15)", title: "First Step", desc: "You completed your first workout."});
    if (stats.count >= 5) rawAchievements.push({icon: "award", color: "#DAA520", bg: "rgba(255, 215, 0, 0.15)", title: "5 Workouts", desc: "Consistency is key."});
    if (streak.longest >= 3) rawAchievements.push({icon: "flame", color: "var(--accent-color)", bg: "rgba(234, 99, 44, 0.15)", title: "3-Day Streak", desc: "You're unstoppable!"});
    if (rawAchievements.length === 0) rawAchievements.push({icon: "lock", color: "var(--text-tertiary)", bg: "rgba(255,255,255,0.05)", title: "Aún no hay logros", desc: "Logra 5 workouts para desbloquear tu primer logro."});

    let achievementsHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Logros</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 12px;">' +
            rawAchievements.map(ac => 
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: 50%; background: ' + ac.bg + '; display: flex; align-items: center; justify-content: center; color: ' + ac.color + ';">' +
                    '<i data-lucide="' + ac.icon + '" style="width: 24px; height: 24px;"></i>' +
                '</div>' +
                '<div style="flex: 1;">' +
                    '<h4 style="font-size: 15px; font-weight: 700; color: var(--primary-color);">' + ac.title + '</h4>' +
                    '<p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">' + ac.desc + '</p>' +
                '</div>' +
            '</div>').join('') +
        '</div>' +
    '</div>';

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        '<div style="padding: 0 var(--spacing-md);">' +
        headerHTML + streakCardHTML + statsHTML + chartHTML + programProgressHTML + strengthHTML + achievementsHTML +
        '</div>' +
    '</div>';

    lucide.createIcons();
}

window.calcBMI = function(weight, heightStr) {
    if(!weight || !heightStr) return null;
    let h = parseFloat(heightStr) / 100;
    if(h === 0) return null;
    let bmi = parseFloat(weight) / (h * h);
    return bmi.toFixed(1);
};

window.getBMICategory = function(bmi) {
    if(!bmi) return "Desconocido";
    if(bmi < 18.5) return "Bajo peso";
    if(bmi < 25) return "Normal";
    if(bmi < 30) return "Sobrepeso";
    if(bmi < 35) return "Obesidad G1";
    if(bmi < 40) return "Obesidad G2";
    return "Obesidad G3";
};

window.getBMIColor = function(bmi) {
    if(!bmi) return "var(--text-tertiary)";
    if(bmi < 18.5) return "#fadb14";
    if(bmi < 25) return "#32d74b";
    if(bmi < 30) return "var(--accent-color)";
    return "#ff453a";
};

window.showModal = function(title, text, inputType, inputValue, confirmText, onConfirm) {
    let modalId = 'custom-modal-' + Date.now();
    let modalHTML = '<div id="' + modalId + '" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); width: 90%; max-width: 400px; padding: 24px; box-shadow: var(--shadow-lg); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,0.05);">' +
            '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">' + title + '</h3>' +
            '<p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">' + text + '</p>' +
            (inputType ? '<input type="' + inputType + '" id="' + modalId + '-input" value="' + (inputValue || '') + '" style="width: 100%; padding: 16px; border-radius: var(--border-radius-sm); border: 1px solid rgba(255,255,255,0.1); background: var(--bg-color); color: var(--text-primary); font-size: 18px; font-weight: 700; margin-bottom: 24px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor=\'var(--primary-color)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.1)\'">' : '') +
            '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
                '<button onclick="document.getElementById(\'' + modalId + '\').remove()" style="padding: 12px 20px; border-radius: var(--border-radius-sm); border: none; background: transparent; color: var(--text-tertiary); font-weight: 700; font-size: 15px; cursor: pointer;">Cancelar</button>' +
                '<button id="' + modalId + '-confirm" style="padding: 12px 24px; border-radius: var(--border-radius-sm); border: none; background: var(--accent-color); color: #000; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">' + confirmText + '</button>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalEl = document.getElementById(modalId);
    
    setTimeout(() => {
        modalEl.style.opacity = '1';
        modalEl.children[0].style.transform = 'translateY(0)';
    }, 10);
    
    if (inputType) {
        document.getElementById(modalId + '-input').focus();
    }
    
    document.getElementById(modalId + '-confirm').addEventListener('click', () => {
        let val = inputType ? document.getElementById(modalId + '-input').value : null;
        if (onConfirm(val) !== false) {
            modalEl.remove();
        }
    });
};

window.promptSetTargetWeight = function() {
    window.showModal('Fijar Meta de Peso', 'Introduce tu peso meta (kg):', 'number', state.userProfile.targetWeight || '', 'Guardar', (w) => {
        if(w && !isNaN(parseFloat(w))) {
            state.userProfile.targetWeight = parseFloat(w).toFixed(1);
            saveState();
            renderPage();
        }
    });
};

window.deleteWeightLog = function(index) {
    window.showModal('Eliminar Registro', '¿Seguro que deseas borrar este registro histórico?', null, null, 'Eliminar', () => {
        state.userProfile.weightHistory.splice(index, 1);
        if(state.userProfile.weightHistory.length > 0) {
            state.userProfile.bodyWeight = state.userProfile.weightHistory[state.userProfile.weightHistory.length - 1].weight;
        }
        saveState();
        renderPage();
    });
};

window.promptUpdateWeight = function() {
    window.showModal('Registrar Peso', 'Introduce tu nuevo peso en KG:', 'number', state.userProfile.bodyWeight || '', 'Registrar', (w) => {
        if(w && !isNaN(parseFloat(w))) {
            state.userProfile.bodyWeight = parseFloat(w).toFixed(1);
            if(!state.userProfile.weightHistory) { state.userProfile.weightHistory = []; }
            state.userProfile.weightHistory.push({ date: new Date().toISOString(), weight: parseFloat(w) });
            saveState();
            renderPage();
        }
    });
};

function renderProfile() {
    let w = parseFloat(state.userProfile.bodyWeight);
    let h = state.userProfile.height;
    let targetW = state.userProfile.targetWeight ? parseFloat(state.userProfile.targetWeight) : null;
    let hist = state.userProfile.weightHistory || [];
    
    if (hist.length === 0 && w) {
        hist.push({ date: new Date().toISOString(), weight: w });
        state.userProfile.weightHistory = hist;
        saveState();
    }

    let bmi = window.calcBMI(w, h);
    let bmiCat = window.getBMICategory(bmi);
    let bmiCol = window.getBMIColor(bmi);
    
    let initialW = hist.length > 0 ? hist[0].weight : w;
    let lost = (initialW - w).toFixed(1);
    let lostStr = lost > 0 ? `Perdido: ${lost} kg` : (lost < 0 ? `Subido: ${Math.abs(lost).toFixed(1)} kg` : `Sin cambios`);
    let lostPct = initialW > 0 ? ((lost / initialW) * 100).toFixed(1) : 0;
    
    let progressPct = 0;
    let targetStr = "Define tu meta";
    if (targetW) {
        if (targetW < initialW) { // Weight loss goal
            if (w <= targetW) progressPct = 100;
            else progressPct = ((initialW - w) / (initialW - targetW)) * 100;
        } else if (targetW > initialW) { // Gain goal
            if (w >= targetW) progressPct = 100;
            else progressPct = ((w - initialW) / (targetW - initialW)) * 100;
        } else {
            progressPct = 100;
        }
        progressPct = Math.max(0, Math.min(100, progressPct)).toFixed(0);
        let rem = Math.abs(w - targetW).toFixed(1);
        targetStr = progressPct == 100 ? "¡Meta alcanzada!" : `Faltan ${rem} kg`;
    }

    let paceRate = 0;
    let paceText = "Registra 2+ fechas";
    if(hist.length > 1) {
        let msDiff = new Date(hist[hist.length-1].date) - new Date(hist[0].date);
        let weeks = Math.max(1, msDiff / (1000 * 60 * 60 * 24 * 7));
        paceRate = (lost / weeks).toFixed(2);
        if(paceRate < 0) paceText = "Subiendo";
        else if(paceRate < 0.25) paceText = "Lento";
        else if(paceRate <= 0.75) paceText = "Saludable";
        else if(paceRate <= 1.2) paceText = "Agresivo";
        else paceText = "Muy agresivo";
    }

    let projectionStr = "";
    let absPace = Math.abs(parseFloat(paceRate));
    if (hist.length > 1 && absPace > 0) {
        if (targetW) {
            let kgToGo = Math.abs(w - targetW);
            let paceDir = parseFloat(paceRate); // positive = losing weight, negative = gaining
            let goingRightDirection = (targetW < w && paceDir > 0) || (targetW > w && paceDir < 0);
            
            if (goingRightDirection) {
                let weeksToGoal = (kgToGo / absPace).toFixed(1);
                projectionStr = `¡Excelente! A este ritmo (${absPace} kg/sem), alcanzarás tu meta de ${targetW} kg en ~${weeksToGoal} semanas.`;
            } else {
                 let proj4 = Math.max(1, (w - (paceDir * 4))).toFixed(1);
                 projectionStr = `A este ritmo, en 4 semanas podrías pesar ~${proj4} kg.`;
            }
        } else {
            let paceDir = parseFloat(paceRate);
            let proj4 = Math.max(1, (w - (paceDir * 4))).toFixed(1);
            projectionStr = `A este ritmo (${absPace} kg/sem), en 4 semanas podrías pesar ~${proj4} kg.`;
        }
    }

    let chartHTML = "";
    if (hist.length > 1) {
        let weights = hist.map(x => x.weight);
        let minW = Math.min(...weights);
        let maxW = Math.max(...weights);
        let range = maxW - minW || 10;
        minW -= range * 0.1;
        maxW += range * 0.1;
        let realRange = maxW - minW;

        let points = hist.map((log, i) => {
            let x = (i / (hist.length - 1)) * 100;
            let y = 100 - (((log.weight - minW) / realRange) * 100);
            return `${x},${y}`;
        }).join(" ");

        chartHTML = '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); margin-bottom: 32px;">' +
            '<h3 style="font-size: 16px; font-weight: 800; color: var(--primary-color); margin-bottom: 24px;">Weight Trend</h3>' +
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 120px; overflow: visible;">' +
                '<polyline fill="none" stroke="var(--accent-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="' + points + '"></polyline>' +
                hist.map((log, i) => {
                    let x = (i / (hist.length - 1)) * 100;
                    let y = 100 - (((log.weight - minW) / realRange) * 100);
                    return '<circle cx="' + x + '" cy="' + y + '" r="2" fill="var(--bg-color)" stroke="var(--accent-color)" stroke-width="1.5"></circle>';
                }).join('') +
            '</svg>' +
            '<div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 11px; color: var(--text-tertiary); font-weight: 700;">' +
                '<span>' + new Date(hist[0].date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + '</span>' +
                '<span>' + new Date(hist[hist.length-1].date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + '</span>' +
            '</div>' +
        '</div>';
    } else {
        chartHTML = '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); margin-bottom: 32px;">' +
            '<p style="color: var(--text-tertiary); font-size: 14px; font-weight: 600;">Registra al menos 2 pesos para ver tu tendencia.</p>' +
        '</div>';
    }

    let historyListHTML = hist.slice().reverse().map((log, offset) => {
        let i = hist.length - 1 - offset;
        let d = new Date(log.date);
        return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(31,63,58,0.05);">' +
            '<span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">' + d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + '</span>' +
            '<div style="display: flex; align-items: center; gap: 16px;">' +
                '<span style="font-size: 16px; font-weight: 800; color: var(--primary-color);">' + log.weight + ' kg</span>' +
                '<i role="button" tabindex="0" aria-label="Erase log" data-lucide="trash-2" onclick="window.deleteWeightLog(' + i + ')" style="width: 16px; height: 16px; color: #ff453a; cursor: pointer;"></i>' +
            '</div>' +
        '</div>';
    }).join("");

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 40px);">' +
        '<div style="background: var(--primary-color); border-radius: var(--border-radius-lg); overflow: hidden; padding: 32px 24px; color: #FFF; box-shadow: 0 10px 30px rgba(31,63,58, 0.2); margin-bottom: 24px; position: relative;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 2;">' +
                '<div>' +
                    '<h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">Tu Peso Actual</h3>' +
                    '<div style="display: flex; align-items: baseline; gap: 8px;">' +
                        '<h1 style="font-size: 48px; font-weight: 900; letter-spacing: -2px; margin: 0; line-height: 1; color: #FFF;">' + (w || '--') + '</h1>' +
                        '<span style="font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.8);">kg</span>' +
                    '</div>' +
                '</div>' +
                '<div role="button" tabindex="0" style="text-align: right; cursor: pointer;" onclick="window.promptSetTargetWeight()">' +
                    '<h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">Tu Meta <i data-lucide="edit-3" style="width: 12px; display: inline-block;"></i></h3>' +
                    '<h2 style="font-size: 20px; font-weight: 800; color: #FFF; margin: 0;">' + (targetW ? targetW + ' kg' : 'Fijar Meta') + '</h2>' +
                '</div>' +
            '</div>' +
            (targetW ? 
            '<div style="margin-top: 32px; position: relative; z-index: 2;">' +
                '<div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 8px;">' +
                    '<span>Progreso: ' + progressPct + '%</span>' +
                    '<span>' + targetStr + '</span>' +
                '</div>' +
                '<div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">' +
                    '<div style="width: ' + progressPct + '%; height: 100%; background: var(--accent-color); border-radius: 4px; transition: width 0.5s;"></div>' +
                '</div>' +
            '</div>' : '') +
            '<div style="position: absolute; right: -20px; bottom: -20px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(234,99,44,0.3) 0%, rgba(31,63,58,0) 70%);"></div>' +
        '</div>' +

        '<button class="btn" onclick="window.promptUpdateWeight()" style="margin-bottom: 32px; font-weight: 800; font-size: 16px; background: var(--accent-color); color: #FFF; width: 100%; box-shadow: 0 4px 12px rgba(234, 99, 44, 0.3);">+ Registrar Peso de Hoy</button>' +

        '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px;">' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 8px;">Índice IMC</h4>' +
                '<div style="font-size: 24px; font-weight: 900; color: ' + bmiCol + '; margin-bottom: 4px;">' + (bmi || '--') + '</div>' +
                '<div style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">' + bmiCat + '</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 8px;">Diferencia</h4>' +
                '<div style="font-size: 24px; font-weight: 900; color: var(--primary-color); margin-bottom: 4px;">' + Math.abs(lost) + ' kg</div>' +
                '<div style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">' + lostPct + '% total</div>' +
            '</div>' +
        '</div>' +

        chartHTML +

        (projectionStr ? 
        '<div style="background: rgba(50, 215, 75, 0.1); border-radius: var(--border-radius-md); padding: 16px; border: 1px solid rgba(50, 215, 75, 0.2); margin-bottom: 32px;">' +
            '<div style="display: flex; gap: 12px; align-items: flex-start;">' +
                '<i data-lucide="trending-down" style="color: var(--success-color);"></i>' +
                '<p style="color: var(--primary-color); font-size: 14px; font-weight: 600; line-height: 1.5; margin: 0;">' + projectionStr + '</p>' +
            '</div>' +
        '</div>' : '') +

        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); margin-bottom: 48px;">' +
            '<div style="padding: 16px; border-bottom: 1px solid rgba(31,63,58,0.05); background: rgba(31,63,58,0.02);">' +
                '<h3 style="font-size: 15px; font-weight: 800; color: var(--primary-color); margin: 0;">Historial de Pesajes</h3>' +
            '</div>' +
            historyListHTML +
        '</div>' +

        '<hr style="border: none; border-top: 1px solid rgba(31,63,58,0.1); margin: 40px 0;">' +
        '<h2 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 24px;">Configuración</h2>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="padding: 20px; border-bottom: 1px solid rgba(31,63,58,0.05); display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Estatura</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.height || '--') + ' cm</span>' +
            '</div>' +
            '<div style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Training Days</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.daysPerWeek || 3) + ' / week</span>' +
            '</div>' +
            '<div style="padding: 20px; border-top: 1px solid rgba(31,63,58,0.05); display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">I own 2 Kettlebells</span>' +
                '<div role="button" tabindex="0" aria-label="Toggle Equipment" style="position: relative; width: 50px; height: 30px; background: ' + (state.userProfile.hasDoubleKettlebells ? 'var(--primary-color)' : 'rgba(31,63,58,0.2)') + '; border-radius: 15px; cursor: pointer; transition: background 0.3s;" onclick="window.toggleDoubleBells()">' +
                    '<div style="position: absolute; top: 3px; left: ' + (state.userProfile.hasDoubleKettlebells ? '23px' : '3px') + '; width: 24px; height: 24px; background: #FFF; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: left 0.3s;"></div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<button class="btn" onclick="window.resetApp()" style="margin-top: 32px; font-weight: 700; color: var(--accent-color); background: rgba(234, 99, 44, 0.1);">Rebuild Algorithmic Program</button>' +
        '<button class="btn" onclick="window.loadDemoData()" style="margin-top: 16px; font-weight: 700; color: var(--success-color); background: rgba(50, 215, 75, 0.1);">Cargar Datos Muestra (Demo)</button>' +
        '<button class="btn" onclick="document.getElementById(&apos;reset-modal&apos;).style.display=&apos;flex&apos;" style="margin-top: 16px; font-weight: 700; color: #ff453a; background: rgba(255, 69, 58, 0.1);">Clear Data and Reset App</button>' +
        '<div id="reset-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px);">' +
            '<div style="background: var(--card-bg); border-radius: 20px; padding: 32px 24px; width: 100%; max-width: 320px; text-align: center; position: relative; border: 1px solid rgba(31,63,58,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.1);">' +
                '<div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255, 69, 58, 0.1); color: #ff453a; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;"><i data-lucide="trash-2" style="width: 28px; height: 28px;"></i></div>' +
                '<h2 style="color: var(--primary-color); font-size: 22px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">¿Borrar todo?</h2>' +
                '<p style="color: var(--text-secondary); font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Se eliminará la configuración permanentemente. La app regresará a su estado de fábrica inicial.</p>' +
                '<div style="display: flex; gap: 12px; width: 100%;">' +
                    '<button onclick="document.getElementById(&apos;reset-modal&apos;).style.display=&apos;none&apos;" style="flex: 1; background: var(--bg-color); color: var(--primary-color); border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: background 0.3s;">Cancelar</button>' +
                    '<button onclick="window.hardResetAppExecute()" style="flex: 1; background: #ff453a; color: #FFF; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(255,69,58,0.3);">Eliminar</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    lucide.createIcons();
}

window.loadDemoData = function() {
    let baseDate = new Date();
    state.userProfile.workoutHistory = [];
    state.userProfile.weightHistory = [];
    
    // Inject 5 historical weight entries
    let currentW = parseFloat(state.userProfile.bodyWeight) || 80;
    for (let i = 4; i >= 0; i--) {
        let d = new Date();
        d.setDate(baseDate.getDate() - (i * 7)); // one per week
        state.userProfile.weightHistory.push({
            date: d.toISOString(),
            weight: currentW + (i * 0.5) // Lost 0.5kg per week
        });
    }
    
    // Inject workouts (3 days ago, yesterday, today)
    let d1 = new Date(); d1.setDate(baseDate.getDate() - 3);
    let d2 = new Date(); d2.setDate(baseDate.getDate() - 1);
    let d3 = new Date(); // today
    
    state.userProfile.workoutHistory.push({ id: 1, date: d1.toISOString(), name: "Fuerza Base", duration: 30, kcal: 320 });
    state.userProfile.workoutHistory.push({ id: 2, date: d2.toISOString(), name: "Metabólico", duration: 20, kcal: 280 });
    state.userProfile.workoutHistory.push({ id: 3, date: d3.toISOString(), name: "Full Body Prying", duration: 45, kcal: 450 });
    
    // Inject older workouts to reach the "5 workouts" achievement
    let d4 = new Date(); d4.setDate(baseDate.getDate() - 10);
    let d5 = new Date(); d5.setDate(baseDate.getDate() - 12);
    state.userProfile.workoutHistory.push({ id: 4, date: d4.toISOString(), name: "Condición", duration: 25, kcal: 250 });
    state.userProfile.workoutHistory.push({ id: 5, date: d5.toISOString(), name: "Intro a pesas", duration: 20, kcal: 200 });

    state.userProfile.longestStreak = 3;
    
    saveState();
    window.renderPage();
};

window.hardResetAppExecute = async function() {
    localStorage.clear();
    if('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
    }
    if('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
    }
    window.location.reload(true);
};

window.toggleDoubleBells = function() {
    state.userProfile.hasDoubleKettlebells = !state.userProfile.hasDoubleKettlebells;
    // Auto-reload current program if DB is loaded
    if(state.routinesDB) {
        state.currentProgram = window.generateAlgorithmicProgram(state.userProfile, state.routinesDB.exercises);
    }
    saveState();
    renderProfile();
    // Also notify home tab to rewrite but we'll see it next time we click home tab
};

window.resetApp = function() {
    state.hasCompletedOnboarding = false;
    state.currentProgram = null; 
    onboardingStep = 0;
    saveState();
    renderPage();
};

window.playBeep = function(freq, type, duration, vol) {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
};

window.startWorkoutFlow = function() {
    let focus = state.currentProgram?.workouts?.[0]?.focus || "Strength";
    let routineKey = "balanced";
    if(focus.toLowerCase().includes("power")) routineKey = "power";
    if(focus.toLowerCase().includes("metabolic") || focus.toLowerCase().includes("conditioning")) routineKey = "conditioning";
    if(focus.toLowerCase().includes("strength") && state.currentProgram?.workouts?.[0]?.title?.toLowerCase().includes("lower")) routineKey = "lower_body";
    if(focus.toLowerCase().includes("strength") && state.currentProgram?.workouts?.[0]?.title?.toLowerCase().includes("upper")) routineKey = "upper_body";
    
    if (state.routinesDB && state.routinesDB.warmup_routines) {
        window.renderWarmupPlayer(routineKey, 0);
    } else {
        window.renderWorkoutPlayer(0);
    }
};

window.warmupTimerInterval = null;

window.renderWarmupPlayer = function(routineKey, stepIndex = 0) {
    if (window.warmupTimerInterval) clearInterval(window.warmupTimerInterval);
    document.getElementById('bottom-nav').style.display = 'none';

    let routine = state.routinesDB.warmup_routines[routineKey] || state.routinesDB.warmup_routines["balanced"];
    if (stepIndex >= routine.length) {
        // Warmup finished, proceed to workout
        window.renderWorkoutPlayer(0);
        return;
    }

    let step = routine[stepIndex];
    let ex = state.routinesDB.warmup_library[step.id];

    let playerHTML = '<div class="page" style="padding: 0; display: flex; flex-direction: column; background: var(--bg-color); height: 100vh; overflow: hidden; justify-content: space-between;">' +
        // Header
        '<div style="padding: calc(var(--spacing-md) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md); display: flex; justify-content: space-between; align-items: center; z-index: 10; background: linear-gradient(180deg, var(--bg-color) 0%, rgba(13,17,16,0) 100%); position: absolute; top: 0; left: 0; right: 0;">' +
            '<button class="icon-btn" onclick="window.renderWorkoutPlayer(0)" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: var(--text-primary); padding: 12px 20px; border-radius: 24px; font-size: 14px; font-weight: 700; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: 0.2s;">Saltar</button>' +
            '<div style="background: rgba(234, 99, 44, 0.15); color: var(--accent-color); font-size: 14px; font-weight: 800; padding: 10px 16px; border-radius: 24px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' +
                '<i data-lucide="flame" style="width: 16px; height: 16px;"></i> Paso ' + (stepIndex + 1) + '/' + routine.length +
            '</div>' +
        '</div>' +

        // Media
        '<div style="flex: 1; position: relative; background: #000; display: flex; justify-content: center; align-items: center; overflow: hidden;">' +
            '<img src="' + ex.img + '" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" />' +
            '<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(0deg, var(--bg-color) 0%, rgba(13,17,16,0) 100%); pointer-events: none;"></div>' +
            
            // Animated Timer Overlay
            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center;">' +
                '<div class="warmup-timer-ring" style="width: 160px; height: 160px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); box-shadow: 0 0 40px rgba(234,99,44,0.3); position: relative;">' +
                   '<svg width="160" height="160" style="position: absolute; top: 0; left: 0; transform: rotate(-90deg);"><circle cx="80" cy="80" r="76" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none"></circle><circle id="warmup-timer-circle" cx="80" cy="80" r="76" stroke="var(--accent-color)" stroke-width="8" fill="none" stroke-dasharray="477.5" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear; stroke-linecap: round;"></circle></svg>' +
                   '<span id="warmup-timer-text" style="font-size: 48px; font-weight: 900; color: #FFF; font-variant-numeric: tabular-nums; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">' + step.duration + '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Controls
        '<div style="padding: var(--spacing-xl) var(--spacing-md) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 20px)); background: var(--bg-color); z-index: 10; position: relative;">' +
            '<h2 style="font-size: 28px; font-weight: 900; color: var(--text-primary); margin-bottom: 8px;">' + ex.name + '</h2>' +
            '<p style="font-size: 15px; color: var(--text-secondary); max-width: 90%; margin-bottom: 24px; line-height: 1.5; font-weight: 500;">' + ex.instruction + '</p>' +
            '<div style="display: flex; gap: 12px;">' +
                '<button class="btn btn-secondary" onclick="window.renderWarmupPlayer(\'' + routineKey + '\', ' + (stepIndex - 1 < 0 ? 0 : stepIndex - 1) + ')" style="flex: 1; padding: 20px; font-size: 16px; font-weight: 800; border-radius: 16px; display: flex; justify-content: center; gap: 8px; align-items: center;"><i data-lucide="skip-back" style="width: 20px;"></i> Atrás</button>' +
                '<button class="btn btn-accent" onclick="window.renderWarmupPlayer(\'' + routineKey + '\', ' + (stepIndex + 1) + ')" style="flex: 2; padding: 20px; font-size: 16px; font-weight: 800; border-radius: 16px; display: flex; justify-content: center; gap: 8px; align-items: center; box-shadow: 0 4px 20px rgba(234, 99, 44, 0.4);">Siguiente <i data-lucide="skip-forward" style="width: 20px;"></i></button>' +
            '</div>' +
        '</div>' +
    '</div>';

    mainContent.innerHTML = playerHTML;
    lucide.createIcons();

    // Timer Logic
    let timeLeft = step.duration;
    let circle = document.getElementById("warmup-timer-circle");
    let textNode = document.getElementById("warmup-timer-text");
    let initialDash = 477.5; // 2 * PI * 76

    window.warmupTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
            textNode.innerText = timeLeft;
            circle.style.strokeDashoffset = initialDash - (timeLeft / step.duration) * initialDash;
            
            // Audio beeps
            if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) {
                window.playBeep(440, 'sine', 0.1, 0.3);
            }
        } else {
            clearInterval(window.warmupTimerInterval);
            window.playBeep(880, 'sine', 0.5, 0.5); // End long beep
            setTimeout(() => {
                window.renderWarmupPlayer(routineKey, stepIndex + 1);
            }, 600);
        }
    }, 1000);
};

window.renderWorkoutPlayer = function(blockIndex = 0) {
    if (blockIndex === 0 && !window.workoutSessionStartTime) {
        window.workoutSessionStartTime = Date.now();
    }
    document.getElementById('bottom-nav').style.display = 'none';

    let todaysWorkout = state.currentProgram?.workouts?.[0] || { blocks: [{ exercise: "swing", reps: "3x15", rest: "30s" }] };
    if (blockIndex >= todaysWorkout.blocks.length) {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        renderPage();
        return;
    }
    if (blockIndex < 0) blockIndex = 0;

    let b = todaysWorkout.blocks[blockIndex];
    let exercisesDB = state.routinesDB ? state.routinesDB.exercises : null;
    let ex = exercisesDB && exercisesDB[b.exercise] ? exercisesDB[b.exercise] : { name: b.exercise, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400' };
    let totalBlocks = todaysWorkout.blocks.length;
    
    // InfoModal logic is now dynamically handled via window.showInfoModal
    let infoModalHTML = '';

    let quitModalHTML = '<div id="quit-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px);">' +
        '<div style="background: #111A18; border-radius: 20px; padding: 32px 24px; width: 100%; max-width: 320px; text-align: center; position: relative; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">' +
            '<div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(234, 99, 44, 0.1); color: var(--accent-color); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;"><i data-lucide="alert-triangle" style="width: 28px; height: 28px;"></i></div>' +
            '<h2 style="color: #FFF; font-size: 22px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">¿Terminar sesión?</h2>' +
            '<p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Your current progress will not be saved if you leave the workout now.</p>' +
            '<div style="display: flex; gap: 12px; width: 100%;">' +
                '<button onclick="document.getElementById(&apos;quit-modal&apos;).style.display=&apos;none&apos;" style="flex: 1; background: rgba(255,255,255,0.1); color: #FFF; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: background 0.2s;">Cancelar</button>' +
                '<button onclick="window.workoutSessionStartTime = null; window.renderPage();" style="flex: 1; background: #ff453a; color: #FFF; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(255,69,58,0.3);">Salir</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    // Remove nav padding from main content to avoid scroll overflow
    mainContent.style.paddingBottom = '0';

    // Distraction-free, immersive full-screen container (Deep Petrol Green)
    mainContent.innerHTML = infoModalHTML + quitModalHTML + '<div class="page hide-scrollbar" style="height: 100%; display: flex; flex-direction: column; background: #0A0F0E; color: #FFF; overflow-y: auto;">' +
        
        // Top Header
        '<header style="display: flex; justify-content: space-between; align-items: center; padding: calc(var(--spacing-lg) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md);">' +
            '<button onclick="document.getElementById(&apos;quit-modal&apos;).style.display=&apos;flex&apos;" style="background: rgba(255,255,255,0.1); border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; transition: background 0.2s;"><i data-lucide="x"></i></button>' +
            '<span style="font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 1px; font-size: 13px; text-transform: uppercase;">Exercise ' + (blockIndex + 1) + ' of ' + totalBlocks + '</span>' +
            '<div style="width: 44px;"></div>' +
        '</header>' +
        
        // Large Visual Area
        '<div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 var(--spacing-md);">' +
            '<div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 24px;">' +
                '<h1 style="font-size: 32px; font-weight: 800; letter-spacing: -1px; text-align: center; color: #FFF; margin: 0;">' + ex.name + '</h1>' +
                '<button onclick="window.showInfoModal(&apos;' + b.exercise + '&apos;)" style="background: var(--accent-color); color: #FFF; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"><i data-lucide="info" style="width: 16px; height: 16px;"></i></button>' +
            '</div>' +
            
            // Image/GIF loop
            '<div style="width: 100%; max-width: 320px; aspect-ratio: 1; background: url(&apos;' + ex.img + '&apos;) center/cover no-repeat; border-radius: var(--border-radius-lg); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 32px; position: relative; overflow: hidden;">' +
                '<div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px;"><div style="width: 8px; height: 8px; background: #32d74b; border-radius: 50%; box-shadow: 0 0 8px #32d74b; animation: pulse 2s infinite;"></div> Loop</div>' +
            '</div>' +

            // Sets & Reps / Rest Timer Block
            '<div style="display: flex; gap: 16px; width: 100%; max-width: 320px; margin-bottom: 32px;">' +
                '<div style="flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--border-radius-md); text-align: center; border: 1px solid rgba(255,255,255,0.05);">' +
                    '<h4 style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 700;">Target</h4>' +
                    '<p style="font-size: 24px; font-weight: 800; color: #FFF;">' + b.reps + '</p>' +
                '</div>' +
                '<div style="flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--border-radius-md); text-align: center; border: 1px solid rgba(255,255,255,0.05);">' +
                    '<h4 style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 700;">Rest</h4>' +
                    '<p style="font-size: 24px; font-weight: 800; color: var(--accent-color);">' + (b.rest || "45s") + '</p>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Bottom Controls
        '<div style="padding: 0 var(--spacing-md) calc(var(--spacing-xl) + env(safe-area-inset-bottom, 20px)) var(--spacing-md); margin-top: auto;">' +
            '<button class="btn btn-accent" style="width: 100%; border-radius: 16px; font-size: 18px; font-weight: 800; padding: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; box-shadow: 0 8px 30px rgba(234, 99, 44, 0.4); margin-bottom: 24px;" onclick="' + 
                (blockIndex + 1 === totalBlocks ? 'window.finishWorkoutSession()' : ('window.startRestPhase(' + blockIndex + ', ' + parseInt((b.rest || "45").replace("s","")) + ')')) + '">' +
                '<i data-lucide="check-circle" style="width: 24px; height: 24px; stroke-width: 2.5;"></i> ' + (blockIndex + 1 === totalBlocks ? 'FINISH WORKOUT' : 'COMPLETE SET') +
            '</button>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 8px;">' +
                '<button onclick="' + (blockIndex > 0 ? ('window.renderWorkoutPlayer(' + (blockIndex - 1) + ')') : 'renderPage()') + '" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 700; cursor: pointer; padding: 18px 20px; min-width: 48%;"><i data-lucide="chevron-left" style="width: 24px; height: 24px;"></i> Previous</button>' +
                '<button onclick="window.renderWorkoutPlayer(' + (blockIndex + 1) + ')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #FFF; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 700; cursor: pointer; padding: 18px 20px; min-width: 48%;">Next <i data-lucide="chevron-right" style="width: 24px; height: 24px;"></i></button>' +
            '</div>' +
        '</div>' +
        '<style>@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }</style>' +
    '</div>';
    
    lucide.createIcons();
    
    // Simulate exercise start beep/vibration feedback
    setTimeout(() => {
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            }
        } catch(e) {
            console.log("Audio not supported or interaction needed first.");
        }
    }, 500);
};

// Kick off app
function initApp() {
    initUIBlocks();
    renderPage(); // Render immediate skeleton or onboarding welcome
    
    fetch('./routines.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            state.routinesDB = data;
            if (state.hasCompletedOnboarding && !state.currentProgram) {
                state.currentProgram = window.generateAlgorithmicProgram(state.userProfile, data.exercises);
            }
            renderPage(); // Re-render with data
        })
        .catch(err => {
            console.error("No se pudo cargar la DB:", err);
            renderPage();
        });
}
initApp();
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


// --- PHASE 2.1: HEAD COACH CHAT & VOICE API ---
window.coachSpeak = function(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let msg = new SpeechSynthesisUtterance(text);
        
        // Select an energetic, young female voice
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
        
        msg.rate = 1.05; // Slightly faster, dynamic
        msg.pitch = 1.25; // Higher pitch for younger tone
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

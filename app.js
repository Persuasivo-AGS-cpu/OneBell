// Initialize icons
lucide.createIcons();

// --- STATE MANAGEMENT ---
const state = {
    currentTab: 'home',
    hasCompletedOnboarding: false,
    userProfile: {
        goal: null,
        experience: null,
        weight: null,
        isCustomWeight: false,
        unit: 'kg',
        daysPerWeek: null,
        duration: null,
        age: '',
        height: '',
        bodyWeight: ''
    }
};

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
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

function renderPage() {
    if (!state.hasCompletedOnboarding) {
        document.getElementById('bottom-nav').style.display = 'none';
        renderOnboarding();
        lucide.createIcons();
        return;
    }

    document.getElementById('bottom-nav').style.display = 'flex';
    
    switch (state.currentTab) {
        case 'home': renderHome(); break;
        case 'program': renderProgram(); break;
        case 'exercises': renderExercises(); break;
        case 'progress': renderProgress(); break;
        case 'profile': renderProfile(); break;
        default: renderHome();
    }
    
    lucide.createIcons();
}

window.setActiveTab = function(tabId) {
    state.currentTab = tabId;
    navItems.forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    renderPage();
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        window.setActiveTab(item.dataset.tab);
    });
});

// --- ONBOARDING LOGIC ---
function renderOnboarding() {
    if (onboardingStep === 0) {
        // Step 1 - Welcome
        mainContent.innerHTML = '<div class="onboarding-container" style="justify-content: flex-end; padding-bottom: 40px; background: linear-gradient(180deg, rgba(244,244,244,0.1) 0%, var(--bg-color) 80%), url(https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=2000&auto=format&fit=crop) center top/cover no-repeat; position: relative;">' +
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
        // Step 7 - Program ready
        mainContent.innerHTML = '<div class="onboarding-container" style="justify-content: center; align-items: center; text-align: center; background: var(--bg-color);">' +
            '<div style="width: 96px; height: 96px; border-radius: 50%; background: var(--primary-color); margin-bottom: 32px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">' +
                '<i data-lucide="check" style="width: 48px; height: 48px; color: white;"></i>' +
            '</div>' +
            '<h2 style="font-size: 40px; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px; color: var(--primary-color);">Your OneBell program is ready.</h2>' +
            '<p style="color: var(--text-secondary); font-size: 16px; font-weight: 500; margin-bottom: 48px;">12 weeks of customized kettlebell training designed around your profile.</p>' +
            '<button class="btn btn-primary" id="btn-finish-onboarding" style="font-size: 18px; width: 100%;">Start training</button>' +
        '</div>';
        lucide.createIcons();
        document.getElementById('btn-finish-onboarding').addEventListener('click', () => {
            state.hasCompletedOnboarding = true;
            renderPage();
        });
        return;
    }

    // Standard wrapper for steps 1-5
    mainContent.innerHTML = '<div class="onboarding-container">' +
        '<div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ' + progress + '%"></div></div>' +
        '<div class="onboarding-step">' + stepContent + '</div>' +
        '<div class="onboarding-footer">' +
            '<button class="btn btn-primary" id="btn-next-step" style="opacity: ' + (validationPassed ? '1' : '0.5') + '; pointer-events: ' + (validationPassed ? 'auto' : 'none') + ';">Continue</button>' +
        '</div>' +
    '</div>';

    lucide.createIcons();

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
    let name = "Athlete";
    let greeting = "Buenos días";
    
    // Quick stats
    let quickStatsHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;">' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">12</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">4h 20m</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Training</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">2,480</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Kcal</div>' +
        '</div>' +
    '</div>';

    // Hero card
    let heroCardHTML = '<div class="workout-card" style="background: linear-gradient(145deg, var(--primary-color) 0%, #10211e 100%); border-radius: var(--border-radius-xl); padding: 24px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); margin-bottom: 32px;">' +
        '<div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: var(--accent-color); opacity: 0.15; filter: blur(40px); border-radius: 50%; pointer-events: none;"></div>' +
        '<h3 style="font-size: 13px; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; position: relative;">Today&apos;s Workout</h3>' +
        '<h2 style="font-size: 28px; font-weight: 800; line-height: 1.1; color: #FFF; position: relative; margin-bottom: 12px; letter-spacing: -0.5px;">Kettlebell Full Body</h2>' +
        '<div style="display: flex; gap: 8px; margin-bottom: 24px; position: relative;">' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">18 min</span>' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">Fat burn</span>' +
        '</div>' +
        '<div style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px; position: relative;">' +
            '<ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; line-height: 1.6;">' +
                '<li>Goblet Squat</li><li>Kettlebell Swing</li><li>Russian Twist</li><li>Plank</li>' +
            '</ul>' +
        '</div>' +
        '<button class="btn btn-accent" id="btn-start-workout" style="width: 100%; border-radius: 12px; font-size: 16px; font-weight: 800; padding: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; position: relative; box-shadow: 0 4px 15px rgba(234, 99, 44, 0.4);" onclick="window.renderWorkoutPlayer()">' +
            '<i data-lucide="play" fill="currentColor" style="width: 20px; height: 20px;"></i> START WORKOUT' +
        '</button>' +
    '</div>';

    // Horizontal exercises
    const exercises = [
        { name: "Goblet Squat", reps: "3x10", img: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=150&h=150&fit=crop" },
        { name: "Kettlebell Swing", reps: "3x15", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop" },
        { name: "Russian Twist", reps: "3x20", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&h=150&fit=crop" },
        { name: "Plank", reps: "3x30s", img: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop" }
    ];
    let horizontalCardsHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Today&apos;s exercises</h3>' +
        '<div class="hide-scrollbar" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;">' +
        exercises.map(ex => 
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); overflow: hidden; min-width: 140px; flex-shrink: 0; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); scroll-snap-align: start;">' +
                '<div style="width: 100%; height: 100px; background: url(' + ex.img + ') center/cover;"></div>' +
                '<div style="padding: 12px;">' +
                    '<h4 style="font-size: 14px; font-weight: 700; color: var(--primary-color); line-height: 1.2; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 34px;">' + ex.name + '</h4>' +
                    '<span style="font-size: 12px; font-weight: 800; color: var(--accent-color);">' + ex.reps + '</span>' +
                '</div>' +
            '</div>'
        ).join('') +
        '</div></div>';

    // Circular Progress
    let progressHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Program progress</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); display: flex; align-items: center; justify-content: space-between;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Foundation of Iron</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">Week 3<br><span style="color: var(--text-secondary); font-size: 18px;">of 12</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--accent-color) 67%, rgba(31,63,58,0.08) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<span style="font-size: 18px; font-weight: 800; color: var(--primary-color); letter-spacing: -0.5px;">67%</span>' +
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
                '<div style="width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); position: relative;">' +
                    '<i data-lucide="bell" style="color: var(--primary-color); width: 22px; height: 22px; stroke-width: 2;"></i>' +
                    '<div style="position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: var(--accent-color); border-radius: 50%; border: 2px solid var(--card-bg);"></div>' +
                '</div>' +
                '<div style="width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);" onclick="window.setActiveTab(`profile`)">' +
                    '<i data-lucide="user" style="color: var(--primary-color); width: 22px; height: 22px; stroke-width: 2;"></i>' +
                '</div>' +
            '</div>' +
        '</header>' +
        quickStatsHTML + heroCardHTML + horizontalCardsHTML + progressHTML +
    '</div>';

    lucide.createIcons();
}

function renderProgram() {
    // Header
    let headerHTML = '<header style="margin-bottom: 24px;">' +
        '<h2 style="font-size: 14px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">The OneBell Method</h2>' +
        '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Your Program</h1>' +
    '</header>';

    // Phase Card
    let phaseCardHTML = '<div style="background: var(--card-bg-elevated); border-radius: var(--border-radius-lg); padding: 24px; margin-bottom: 32px; border: 1px solid rgba(31,63,58,0.05);">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">Week 3 &mdash; Foundation Phase</h3>' +
        '<p style="font-size: 14px; font-weight: 500; color: var(--text-secondary); line-height: 1.5;">Building kettlebell technique and strength base.</p>' +
    '</div>';

    // Weekly Calendar
    const days = [
        { label: 'M', state: 'completed' },
        { label: 'T', state: 'rest' },
        { label: 'W', state: 'today' },
        { label: 'T', state: 'upcoming' },
        { label: 'F', state: 'upcoming' },
        { label: 'S', state: 'rest' },
        { label: 'S', state: 'rest' }
    ];
    let calendarHTML = '<div style="margin-bottom: 32px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
        days.map(d => {
            let bg, color, border;
            if (d.state === 'completed') { bg = 'var(--success-color)'; color = '#FFF'; border = 'none'; }
            else if (d.state === 'today') { bg = 'var(--primary-color)'; color = '#FFF'; border = 'none'; }
            else if (d.state === 'upcoming') { bg = 'var(--card-bg)'; color = 'var(--primary-color)'; border = '2px solid rgba(31,63,58,0.1)'; }
            else { bg = 'transparent'; color = 'var(--text-tertiary)'; border = 'none'; }
            
            return '<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">' +
                '<span style="font-size: 12px; font-weight: 700; color: var(--text-tertiary);">' + d.label + '</span>' +
                '<div style="width: 36px; height: 36px; border-radius: 50%; background: ' + bg + '; border: ' + border + '; display: flex; align-items: center; justify-content: center; color: ' + color + ';">' +
                    (d.state === 'completed' ? '<i data-lucide="check" style="width: 18px; height: 18px; stroke-width: 3;"></i>' : (d.state === 'today' ? '<i data-lucide="dumbbell" style="width: 18px; height: 18px;"></i>' : '<span style="font-weight: 700; font-size: 14px;"></span>')) +
                '</div>' +
            '</div>';
        }).join('') +
    '</div></div>';

    // Today Workout Card
    let todayWorkoutHTML = '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Today</h3>' +
        '<div class="workout-card" style="background: linear-gradient(145deg, var(--primary-color) 0%, #10211e 100%); border-radius: var(--border-radius-xl); padding: 24px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); margin-bottom: 32px;">' +
        '<div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: var(--accent-color); opacity: 0.15; filter: blur(40px); border-radius: 50%; pointer-events: none;"></div>' +
        '<h2 style="font-size: 28px; font-weight: 800; line-height: 1.1; color: #FFF; position: relative; margin-bottom: 12px; letter-spacing: -0.5px;">Kettlebell Full Body</h2>' +
        '<div style="display: flex; gap: 8px; margin-bottom: 24px; position: relative;">' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">18 min</span>' +
            '<span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #FFF;">Fat burn</span>' +
        '</div>' +
        '<div style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px; position: relative;">' +
            '<ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; line-height: 1.6;">' +
                '<li>Goblet Squat</li><li>Kettlebell Swing</li><li>Russian Twist</li><li>Plank</li>' +
            '</ul>' +
        '</div>' +
        '<button class="btn btn-accent" style="width: 100%; border-radius: 12px; font-size: 16px; font-weight: 800; padding: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; position: relative; box-shadow: 0 4px 15px rgba(234, 99, 44, 0.4);" onclick="window.renderWorkoutPlayer()">' +
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

    // Program Progress Card
    let progressHTML = '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Foundation of Iron</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">Week 3<br><span style="color: var(--text-secondary); font-size: 18px;">of 12</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--accent-color) 25%, rgba(31,63,58,0.08) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<span style="font-size: 18px; font-weight: 800; color: var(--primary-color); letter-spacing: -0.5px;">25%</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Workout History
    let historyHTML = '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">History</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); opacity: 0.8;">' +
                '<div style="width: 48px; height: 48px; border-radius: var(--border-radius-sm); background: rgba(50, 215, 75, 0.1); display: flex; align-items: center; justify-content: center; color: var(--success-color); font-weight: 800; font-size: 16px;">MON</div>' +
                '<div style="flex: 1;"><h4 style="font-size: 16px; font-weight: 700; color: var(--primary-color);">Foundational Strength</h4><p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 4px;">Strength &bull; 18 min</p></div>' +
                '<i data-lucide="check-circle" style="color: var(--success-color); width: 22px; height: 22px;"></i>' +
            '</div>' +
        '</div>';

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        headerHTML + phaseCardHTML + calendarHTML + todayWorkoutHTML + upcomingHTML + progressHTML + historyHTML +
    '</div>';
    
    lucide.createIcons();
}

window.renderExerciseDetail = function(id) {
    // Hide bottom nav for immersive detail view
    document.getElementById('bottom-nav').style.display = 'none';
    
    // Stub exercise data
    const ex = {
        name: id || 'Kettlebell Swing',
        difficulty: 'Beginner',
        target: 'Full Body, Hamstrings, Glutes',
        weight: '16kg - 24kg',
        visual: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        instructions: [
            'Stand with feet shoulder-width apart, kettlebell on the floor in front of you.',
            'Hinge at the hips and grasp the kettlebell handle with both hands.',
            'Hike the kettlebell back between your legs like a football.',
            'Drive your hips forward explosively to swing the kettlebell up to chest height.',
            'Let the kettlebell fall back between your legs and repeat.'
        ],
        mistakes: [
            'Squatting instead of hinging at the hips.',
            'Using the arms to lift the kettlebell instead of hip drive.',
            'Overextending the lower back at the top of the swing.'
        ]
    };

    let html = '<div class="page no-scrollbar" style="height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--bg-color); overflow-y: auto;">' +
        // Header with back button
        '<header style="display: flex; justify-content: space-between; align-items: center; padding: calc(var(--spacing-lg) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md); background: var(--card-bg); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid rgba(31,63,58,0.05);">' +
            '<button onclick="document.getElementById(&apos;bottom-nav&apos;).style.display=&apos;flex&apos;; window.setActiveTab(&apos;exercises&apos;)" style="background: transparent; border: none; display: flex; align-items: center; justify-content: center; color: var(--primary-color); cursor: pointer;"><i data-lucide="arrow-left" style="width: 24px; height: 24px;"></i></button>' +
            '<span style="font-weight: 800; color: var(--primary-color); font-size: 16px;">Detail</span>' +
            '<div style="width: 24px;"></div>' +
        '</header>' +

        // Large Visual
        '<div style="width: 100%; height: 300px; background: url(&apos;' + ex.visual + '&apos;) center/cover no-repeat; position: relative;">' +
            '<div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 24px; background: linear-gradient(to top, rgba(31,63,58,0.9), transparent);">' +
                '<span style="background: var(--accent-color); color: #FFF; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">' + ex.difficulty + '</span>' +
                '<h1 style="color: #FFF; font-size: 32px; font-weight: 800; margin-top: 8px; letter-spacing: -0.5px;">' + ex.name + '</h1>' +
            '</div>' +
        '</div>' +

        // Quick Metadata
        '<div style="padding: 24px var(--spacing-md);">' +
            '<div style="display: flex; gap: 12px; margin-bottom: 32px; overflow-x: auto;" class="hide-scrollbar">' +
                '<div style="background: var(--card-bg); padding: 12px 16px; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm); flex-shrink: 0;">' +
                    '<h4 style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Target</h4>' +
                    '<p style="font-size: 14px; font-weight: 700; color: var(--primary-color); margin-top: 4px;">' + ex.target + '</p>' +
                '</div>' +
                '<div style="background: var(--card-bg); padding: 12px 16px; border-radius: var(--border-radius-md); border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm); flex-shrink: 0;">' +
                    '<h4 style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Weight</h4>' +
                    '<p style="font-size: 14px; font-weight: 700; color: var(--primary-color); margin-top: 4px;">' + ex.weight + '</p>' +
                '</div>' +
            '</div>' +

            // Instructions
            '<h3 style="font-size: 20px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Technique</h3>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); margin-bottom: 32px;">' +
                '<ol style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 15px; font-weight: 500; line-height: 1.6;">' +
                    ex.instructions.map(step => '<li style="margin-bottom: 12px; padding-left: 8px;">' + step + '</li>').join('') +
                '</ol>' +
            '</div>' +

            // Mistakes
            '<h3 style="font-size: 20px; font-weight: 800; color: var(--danger-color); margin-bottom: 16px;">Common Mistakes</h3>' +
            '<div style="background: rgba(234, 99, 44, 0.05); border-radius: var(--border-radius-lg); padding: 20px; border: 1px solid rgba(234, 99, 44, 0.1); margin-bottom: 40px;">' +
                '<ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 15px; font-weight: 500; line-height: 1.6;">' +
                    ex.mistakes.map(mistake => '<li style="margin-bottom: 12px; padding-left: 8px;">' + mistake + '</li>').join('') +
                '</ul>' +
            '</div>' +
        '</div>' +
    '</div>';

    mainContent.innerHTML = html;
    lucide.createIcons();
};

function renderExercises() {
    const filters = ['Beginner', 'Intermediate', 'Advanced', 'Strength', 'Core', 'Conditioning'];
    const exercisesList = [
        { name: 'Kettlebell Swing', difficulty: 'Beginner', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop' },
        { name: 'Goblet Squat', difficulty: 'Beginner', img: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400&auto=format&fit=crop' },
        { name: 'Turkish Get-Up', difficulty: 'Advanced', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
        { name: 'Snatch', difficulty: 'Advanced', img: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=400&auto=format&fit=crop' },
        { name: 'Clean & Press', difficulty: 'Intermediate', img: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=400&auto=format&fit=crop' }
    ];

    let html = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        '<header style="margin-bottom: 24px;">' +
            '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Exercises</h1>' +
            '<div style="margin-top: 16px; background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(31,63,58,0.08); box-shadow: var(--shadow-sm);">' +
                '<i data-lucide="search" style="color: var(--text-tertiary); width: 22px;"></i>' +
                '<input type="text" placeholder="Search movements..." style="background: transparent; border: none; color: var(--text-primary); font-size: 16px; width: 100%; outline: none; font-weight: 500;">' +
            '</div>' +
        '</header>' +

        // Filter Chips
        '<div class="hide-scrollbar" style="display: flex; gap: 12px; overflow-x: auto; margin-bottom: 32px; padding-bottom: 4px;">' +
            '<div style="background: var(--primary-color); color: #FFF; padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 700; white-space: nowrap; box-shadow: var(--shadow-sm);">All</div>' +
            filters.map(f => '<div style="background: var(--card-bg); color: var(--text-secondary); padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 600; white-space: nowrap; border: 1px solid rgba(31,63,58,0.05); box-shadow: var(--shadow-sm);">' + f + '</div>').join('') +
        '</div>' +

        // Exercise Grid
        '<div style="display: flex; flex-direction: column; gap: 16px;">' +
            exercisesList.map(ex => 
                '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); display: flex; align-items: center; padding: 12px; gap: 16px; cursor: pointer;" onclick="window.renderExerciseDetail(&apos;' + ex.name + '&apos;)">' +
                    '<div style="width: 80px; height: 80px; border-radius: var(--border-radius-sm); background: url(&apos;' + ex.img + '&apos;) center/cover no-repeat;"></div>' +
                    '<div style="flex: 1;">' +
                        '<h3 style="font-size: 17px; font-weight: 800; color: var(--primary-color); margin-bottom: 4px;">' + ex.name + '</h3>' +
                        '<span style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px;">' + ex.difficulty + '</span>' +
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
    let headerHTML = '<header style="margin-bottom: 24px;">' +
        '<h2 style="font-size: 14px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Week 3 of 12</h2>' +
        '<h1 style="font-size: 34px; font-weight: 800; letter-spacing: -1px; color: var(--primary-color);">Your Progress</h1>' +
    '</header>';

    let streakCardHTML = '<div style="background: linear-gradient(145deg, var(--accent-color) 0%, #c44f1c 100%); border-radius: var(--border-radius-lg); padding: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(234, 99, 44, 0.2); margin-bottom: 24px; color: #FFF; display: flex; align-items: center; justify-content: space-between;">' +
        '<div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: #FFF; opacity: 0.1; filter: blur(30px); border-radius: 50%;"></div>' +
        '<div style="position: relative; z-index: 2;">' +
            '<h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: rgba(255,255,255,0.8);">Current Streak</h3>' +
            '<div style="display: flex; align-items: baseline; gap: 8px;">' +
                '<h2 style="font-size: 42px; font-weight: 800; line-height: 1; letter-spacing: -1px;">5</h2>' +
                '<span style="font-size: 18px; font-weight: 700;">days</span>' +
            '</div>' +
            '<p style="font-size: 13px; font-weight: 600; margin-top: 8px; color: rgba(255,255,255,0.8);">Longest streak: 8 days</p>' +
        '</div>' +
        '<i data-lucide="flame" fill="currentColor" style="width: 48px; height: 48px; color: #FFF; opacity: 0.9; position: relative; z-index: 2;"></i>' +
    '</div>';

    let statsHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;">' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">12</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">4h 20m</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Training</div>' +
        '</div>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; text-align: center; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="font-size: 20px; font-weight: 800; color: var(--primary-color);">2,480</div>' +
            '<div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Kcal</div>' +
        '</div>' +
    '</div>';

    // Activity bar chart
    const chartBars = [
        { day: 'M', h: '60%', active: true },
        { day: 'T', h: '0%', active: false },
        { day: 'W', h: '85%', active: true },
        { day: 'T', h: '40%', active: true },
        { day: 'F', h: '70%', active: true },
        { day: 'S', h: '0%', active: false },
        { day: 'S', h: '0%', active: false }
    ];
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

    // Program Progress Card
    let programProgressHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Program Progress</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05); display: flex; align-items: center; justify-content: space-between;">' +
            '<div>' +
                '<p style="font-size: 13px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Foundation of Iron</p>' +
                '<h2 style="font-size: 24px; font-weight: 800; color: var(--primary-color); line-height: 1.1;">67%<br><span style="color: var(--text-secondary); font-size: 18px;">Complete</span></h2>' +
            '</div>' +
            '<div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--success-color) 67%, rgba(50, 215, 75, 0.1) 0); display: flex; align-items: center; justify-content: center; position: relative;">' +
                '<div style="width: 66px; height: 66px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">' +
                    '<i data-lucide="target" style="color: var(--success-color); width: 24px; height: 24px;"></i>' +
                '</div>' +
            '</div>' +
        '</div></div>';

    // Strength Progress
    let strengthHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Strength Progress</h3>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
                '<h4 style="font-size: 16px; font-weight: 800; color: var(--primary-color);">Goblet Squat</h4>' +
                '<span style="background: rgba(50, 215, 75, 0.1); color: var(--success-color); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px;"><i data-lucide="trending-up" style="width: 12px; height: 12px; stroke-width: 3;"></i> +4 reps</span>' +
            '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 12px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px dashed rgba(31,63,58,0.08);">' +
                    '<span style="font-size: 14px; font-weight: 600; color: var(--text-tertiary);">Week 1</span>' +
                    '<span style="font-size: 15px; font-weight: 700; color: var(--text-secondary);">3 &times; 10</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<span style="font-size: 14px; font-weight: 600; color: var(--primary-color);">Week 3</span>' +
                    '<span style="font-size: 15px; font-weight: 800; color: var(--primary-color);">3 &times; 14</span>' +
                '</div>' +
            '</div>' +
        '</div></div>';

    // Achievements
    let achievementsHTML = '<div style="margin-bottom: 32px;">' +
        '<h3 style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 16px;">Achievements</h3>' +
        '<div style="display: flex; flex-direction: column; gap: 12px;">' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 215, 0, 0.15); display: flex; align-items: center; justify-content: center; color: #DAA520;">' +
                    '<i data-lucide="award" style="width: 24px; height: 24px;"></i>' +
                '</div>' +
                '<div style="flex: 1;">' +
                    '<h4 style="font-size: 15px; font-weight: 700; color: var(--primary-color);">First 5 Workouts</h4>' +
                    '<p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">Completed Week 1 successfully.</p>' +
                '</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 215, 0, 0.15); display: flex; align-items: center; justify-content: center; color: #DAA520;">' +
                    '<i data-lucide="star" style="width: 24px; height: 24px;" fill="currentColor"></i>' +
                '</div>' +
                '<div style="flex: 1;">' +
                    '<h4 style="font-size: 15px; font-weight: 700; color: var(--primary-color);">10 Workouts Completed</h4>' +
                    '<p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">Consistency is key.</p>' +
                '</div>' +
            '</div>' +
            '<div style="background: var(--card-bg); border-radius: var(--border-radius-md); padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
                '<div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(234, 99, 44, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent-color);">' +
                    '<i data-lucide="flame" style="width: 24px; height: 24px;" fill="currentColor"></i>' +
                '</div>' +
                '<div style="flex: 1;">' +
                    '<h4 style="font-size: 15px; font-weight: 700; color: var(--primary-color);">5 Day Streak</h4>' +
                    '<p style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px;">You&apos;re on fire!</p>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        headerHTML + streakCardHTML + statsHTML + chartHTML + programProgressHTML + strengthHTML + achievementsHTML +
    '</div>';

    lucide.createIcons();
}

function renderProfile() {
    mainContent.innerHTML = '<div class="page" style="padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top, 20px)); padding-bottom: calc(var(--nav-height) + 20px);">' +
        '<header style="margin-bottom: 40px; text-align: center;">' +
            '<div style="width: 88px; height: 88px; border-radius: 50%; background: var(--card-bg); box-shadow: var(--shadow-md); margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(31,63,58,0.05);">' +
                '<i data-lucide="user" style="color: var(--primary-color); width: 36px; height: 36px;"></i>' +
            '</div>' +
            '<h1 style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: var(--primary-color);">Kettlebell Athlete</h1>' +
            '<p style="color: var(--accent-color); font-size: 14px; font-weight: 700; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">Goal: ' + ((state.userProfile.goal || 'Strength')) + '</p>' +
        '</header>' +
        '<div style="background: var(--card-bg); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(31,63,58,0.05);">' +
            '<div style="padding: 20px; border-bottom: 1px solid rgba(31,63,58,0.05); display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Kettlebell Weight</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.weight || 16) + ' ' + (state.userProfile.unit || 'kg') + '</span>' +
            '</div>' +
            '<div style="padding: 20px; border-bottom: 1px solid rgba(31,63,58,0.05); display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Training Days</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.daysPerWeek || 3) + ' / week</span>' +
            '</div>' +
            '<div style="padding: 20px; border-bottom: 1px solid rgba(31,63,58,0.05); display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Session Duration</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.duration || 30) + ' min</span>' +
            '</div>' +
            '<div style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: 600; color: var(--primary-color); font-size: 16px;">Body Profile</span>' +
                '<span style="color: var(--text-secondary); font-weight: 600;">' + (state.userProfile.bodyWeight || '--') + ' kg, ' + (state.userProfile.height || '--') + ' cm</span>' +
            '</div>' +
        '</div>' +
        '<button class="btn" onclick="window.resetApp()" style="margin-top: 32px; font-weight: 700; color: var(--accent-color); background: rgba(234, 99, 44, 0.1);">Rebuild Program</button>' +
    '</div>';
    lucide.createIcons();
}

window.resetApp = function() {
    state.hasCompletedOnboarding = false;
    onboardingStep = 0;
    renderPage();
};

window.renderWorkoutPlayer = function() {
    document.getElementById('bottom-nav').style.display = 'none';
    
    // Distraction-free, immersive full-screen container (Deep Petrol Green)
    mainContent.innerHTML = '<div class="page hide-scrollbar" style="height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--primary-color); color: #FFF; overflow-y: auto;">' +
        
        // Top Header
        '<header style="display: flex; justify-content: space-between; align-items: center; padding: calc(var(--spacing-lg) + env(safe-area-inset-top, 20px)) var(--spacing-md) var(--spacing-md) var(--spacing-md);">' +
            '<button onclick="renderPage()" style="background: rgba(255,255,255,0.1); border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; transition: background 0.2s;"><i data-lucide="x"></i></button>' +
            '<span style="font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 1px; font-size: 13px; text-transform: uppercase;">Exercise 2 of 5</span>' +
            '<div style="width: 44px;"></div>' +
        '</header>' +
        
        // Large Visual Area Placeholder
        '<div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 var(--spacing-md);">' +
            '<h1 style="font-size: 32px; font-weight: 800; letter-spacing: -1px; text-align: center; margin-bottom: 24px; color: #FFF;">Kettlebell Swing</h1>' +
            
            // Image/GIF loop placeholder
            '<div style="width: 100%; max-width: 320px; aspect-ratio: 1; background: url(&apos;https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop&apos;) center/cover no-repeat; border-radius: var(--border-radius-lg); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 32px; position: relative; overflow: hidden;">' +
                '<div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px;"><div style="width: 8px; height: 8px; background: #32d74b; border-radius: 50%; box-shadow: 0 0 8px #32d74b; animation: pulse 2s infinite;"></div> Loop</div>' +
            '</div>' +

            // Sets & Reps / Rest Timer Block
            '<div style="display: flex; gap: 16px; width: 100%; max-width: 320px; margin-bottom: 32px;">' +
                '<div style="flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--border-radius-md); text-align: center; border: 1px solid rgba(255,255,255,0.05);">' +
                    '<h4 style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 700;">Target</h4>' +
                    '<p style="font-size: 24px; font-weight: 800; color: #FFF;">3 &times; 15</p>' +
                '</div>' +
                '<div style="flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--border-radius-md); text-align: center; border: 1px solid rgba(255,255,255,0.05);">' +
                    '<h4 style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 700;">Rest</h4>' +
                    '<p style="font-size: 24px; font-weight: 800; color: var(--accent-color);">30s</p>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Bottom Controls
        '<div style="padding: 0 var(--spacing-md) calc(var(--spacing-xl) + env(safe-area-inset-bottom, 20px)) var(--spacing-md); margin-top: auto;">' +
            '<button class="btn btn-accent" style="width: 100%; border-radius: 16px; font-size: 18px; font-weight: 800; padding: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; box-shadow: 0 8px 30px rgba(234, 99, 44, 0.4); margin-bottom: 24px;" onclick="renderPage()">' +
                '<i data-lucide="check-circle" style="width: 24px; height: 24px; stroke-width: 2.5;"></i> COMPLETE SET' +
            '</button>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 8px;">' +
                '<button style="background: transparent; border: none; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0;"><i data-lucide="chevron-left" style="width: 20px; height: 20px;"></i> Previous</button>' +
                '<button style="background: transparent; border: none; color: #FFF; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0;">Next <i data-lucide="chevron-right" style="width: 20px; height: 20px;"></i></button>' +
            '</div>' +
        '</div>' +
        '<style>@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }</style>' +
    '</div>';
    
    lucide.createIcons();
};

// Kick off app
renderPage();

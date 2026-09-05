// --- Application State Management ---
const state = {
    userPlan: 'free', // 'free' or 'pro'
    dailyLimit: 5,
    generationsUsed: 0,
    currentTool: 'all-in-one',
    savedHistory: JSON.parse(localStorage.getItem('creatorAI_history')) || []
};

// --- Tool Dynamic Configurations ---
const toolConfigs = {
    'all-in-one': {
        title: '⚡ 1-Click "Create Everything" Generator',
        proOnly: true,
        inputs: [
            { id: 'topic', label: 'कंटेंट टॉपिक या मुख्य आईडिया', type: 'text', placeholder: 'जैसे: AI से पैसे कैसे कमाएं 2026 में' },
            { id: 'niche', label: 'आपकी Niche / कैटेगरी', type: 'text', placeholder: 'जैसे: Tech, Finance, Fitness' }
        ]
    },
    'idea-hook': {
        title: '🚀 Content Idea & Viral Hook Generator',
        proOnly: false,
        inputs: [
            { id: 'topic', label: 'किस विषय पर आइडियाज़ चाहिए?', type: 'text', placeholder: 'जैसे: Time Management for College Students' }
        ]
    },
    'script-gen': {
        title: '📝 Multi-Format Script Writing Studio',
        proOnly: false,
        inputs: [
            { id: 'topic', label: 'वीडियो का विषय / टॉपिक', type: 'text', placeholder: 'जैसे: 3 Best Morning Habits' },
            { id: 'format', label: 'कंटेंट फॉर्मेट चुनें', type: 'select', options: ['Instagram Reel / YouTube Short (60 sec)', 'YouTube Long Video (5 min)', 'LinkedIn Video Script'] }
        ]
    },
    'repurposer': {
        title: '🔄 Content Repurposer Engine',
        proOnly: true,
        inputs: [
            { id: 'sourceText', label: 'अपना पुराना कंटेंट या टेक्स्ट पेस्ट करें', type: 'textarea', placeholder: 'यहाँ अपनी पुरानी वीडियो स्क्रिप्ट या ब्लॉग का टेक्स्ट पेस्ट करें...' }
        ]
    },
    'thumbnail-idea': {
        title: '🎨 AI Thumbnail Ideas & Prompts Generator',
        proOnly: false,
        inputs: [
            { id: 'videoTitle', label: 'आपकी वीडियो का टाइटल', type: 'text', placeholder: 'जैसे: I Built an AI App in 24 Hours' }
        ]
    },
    'shot-list': {
        title: '🎬 Video Shot List Generator',
        proOnly: false,
        inputs: [
            { id: 'scriptConcept', label: 'स्क्रिप्ट या मुख्य स्टोरीलाइन', type: 'textarea', placeholder: 'वीडियो की मुख्य कहानी का संक्षिप्त विवरण लिखें...' }
        ]
    },
    'calendar': {
        title: '📅 AI Content Calendar Planner',
        proOnly: true,
        inputs: [
            { id: 'niche', label: 'आपकी Niche', type: 'text', placeholder: 'जैसे: Personal Finance' },
            { id: 'days', label: 'समय सीमा चुनें', type: 'select', options: ['7 Days Sprint', '30 Days Master Plan'] }
        ]
    },
    'analyzer': {
        title: '📊 AI Content Performance Analyzer',
        proOnly: true,
        inputs: [
            { id: 'metrics', label: 'अपने पिछले वीडियो के स्टैट्स दर्ज करें', type: 'textarea', placeholder: 'Views: 10k, Average Watch Time: 45%, Likes: 800. वीडियो का कंटेंट क्या था?' }
        ]
    },
    'brand-voice': {
        title: '🗣️ Personal Brand Voice & Audience Persona',
        proOnly: true,
        inputs: [
            { id: 'description', label: 'अपने और अपनी ऑडियंस के बारे में बताएं', type: 'textarea', placeholder: 'मेरी ऑडियंस 18-24 साल के स्टूडेंट्स हैं जो टेक सीखना चाहते हैं...' }
        ]
    }
};

// --- DOM Elements Reference ---
const dynamicInputs = document.getElementById('dynamicInputs');
const generatorForm = document.getElementById('generatorForm');
const currentToolTitle = document.getElementById('currentToolTitle');
const outputDisplay = document.getElementById('outputDisplay');
const dailyLimitTracker = document.getElementById('dailyLimitTracker');
const historyGrid = document.getElementById('historyGrid');
const toast = document.getElementById('toast');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const spinner = generateBtn.querySelector('.spinner');
const upgradeProBtn = document.getElementById('upgradeProBtn');
const upgradeNavBtn = document.getElementById('upgradeNavBtn');
const userPlanBadge = document.getElementById('userPlanBadge');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderInputs(state.currentTool);
    renderHistory();
    setupEventListeners();
    updateLimitTracker();
});

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Tool selection handling
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const toolKey = e.currentTarget.getAttribute('data-tool');
            
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            state.currentTool = toolKey;
            renderInputs(toolKey);
        });
    });

    // Form submission
    generatorForm.addEventListener('submit', handleGeneration);

    // Copy and Save Actions
    document.getElementById('copyOutputBtn').addEventListener('click', copyOutput);
    document.getElementById('saveOutputBtn').addEventListener('click', saveOutputToHistory);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Plan Upgrade Simulation
    upgradeProBtn.addEventListener('click', upgradeToPro);
    upgradeNavBtn.addEventListener('click', upgradeToPro);
}

// --- Dynamic Form Renderer ---
function renderInputs(toolKey) {
    const config = toolConfigs[toolKey];
    currentToolTitle.textContent = config.title;
    dynamicInputs.innerHTML = '';

    if (config.proOnly && state.userPlan === 'free') {
        dynamicInputs.innerHTML = `
            <div style="background: rgba(236,72,153,0.1); border: 1px solid var(--secondary); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                🔒 <strong>Pro Feature:</strong> यह टूल केवल Pro Plan के यूज़र्स के लिए उपलब्ध है।
            </div>
        `;
    }

    config.inputs.forEach(input => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = input.label;
        group.appendChild(label);

        if (input.type === 'text') {
            const field = document.createElement('input');
            field.type = 'text';
            field.id = input.id;
            field.className = 'form-control';
            field.placeholder = input.placeholder || '';
            field.required = true;
            group.appendChild(field);
        } else if (input.type === 'textarea') {
            const field = document.createElement('textarea');
            field.id = input.id;
            field.className = 'form-control';
            field.placeholder = input.placeholder || '';
            field.required = true;
            group.appendChild(field);
        } else if (input.type === 'select') {
            const field = document.createElement('select');
            field.id = input.id;
            field.className = 'form-control';
            input.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                field.appendChild(option);
            });
            group.appendChild(field);
        }

        dynamicInputs.appendChild(group);
    });
}

// --- AI Output Generation Handler ---
function handleGeneration(e) {
    e.preventDefault();

    const config = toolConfigs[state.currentTool];

    // Pro Check
    if (config.proOnly && state.userPlan === 'free') {
        showToast('कृपया इस टूल का उपयोग करने के लिए Pro प्लान में अपग्रेड करें!');
        return;
    }

    // Limit Check for Free Plan
    if (state.userPlan === 'free' && state.generationsUsed >= state.dailyLimit) {
        showToast('आपकी दैनिक निःशुल्क जनरेशन सीमा समाप्त हो गई है!');
        return;
    }

    // Processing UI state
    setLoadingState(true);

    setTimeout(() => {
        const result = generateMockAIResponse(state.currentTool);
        outputDisplay.textContent = result;
        setLoadingState(false);

        if (state.userPlan === 'free') {
            state.generationsUsed++;
            updateLimitTracker();
        }

        showToast('कंटेंट सफलतापूर्वक जनरेट किया गया!');
    }, 1200);
}

// --- Mock AI Content Generation Engine ---
function generateMockAIResponse(toolKey) {
    const topicVal = document.getElementById('topic')?.value || 'कंटेंट विषय';

    switch (toolKey) {
        case 'all-in-one':
            return `🔥 ALL-IN-ONE VIRAL CONTENT PACKAGE 🔥\n\n` +
                   `📌 HOOKS:\n1. Stop scrolling! अगर आप ${topicVal} में नए हैं तो यह गलती मत करना...\n2. 2026 में ${topicVal} करने का नया तरीका सामने आ गया है!\n\n` +
                   `📜 SCRIPT (60 Sec Reels/Shorts):\n[0-5s] Hook: "क्या आप भी ${topicVal} में समय बर्बाद कर रहे हैं?"\n[5-20s] Problem: "90% लोग इस पुरानी तकनीक का इस्तेमाल करते हैं जो काम नहीं करती।"\n[20-45s] Solution: "यहाँ हैं 3 सीक्रेट स्टेप्स जो आपको आज ही अपनाने चाहिए..."\n[45-60s] CTA: "और सीक्रेट टिप्स के लिए अभी Follow करें!"\n\n` +
                   `🎬 SHOT LIST:\n- Shot 1: Close-up shocked reaction\n- Shot 2: Screen recording showing workflow\n- Shot 3: Fast cuts of results\n\n` +
                   `💬 CAPTION & HASHTAGS:\n"2026 में ${topicVal} को डोमिनेट करने का यह आसान तरीका आज़माएं। ✨\n#CreatorAI #${topicVal.replace(/\s+/g, '')} #ContentCreator #ViralTips"`;

        case 'idea-hook':
            return `🚀 VIRAL HOOKS & IDEAS FOR: "${topicVal}"\n\n` +
                   `💡 Idea 1: Top 3 Myths About ${topicVal}\n` +
                   `🪝 Hook: "जो बातें आपको ${topicVal} के बारे में बताई गई हैं, वे सब झूठ हैं!"\n\n` +
                   `💡 Idea 2: How I Mastered ${topicVal} in 7 Days\n` +
                   `🪝 Hook: "मैंने सिर्फ 7 दिनों में यह तरीका सीखा और परिणाम बदल गए..."`;

        case 'script-gen':
            return `📝 AI SCRIPT WRITER\nTopic: ${topicVal}\n\n` +
                   `[Intro - 0 to 5s]:\n"यदि आप ${topicVal} सीखना चाहते हैं, तो यह वीडियो आपके लिए है!"\n\n` +
                   `[Body - 5s to 45s]:\n- Point 1: सबसे पहले बुनियादी बातों को समझें।\n- Point 2: एआई टूल्स का उपयोग करके प्रक्रिया को गति दें।\n- Point 3: निरंतरता बनाए रखें।\n\n` +
                   `[Outro & CTA - 45s to 60s]:\n"वीडियो पसंद आया? सब्सक्राइब करना न भूलें!"`;

        case 'repurposer':
            return `🔄 CONTENT REPURPOSING RESULTS\n\n` +
                   `1. 🎯 Tweet / Thread Idea:\n"${topicVal.substring(0, 50)}... यहाँ हैं मुख्य बातें (Thread 👇)"\n\n` +
                   `2. 📸 Instagram Carousel Slide Outline:\n- Slide 1: Cover Title\n- Slide 2: The Core Problem\n- Slide 3: Step-by-Step Solution\n- Slide 4: Save for later!`;

        case 'thumbnail-idea':
            return `🎨 THUMBNAIL CONCEPTS & AI PROMPTS\n\n` +
                   `🖼️ Concept 1: Split Screen Before vs After\n` +
                   `🤖 Midjourney Prompt:\n/imagine prompt: YouTube thumbnail showing shocked expression, neon text "${topicVal}", vibrant colors, hyper-realistic 8k --ar 16:9`;

        case 'shot-list':
            return `🎬 VIDEO SHOT LIST & CAMERA ANGLES\n\n` +
                   `Scene 1: Wide Shot - Creator walking towards camera.\n` +
                   `Scene 2: Close-Up - Hand typing fast on a smartphone.\n` +
                   `Scene 3: Over-the-shoulder Shot - Showing dashboard output.`;

        case 'calendar':
            return `📅 AI CONTENT CALENDAR (7-DAY SPRINT)\n\n` +
                   `Day 1: Educational Reel - "${topicVal} क्या है?"\n` +
                   `Day 2: Carousel Post - 5 Tools for ${topicVal}\n` +
                   `Day 3: Behind the Scenes Video\n` +
                   `Day 4: Common Mistakes to Avoid\n` +
                   `Day 5: Q&A / Live Session\n` +
                   `Day 6: Success Story / Case Study\n` +
                   `Day 7: Summary & Weekly Recap`;

        case 'analyzer':
            return `📊 AI PERFORMANCE IMPROVEMENT SUGGESTIONS\n\n` +
                   `1. Hook Optimization: शुरुआती 3 सेकंड में विजुअल चेंज बढ़ाएं ताकि वॉच-टाइम 15% बढ़ सके।\n` +
                   `2. Engagement CTA: कमेंट्स बढ़ाने के लिए वीडियो के अंत में एक विशिष्ट प्रश्न पूछें।`;

        case 'brand-voice':
            return `🗣️ BRAND VOICE PROFILE & PERSONA\n\n` +
                   `Tone: Energetic, Authoritative yet Friendly.\n` +
                   `Target Audience: Young digital creators looking for productivity hacks.`;

        default:
            return 'जनरेटेड कंटेंट यहाँ दिखाई देगा...';
    }
}

// --- Helper Functions ---
function setLoadingState(isLoading) {
    if (isLoading) {
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        generateBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

function updateLimitTracker() {
    if (state.userPlan === 'pro') {
        dailyLimitTracker.innerHTML = 'Plan: <strong>Unlimited Pro</strong>';
    } else {
        const remaining = state.dailyLimit - state.generationsUsed;
        dailyLimitTracker.innerHTML = `Daily Generations Left: <strong>${remaining}/${state.dailyLimit}</strong>`;
    }
}

function copyOutput() {
    const text = outputDisplay.textContent;
    if (!text || text.includes('बाएं मेनू से कोई टूल चुनें')) {
        showToast('कॉपी करने के लिए कोई कंटेंट उपलब्ध नहीं है!');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showToast('कंटेंट क्लिपबोर्ड पर कॉपी हो गया!');
    });
}

function saveOutputToHistory() {
    const text = outputDisplay.textContent;
    if (!text || text.includes('बाएं मेनू से कोई टूल चुनें')) {
        showToast('सेव करने के लिए कोई सामग्री नहीं है!');
        return;
    }

    const newItem = {
        id: Date.now(),
        tool: toolConfigs[state.currentTool].title,
        content: text,
        date: new Date().toLocaleDateString()
    };

    state.savedHistory.unshift(newItem);
    localStorage.setItem('creatorAI_history', JSON.stringify(state.savedHistory));
    renderHistory();
    showToast('प्रोजेक्ट इतिहास में सेव किया गया!');
}

function renderHistory() {
    historyGrid.innerHTML = '';
    if (state.savedHistory.length === 0) {
        historyGrid.innerHTML = '<p class="placeholder-text">कोई सेव की गई हिस्ट्री उपलब्ध नहीं है।</p>';
        return;
    }

    state.savedHistory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-card-header">
                <span class="history-card-type">${item.tool}</span>
                <span class="history-card-date">${item.date}</span>
            </div>
            <div class="history-card-body">${item.content}</div>
        `;
        historyGrid.appendChild(card);
    });
}

function clearHistory() {
    state.savedHistory = [];
    localStorage.removeItem('creatorAI_history');
    renderHistory();
    showToast('हिस्ट्री साफ़ कर दी गई!');
}

function upgradeToPro() {
    state.userPlan = 'pro';
    userPlanBadge.textContent = 'Pro Plan Active';
    userPlanBadge.style.borderColor = 'var(--secondary)';
    userPlanBadge.style.color = 'var(--secondary)';
    updateLimitTracker();
    renderInputs(state.currentTool);
    showToast('बधाई हो! आप Pro Plan में अपग्रेड हो चुके हैं।');
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

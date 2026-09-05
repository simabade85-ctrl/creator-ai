// --- Global Application State ---
const state = {
    userPlan: 'free',
    dailyLimit: 5,
    generationsUsed: 0,
    currentTool: 'all-in-one',
    savedHistory: JSON.parse(localStorage.getItem('creatorAI_history')) || []
};

// --- Tool Configurations ---
const toolConfigs = {
    'all-in-one': {
        title: '⚡ 1-Click "Create Everything" Engine',
        proOnly: true,
        inputs: [
            { id: 'topic', label: 'Main Content Topic or Keyword', type: 'text', placeholder: 'e.g., How to monetize AI tools in 2026' },
            { id: 'niche', label: 'Content Niche / Field', type: 'text', placeholder: 'e.g., Tech, Finance, Productivity' }
        ]
    },

    'idea-hook': {
        title: '🚀 Content Idea & Viral Hook Generator',
        proOnly: false,
        inputs: [
            { id: 'topic', label: 'What topic do you need ideas for?', type: 'text', placeholder: 'e.g., Time Management for Students' }
        ]
    },

    'script-gen': {
        title: '📝 Multi-Format Scriptwriter',
        proOnly: false,
        inputs: [
            { id: 'topic', label: 'Video Subject / Core Message', type: 'text', placeholder: 'e.g., 3 Habits of Effective Creators' },
            {
                id: 'format',
                label: 'Target Format',
                type: 'select',
                options: [
                    'Instagram Reel / YouTube Short (60s)',
                    'YouTube Video (5-10 min)',
                    'LinkedIn Video Script'
                ]
            }
        ]
    },

    'repurposer': {
        title: '🔄 Smart Content Repurposer',
        proOnly: true,
        inputs: [
            { id: 'sourceText', label: 'Paste Original Content', type: 'textarea', placeholder: 'Paste your long-form text here...' }
        ]
    },

    'rewrite-improve': {
        title: '✍️ AI Rewriter & Content Optimizer',
        proOnly: false,
        inputs: [
            { id: 'originalText', label: 'Original Text to Improve', type: 'textarea', placeholder: 'Enter text you want to rewrite...' },
            {
                id: 'tone',
                label: 'Target Tone',
                type: 'select',
                options: [
                    'High-Energy / Viral',
                    'Professional & Authoritative',
                    'Casual & Conversational',
                    'Storytelling'
                ]
            }
        ]
    },

    'thumbnail-idea': {
        title: '🎨 AI Thumbnail Concept & Prompt Generator',
        proOnly: false,
        inputs: [
            { id: 'videoTitle', label: 'Video Title or Concept', type: 'text', placeholder: 'e.g., I Built an AI App in 24 Hours' }
        ]
    },

    'video-prompt': {
        title: '🎬 AI Video Prompt Generator (Sora / Runway)',
        proOnly: true,
        inputs: [
            { id: 'videoConcept', label: 'Describe the scene concept', type: 'textarea', placeholder: 'Futuristic city with flying cars...' }
        ]
    },

    'shot-list': {
        title: '🎥 Video Shot List & Camera Angles',
        proOnly: false,
        inputs: [
            { id: 'scriptConcept', label: 'Video Storyline or Outline', type: 'textarea', placeholder: 'Summarize your video flow...' }
        ]
    },

    'calendar': {
        title: '📅 7/30 Day AI Content Calendar Planner',
        proOnly: true,
        inputs: [
            { id: 'niche', label: 'Your Content Niche', type: 'text', placeholder: 'e.g., Personal Finance' },
            {
                id: 'timeframe',
                label: 'Calendar Duration',
                type: 'select',
                options: [
                    '7 Days Sprint Plan',
                    '30 Days Master Strategy'
                ]
            }
        ]
    },

    'analyzer': {
        title: '📊 Viral Content Performance Analyzer',
        proOnly: true,
        inputs: [
            { id: 'metrics', label: 'Paste Recent Video Metrics', type: 'textarea', placeholder: 'e.g., Views: 25k, Retention: 42%' }
        ]
    },

    'brand-voice': {
        title: '🗣️ Personal Brand Voice Generator',
        proOnly: true,
        inputs: [
            { id: 'description', label: 'Describe yourself and target audience', type: 'textarea', placeholder: 'My channel targets students...' }
        ]
    },

    'bulk-gen': {
        title: '📦 Bulk Content Generator',
        proOnly: true,
        inputs: [
            { id: 'bulkTopic', label: 'Core Theme for Multiple Posts', type: 'text', placeholder: 'e.g., Productivity Hacks' },
            {
                id: 'count',
                label: 'Number of Items',
                type: 'select',
                options: [
                    '5 Short Posts',
                    '10 Viral Hooks',
                    '7 Reel Ideas'
                ]
            }
        ]
    },

    'assistant': {
        title: '🤖 AI Creator Assistant',
        proOnly: false,
        inputs: [
            { id: 'query', label: 'Ask your creator assistant anything', type: 'textarea', placeholder: 'e.g., How do I increase YouTube CTR?' }
        ]
    }
};


// --- DOM References ---
let dynamicInputs;
let generatorForm;
let currentToolTitle;
let outputDisplay;
let dailyLimitTracker;
let historyGrid;
let toast;
let generateBtn;
let btnText;
let spinner;
let upgradeProBtn;
let upgradeNavBtn;
let userPlanBadge;


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {

    dynamicInputs = document.getElementById('dynamicInputs');
    generatorForm = document.getElementById('generatorForm');
    currentToolTitle = document.getElementById('currentToolTitle');
    outputDisplay = document.getElementById('outputDisplay');
    dailyLimitTracker = document.getElementById('dailyLimitTracker');
    historyGrid = document.getElementById('historyGrid');
    toast = document.getElementById('toast');
    generateBtn = document.getElementById('generateBtn');

    if (generateBtn) {
        btnText = generateBtn.querySelector('.btn-text');
        spinner = generateBtn.querySelector('.spinner');
    }

    upgradeProBtn = document.getElementById('upgradeProBtn');
    upgradeNavBtn = document.getElementById('upgradeNavBtn');
    userPlanBadge = document.getElementById('userPlanBadge');

    renderInputs(state.currentTool);
    renderHistory();
    setupEventListeners();
    updateLimitTracker();
});


// --- Event Listeners ---
function setupEventListeners() {

    document.querySelectorAll('.tool-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            const toolKey = e.currentTarget.getAttribute('data-tool');

            document
                .querySelectorAll('.tool-btn')
                .forEach(b => b.classList.remove('active'));

            e.currentTarget.classList.add('active');

            state.currentTool = toolKey;

            renderInputs(toolKey);
        });
    });


    if (generatorForm) {
        generatorForm.addEventListener('submit', handleGeneration);
    }


    const copyBtn = document.getElementById('copyOutputBtn');

    if (copyBtn) {
        copyBtn.addEventListener('click', copyOutput);
    }


    const saveBtn = document.getElementById('saveOutputBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveOutputToHistory);
    }


    const exportBtn = document.getElementById('exportOutputBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportOutputText);
    }


    const clearBtn = document.getElementById('clearHistoryBtn');

    if (clearBtn) {
        clearBtn.addEventListener('click', clearHistory);
    }


    if (upgradeProBtn) {
        upgradeProBtn.addEventListener('click', upgradeToPro);
    }


    if (upgradeNavBtn) {
        upgradeNavBtn.addEventListener('click', upgradeToPro);
    }
}


// --- Dynamic Form Renderer ---
function renderInputs(toolKey) {

    const config = toolConfigs[toolKey];

    if (!config || !dynamicInputs || !currentToolTitle) {
        return;
    }

    currentToolTitle.textContent = config.title;

    dynamicInputs.innerHTML = '';


    if (config.proOnly && state.userPlan === 'free') {

        const warning = document.createElement('div');

        warning.style.cssText =
            "background: rgba(236,72,153,0.1); border: 1px solid var(--secondary); padding: 12px 15px; border-radius: 8px; margin-bottom: 12px; font-size: 0.88rem;";

        warning.innerHTML =
            "🔒 <strong>Pro Feature:</strong> Upgrade your account to access this tool without limits.";

        dynamicInputs.appendChild(warning);
    }


    config.inputs.forEach(input => {

        const group = document.createElement('div');

        group.className = 'form-group';


        const label = document.createElement('label');

        label.setAttribute('for', input.id);

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
            field.required = true;

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


// --- AI GENERATION THROUGH BACKEND ---
async function handleGeneration(e) {

    e.preventDefault();

    const config = toolConfigs[state.currentTool];

    if (!config) {
        showToast('Please select a tool.');
        return;
    }


    if (config.proOnly && state.userPlan === 'free') {

        showToast('Please upgrade to Pro to unlock this feature!');

        return;
    }


    if (
        state.userPlan === 'free' &&
        state.generationsUsed >= state.dailyLimit
    ) {

        showToast(
            'Daily generation limit reached! Upgrade to Pro for unlimited access.'
        );

        return;
    }


    const inputs =
        dynamicInputs.querySelectorAll('.form-control');


    let promptDetails = '';


    inputs.forEach(input => {

        const label =
            input.previousElementSibling
                ? input.previousElementSibling.textContent
                : input.id;

        promptDetails +=
            `${label}: ${input.value}\n`;
    });


    const fullPrompt = `
You are an expert AI content creator assistant.

Tool Selected:
${config.title}

User Inputs:
${promptDetails}
Please generate a concise, useful and well-structured output. Keep the response short and practical. Do not add bonus tips or unnecessary explanations..
For content calendars, give only the requested days with: Content Idea, Hook, Caption Idea, and CTA. Keep each item concise. Do not add bonus tips, hashtags, bio optimization, or extra strategy unless specifically requested.
make answer short not too short average but perfect point wise use emojis and dont use some extra symbols like *#e.t.c`

    setLoadingState(true);

    if (outputDisplay) {
        outputDisplay.textContent =
            "🤖 AI is thinking and generating content...";
    }


    try {

        // IMPORTANT:
        // Request goes to your backend.
        // Gemini API key stays on the server.

        const response = await fetch(
            "http://localhost:3000/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: fullPrompt
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                `Server error: ${response.status}`
            );
        }


        
    const aiText = (data.text || data.response || data.message || "").replace(/\*\*/g, "");


        if (aiText) {

            outputDisplay.textContent = aiText;

            showToast(
                'Content generated successfully! 🎉'
            );


            if (state.userPlan === 'free') {

                state.generationsUsed++;

                updateLimitTracker();
            }

        } else {

            outputDisplay.textContent =
                "AI returned an empty response.";

        }

    } catch (err) {

        console.error("AI Error:", err);

        outputDisplay.textContent =
            "❌ AI Error: " + err.message;

        showToast(
            "Could not connect to AI server."
        );

    } finally {

        setLoadingState(false);
    }
}


// --- Loading State ---
function setLoadingState(isLoading) {

    if (isLoading) {

        if (btnText) {
            btnText.classList.add('hidden');
        }

        if (spinner) {
            spinner.classList.remove('hidden');
        }

        if (generateBtn) {
            generateBtn.disabled = true;
        }

    } else {

        if (btnText) {
            btnText.classList.remove('hidden');
        }

        if (spinner) {
            spinner.classList.add('hidden');
        }

        if (generateBtn) {
            generateBtn.disabled = false;
        }
    }
}


// --- Limit Tracker ---
function updateLimitTracker() {

    if (!dailyLimitTracker) {
        return;
    }


    if (state.userPlan === 'pro') {

        dailyLimitTracker.innerHTML =
            'Plan Status: <strong>Pro (Unlimited)</strong>';

    } else {

        const remaining =
            state.dailyLimit -
            state.generationsUsed;

        dailyLimitTracker.innerHTML =
            `Daily Generations Left: <strong>${remaining}/${state.dailyLimit}</strong>`;
    }
}


// --- Copy Output ---
function copyOutput() {

    if (!outputDisplay) {
        return;
    }


    const text =
        outputDisplay.textContent;


    if (
        !text ||
        text.includes('Select a tool') ||
        text.includes('AI is thinking')
    ) {
        return;
    }


    navigator.clipboard
        .writeText(text)
        .then(() => {
            showToast('Copied to clipboard! 📋');
        })
        .catch(() => {
            showToast('Could not copy text.');
        });
}


// --- Save Output ---
function saveOutputToHistory() {

    if (!outputDisplay) {
        return;
    }


    const text =
        outputDisplay.textContent;


    if (
        !text ||
        text.includes('Select a tool') ||
        text.includes('AI is thinking')
    ) {
        return;
    }


    const newItem = {

        id: Date.now(),

        tool:
            toolConfigs[state.currentTool].title,

        content: text,

        date:
            new Date().toLocaleDateString()
    };


    state.savedHistory.unshift(newItem);


    localStorage.setItem(
        'creatorAI_history',
        JSON.stringify(state.savedHistory)
    );


    renderHistory();


    showToast(
        'Saved to Project History! 💾'
    );
}


// --- Export Output ---
function exportOutputText() {

    if (!outputDisplay) {
        return;
    }


    const text =
        outputDisplay.textContent;


    if (
        !text ||
        text.includes('Select a tool') ||
        text.includes('AI is thinking')
    ) {
        return;
    }


    const blob =
        new Blob(
            [text],
            { type: 'text/plain' }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement('a');


    a.href = url;


    a.download =
        `CreatorAI_${state.currentTool}_${Date.now()}.txt`;


    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);


    URL.revokeObjectURL(url);


    showToast(
        'File exported successfully! 📄'
    );
}


// --- Render History ---
function renderHistory() {

    if (!historyGrid) {
        return;
    }


    historyGrid.innerHTML = '';


    if (state.savedHistory.length === 0) {

        historyGrid.innerHTML =
            '<p class="placeholder-text">No saved project history found.</p>';

        return;
    }


    state.savedHistory.forEach(item => {

        const card =
            document.createElement('div');


        card.className =
            'history-card';


        const header =
            document.createElement('div');

        header.className =
            'history-card-header';


        const type =
            document.createElement('span');

        type.className =
            'history-card-type';

        type.textContent =
            item.tool;


        const date =
            document.createElement('span');

        date.className =
            'history-card-date';

        date.textContent =
            item.date;


        header.appendChild(type);

        header.appendChild(date);


        const body =
            document.createElement('div');

        body.className =
            'history-card-body';

        body.textContent =
            item.content;


        card.appendChild(header);

        card.appendChild(body);


        historyGrid.appendChild(card);
    });
}


// --- Clear History ---
function clearHistory() {

    state.savedHistory = [];

    localStorage.removeItem(
        'creatorAI_history'
    );


    renderHistory();


    showToast(
        'Saved history cleared!'
    );
}


// --- Upgrade To Pro ---
function upgradeToPro() {
    showToast("Payment system is not connected yet.");
}


    if (userPlanBadge) {

        userPlanBadge.textContent =
            'Pro Tier';

        userPlanBadge.style.borderColor =
            'var(--secondary)';

        userPlanBadge.style.color =
            'var(--secondary)';
    }


    updateLimitTracker();

    renderInputs(
        state.currentTool
    );


    showToast(
        'Upgraded to Pro Plan! 🚀'
    );


// --- Toast ---
function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add('show');


    setTimeout(() => {

        toast.classList.remove('show');

    }, 3000);
}
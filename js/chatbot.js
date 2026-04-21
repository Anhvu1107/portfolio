// ========================================
// CV Chatbot - Natural Conversation
// Nguyen Anh Vu Portfolio
// ========================================

(function () {
    // API Config
    const OPENROUTER_API_KEY = '';
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    // System prompt - STRICT: Only CV info, NO hallucination
    const SYSTEM_PROMPT = `Bạn LÀ Nguyễn Anh Vũ. CHỈ trả lời dựa trên thông tin CV bên dưới. TUYỆT ĐỐI KHÔNG bịa thông tin.

=== THÔNG TIN CV (CHỈ TRẢ LỜI VỀ NHỮNG NÀY) ===
- Tên: Nguyễn Anh Vũ
- Vị trí hiện tại: TP. Hồ Chí Minh
- Mục tiêu: Intern/Junior Developer

Kỹ năng: Python, JavaScript, C#, C/C++, SQL, HTML, CSS, FastAPI, React, Node.js, Unity, Docker, Git, CCNA, ESP32, MQTT, Arduino, LangChain, RAG

Kinh nghiệm làm việc:
1. AI Development Intern @ NEWIT Vietnam (2025-Nay)
2. Network-IoT Engineer @ VINTECHCO (2023-2024)
3. IT Helpdesk Intern @ Asia Tech (2022-2023)

Dự án: AI Chatbot Widget, Flappy Bird Unity, Weather Dashboard, Digital Scale IoT

Học vấn: ĐH Công nghiệp TP.HCM, ngành CNTT

=== QUY TẮC BẮT BUỘC ===
1. CHỈ trả lời về: kỹ năng, kinh nghiệm, dự án, học vấn, liên hệ, vị trí làm việc
2. KHÔNG ĐƯỢC bịa thông tin về cuộc sống cá nhân (du lịch, từng sống ở đâu, sở thích cá nhân...)
3. Nếu câu hỏi KHÔNG có trong CV → trả lời: "Mình chỉ có thể chia sẻ về kinh nghiệm làm việc và kỹ năng thôi!"
4. Trả lời ngắn gọn (1-2 câu)
5. Dùng "mình" hoặc "tôi"

=== VÍ DỤ ===
✅ "biết python không?" → "Có! Python là ngôn ngữ chính mình dùng cho AI/ML và FastAPI."
✅ "làm ở đâu?" → "Mình đang là AI Intern ở NEWIT Vietnam, trước đó làm ở VINTECHCO và Asia Tech."
❌ "đi phú quốc chưa?" → "Mình chỉ chia sẻ về CV thôi nhé!"
❌ "từng sống ở hà nội?" → "Mình chỉ chia sẻ về CV thôi! Hiện tại mình đang ở TP.HCM."`;


    // Off-topic keywords - auto refuse these
    const OFF_TOPIC = [
        'thời tiết', 'weather', 'mưa', 'nắng',
        'mấy giờ', 'what time', 'thứ mấy', 'ngày mấy', 'hôm nay là', 'bây giờ',
        'bao nhiêu tuổi', 'how old', 'sinh năm',
        'có người yêu', 'girlfriend', 'boyfriend', 'vợ', 'chồng',
        'ăn gì', 'uống gì', 'thích ăn',
        'chơi game nào', 'xem phim', 'bóng đá', 'world cup',
        'tính toán', 'calculate', '1+1', 'bằng bao nhiêu',
        'kể chuyện', 'tell story', 'joke',
        'phú quốc', 'đà lạt', 'nha trang', 'huế', 'vũng tàu', 'du lịch', 'travel',
        'từng sống', 'quê ở', 'sinh ra', 'lớn lên',
        'sở thích', 'hobby', 'thích gì', 'ghét gì'
    ];

    let chatHistory = [];
    let isOpen = false;
    let currentLang = localStorage.getItem('lang') || 'en';

    // Check off-topic
    function isOffTopic(msg) {
        const lower = msg.toLowerCase();
        return OFF_TOPIC.some(kw => lower.includes(kw));
    }

    // Smart fallback when API fails
    function getFallbackResponse(msg) {
        const m = msg.toLowerCase();
        const isVi = currentLang === 'vi';

        if (m.includes('làm') || m.includes('công ty') || m.includes('kinh nghiệm') || m.includes('work') || m.includes('experience')) {
            return isVi
                ? 'Mình đang làm AI Development Intern ở NEWIT Vietnam, trước đó từng làm Network-IoT Engineer ở VINTECHCO. Bạn muốn biết chi tiết công ty nào?'
                : "I'm an AI Development Intern at NEWIT Vietnam. Previously worked at VINTECHCO and Asia Tech. Want details?";
        }
        if (m.includes('biết') || m.includes('skill') || m.includes('python') || m.includes('code') || m.includes('lập trình')) {
            return isVi
                ? 'Có! Mình biết Python, JavaScript, React, FastAPI, và IoT với ESP32. Bạn muốn hỏi cụ thể công nghệ nào?'
                : "Yes! I know Python, JavaScript, React, FastAPI, and IoT. Which tech interests you?";
        }
        if (m.includes('dự án') || m.includes('project')) {
            return isVi
                ? 'Mình đã làm AI Chatbot Widget, game Flappy Bird, Weather Dashboard, và Digital Scale IoT!'
                : "I've built AI Chatbot Widget, Flappy Bird game, Weather Dashboard, and Digital Scale IoT!";
        }
        if (m.includes('học') || m.includes('trường') || m.includes('education')) {
            return isVi
                ? 'Mình đang học CNTT ở Đại học Công nghiệp TP.HCM, có kiến thức mạng CCNA!'
                : "I'm studying IT at Industry University of HCMC with CCNA networking knowledge!";
        }
        if (m.includes('ở đâu') || m.includes('where') || m.includes('sống')) {
            return isVi ? 'Mình đang ở TP.HCM, sẵn sàng làm onsite hoặc remote!' : "I'm in Ho Chi Minh City, open to onsite or remote!";
        }
        if (m.includes('liên hệ') || m.includes('contact')) {
            return isVi ? 'Liên hệ mình qua trang Contact hoặc social media ở footer nhé!' : "Reach me through Contact page or social links in footer!";
        }
        if (m.includes('chào') || m.includes('hello') || m.includes('hi')) {
            return isVi ? 'Chào bạn! Mình là Anh Vũ. Hỏi gì về mình đi!' : "Hi! I'm Anh Vu. What would you like to know?";
        }
        if (m.includes('ai') || m.includes('tên') || m.includes('who')) {
            return isVi ? 'Mình là Anh Vũ - AI Engineer, IoT Developer. Đang tìm việc Intern/Junior!' : "I'm Anh Vu - AI Engineer, IoT Developer. Seeking Intern/Junior roles!";
        }
        return isVi ? 'Hỏi mình về kỹ năng, kinh nghiệm hoặc dự án nhé!' : "Ask me about my skills, experience, or projects!";
    }

    // Call AI
    async function callAI(message) {
        const langNote = currentLang === 'vi' ? 'Trả lời bằng tiếng Việt.' : 'Reply in English.';

        chatHistory.push({ role: 'user', content: message });

        // Keep only last 8 messages
        if (chatHistory.length > 8) {
            chatHistory = chatHistory.slice(-8);
        }

        if (!OPENROUTER_API_KEY) {
            return getFallbackResponse(message);
        }

        try {
            const res = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Anh Vu Portfolio'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.2-3b-instruct:free',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT + '\n\n' + langNote },
                        ...chatHistory
                    ],
                    max_tokens: 200,
                    temperature: 0.8
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('API Error:', data);
                throw new Error('API failed');
            }

            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
                chatHistory.push({ role: 'assistant', content: reply });
                return reply;
            }
            throw new Error('No reply');
        } catch (e) {
            console.error('Chat error:', e);
            // Use smart fallback instead of generic error
            return getFallbackResponse(message);
        }
    }

    // Process message
    async function processMessage(msg) {
        // Check off-topic first
        if (isOffTopic(msg)) {
            await new Promise(r => setTimeout(r, 300));
            return currentLang === 'vi'
                ? 'Xin lỗi, mình chỉ có thể trả lời về bản thân mình thôi! 😅 Bạn hỏi về kỹ năng, kinh nghiệm hay dự án của mình nhé!'
                : "Sorry, I can only talk about myself! 😅 Ask me about my skills, experience, or projects!";
        }

        // Send to AI for natural response
        return await callAI(msg);
    }

    // Create widget
    function createWidget() {
        const div = document.createElement('div');
        div.id = 'cv-chatbot';

        const welcome = currentLang === 'vi'
            ? 'Xin chào! Mình là <strong>Anh Vũ</strong>. Bạn muốn biết gì về mình? 👋'
            : "Hi! I'm <strong>Anh Vu</strong>. What would you like to know? 👋";

        div.innerHTML = `
            <button class="chatbot-toggle" id="chatbotToggle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        </svg>
                    </div>
                    <div class="chatbot-info">
                        <span class="chatbot-name">Anh Vũ</span>
                        <span class="chatbot-status">● Online</span>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">×</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="message bot"><div class="message-content">${welcome}</div></div>
                </div>
                <form class="chatbot-input" id="chatbotForm">
                    <input type="text" id="chatbotInput" placeholder="${currentLang === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}" autocomplete="off">
                    <button type="submit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(div);
    }

    // Styles
    function addStyles() {
        const s = document.createElement('style');
        s.textContent = `
            #cv-chatbot { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; cursor: auto; }
            #cv-chatbot * { cursor: auto; }
            .chatbot-toggle { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(99,102,241,0.4); transition: all 0.3s; }
            .chatbot-toggle:hover { transform: scale(1.05); }
            .chatbot-toggle svg { width: 24px; height: 24px; color: white; }
            .chatbot-toggle.hidden { opacity: 0; pointer-events: none; }
            .chatbot-window { position: absolute; bottom: 0; right: 0; width: 400px; height: 550px; background: var(--bg-secondary, #1a1a2e); border-radius: 20px; box-shadow: 0 10px 50px rgba(0,0,0,0.4); display: none; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); }
            .chatbot-window.open { display: flex; animation: slideUp 0.3s; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .chatbot-header { display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 20px 20px 0 0; }
            .chatbot-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
            .chatbot-avatar svg { width: 20px; height: 20px; }
            .chatbot-info { flex: 1; }
            .chatbot-name { font-weight: 600; font-size: 14px; display: block; }
            .chatbot-status { font-size: 12px; color: #4ade80; }
            .chatbot-close { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
            .chatbot-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--bg-primary, #0f0f1a); }
            .message { max-width: 85%; animation: fadeIn 0.3s; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .message.user { align-self: flex-end; }
            .message.bot { align-self: flex-start; }
            .message-content { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; white-space: pre-line; }
            .message.user .message-content { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-bottom-right-radius: 4px; }
            .message.bot .message-content { background: var(--bg-secondary, #1a1a2e); color: var(--text-primary, #fff); border: 1px solid rgba(255,255,255,0.1); border-bottom-left-radius: 4px; }
            .typing .message-content { display: flex; gap: 4px; padding: 14px 18px; }
            .typing-dot { width: 8px; height: 8px; background: #888; border-radius: 50%; animation: bounce 1.4s infinite; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
            .chatbot-input { display: flex; gap: 8px; padding: 12px 16px; background: var(--bg-secondary, #1a1a2e); border-top: 1px solid rgba(255,255,255,0.1); }
            .chatbot-input input { flex: 1; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; background: var(--bg-primary, #0f0f1a); color: var(--text-primary, #fff); font-size: 14px; outline: none; }
            .chatbot-input input:focus { border-color: #6366f1; }
            .chatbot-input button { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .chatbot-input button svg { width: 18px; height: 18px; color: white; }
            [data-theme="light"] .chatbot-window { background: #fff; }
            [data-theme="light"] .chatbot-messages { background: #f8f9fa; }
            [data-theme="light"] .message.bot .message-content { background: #fff; color: #1a1a2e; }
            [data-theme="light"] .chatbot-input { background: #fff; }
            [data-theme="light"] .chatbot-input input { background: #f8f9fa; color: #1a1a2e; }
            @media (max-width: 480px) { #cv-chatbot { bottom: 16px; right: 16px; } .chatbot-window { width: calc(100vw - 32px); height: 70vh; } }
        `;
        document.head.appendChild(s);
    }

    function addMessage(text, isUser) {
        const c = document.getElementById('chatbotMessages');
        const d = document.createElement('div');
        d.className = `message ${isUser ? 'user' : 'bot'}`;
        d.innerHTML = `<div class="message-content">${text}</div>`;
        c.appendChild(d);
        c.scrollTop = c.scrollHeight;
    }

    function showTyping() {
        const c = document.getElementById('chatbotMessages');
        const d = document.createElement('div');
        d.className = 'message bot typing';
        d.id = 'typing';
        d.innerHTML = `<div class="message-content"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
        c.appendChild(d);
        c.scrollTop = c.scrollHeight;
    }

    function hideTyping() {
        document.getElementById('typing')?.remove();
    }

    function init() {
        addStyles();
        createWidget();

        const toggle = document.getElementById('chatbotToggle');
        const win = document.getElementById('chatbotWindow');
        const close = document.getElementById('chatbotClose');
        const form = document.getElementById('chatbotForm');
        const input = document.getElementById('chatbotInput');

        toggle.onclick = () => {
            isOpen = !isOpen;
            win.classList.toggle('open', isOpen);
            toggle.classList.toggle('hidden', isOpen);
            if (isOpen) input.focus();
        };

        close.onclick = () => {
            isOpen = false;
            win.classList.remove('open');
            toggle.classList.remove('hidden');
        };

        form.onsubmit = async (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (!msg) return;

            input.value = '';
            addMessage(msg, true);
            showTyping();

            const reply = await processMessage(msg);
            hideTyping();
            addMessage(reply, false);
        };

        window.addEventListener('languageChanged', () => {
            currentLang = localStorage.getItem('lang') || 'en';
            input.placeholder = currentLang === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

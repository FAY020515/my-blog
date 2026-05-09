/**
 * çè¨æ¿èæ¬ - è¿æ¥åç«¯ API çæ¬
 * 
 * åè½ï¼
 * 1. ç¨æ·æ³¨ååç»å½
 * 2. ä»åç«¯è·åçè¨
 * 3. åè¡¨çè¨ï¼éç»å½ï¼
 * 4. å é¤çè¨ï¼åªè½å é¤èªå·±çï¼
 */

// ========== éç½® ==========
// åç«¯ API å°å
const API_URL = 'https://my-blog-server-knhag0yqn-fay020515-s-projects.vercel.app/api';

// ========== ç¶æç®¡ç ==========
let currentUser = null;  // å½åç»å½ç¨æ·
let authToken = null;    // ç»å½ä»¤ç

// ========== åå§å ==========
function initGuestbook() {
    // ä» localStorage æ¢å¤ç»å½ç¶æ
    const savedToken = localStorage.getItem('blog-token');
    const savedUser = localStorage.getItem('blog-user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    // å è½½çè¨
    loadMessages();
}

// ========== ç¨æ·è®¤è¯ ==========

/**
 * æ¾ç¤ºç»å½/æ³¨åå¼¹çª
 */
function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle');
    const nicknameField = document.getElementById('auth-nickname-field');
    
    if (mode === 'login') {
        title.textContent = 'ç»å½';
        submitBtn.textContent = 'ç»å½';
        submitBtn.onclick = handleLogin;
        toggleLink.textContent = 'æ²¡æè´¦å·ï¼å»æ³¨å';
        toggleLink.onclick = () => showAuthModal('register');
        nicknameField.style.display = 'none';
    } else {
        title.textContent = 'æ³¨å';
        submitBtn.textContent = 'æ³¨å';
        submitBtn.onclick = handleRegister;
        toggleLink.textContent = 'å·²æè´¦å·ï¼å»ç»å½';
        toggleLink.onclick = () => showAuthModal('login');
        nicknameField.style.display = 'block';
    }
    
    modal.classList.add('show');
}

/**
 * å³é­å¼¹çª
 */
function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('show');
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-nickname').value = '';
}

/**
 * å¤çç»å½
 */
async function handleLogin() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!username || !password) {
        showToast('è¯·è¾å¥ç¨æ·ååå¯ç ', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || 'ç»å½å¤±è´¥', 'error');
            return;
        }
        
        // ä¿å­ç»å½ç¶æ
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('blog-token', authToken);
        localStorage.setItem('blog-user', JSON.stringify(currentUser));
        
        closeAuthModal();
        updateAuthUI();
        showToast('ç»å½æåï¼');
        
    } catch (error) {
        console.error('ç»å½éè¯¯:', error);
        showToast('ç½ç»éè¯¯ï¼è¯·ç¨åéè¯', 'error');
    }
}

/**
 * å¤çæ³¨å
 */
async function handleRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const nickname = document.getElementById('auth-nickname').value.trim();
    
    if (!username || !password) {
        showToast('è¯·è¾å¥ç¨æ·ååå¯ç ', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('å¯ç è³å°éè¦6ä¸ªå­ç¬¦', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, nickname: nickname || username })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || 'æ³¨åå¤±è´¥', 'error');
            return;
        }
        
        // ä¿å­ç»å½ç¶æ
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('blog-token', authToken);
        localStorage.setItem('blog-user', JSON.stringify(currentUser));
        
        closeAuthModal();
        updateAuthUI();
        showToast('æ³¨åæåï¼');
        
    } catch (error) {
        console.error('æ³¨åéè¯¯:', error);
        showToast('ç½ç»éè¯¯ï¼è¯·ç¨åéè¯', 'error');
    }
}

/**
 * éåºç»å½
 */
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('blog-token');
    localStorage.removeItem('blog-user');
    updateAuthUI();
    showToast('å·²éåºç»å½');
}

/**
 * æ´æ°ç»å½ç¶æ UI
 */
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const messageForm = document.getElementById('message-form-section');
    
    if (currentUser) {
        // å·²ç»å½
        authSection.innerHTML = `
            <div class="user-info">
                <div class="user-avatar" style="background: ${currentUser.avatarColor}">${currentUser.nickname.charAt(0).toUpperCase()}</div>
                <span class="user-name">${currentUser.nickname}</span>
                <button class="logout-btn" onclick="handleLogout()">éåº</button>
            </div>
        `;
        messageForm.style.display = 'block';
    } else {
        // æªç»å½
        authSection.innerHTML = `
            <button class="login-btn" onclick="showAuthModal('login')">ç»å½</button>
            <button class="register-btn" onclick="showAuthModal('register')">æ³¨å</button>
        `;
        messageForm.style.display = 'none';
    }
}

// ========== çè¨åè½ ==========

/**
 * å è½½çè¨åè¡¨
 */
async function loadMessages() {
    const listEl = document.getElementById('message-list');
    const countEl = document.getElementById('message-count');
    
    try {
        const response = await fetch(`${API_URL}/messages`);
        const data = await response.json();
        
        countEl.textContent = `å± ${data.messages.length} æ¡çè¨`;
        
        if (data.messages.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">ð¬</div>
                    <p>è¿æ²¡æçè¨ï¼æ¥åç¬¬ä¸ä¸ªçè¨çäººå§ï¼</p>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = data.messages.map((msg, index) => `
            <article class="message-card" style="animation-delay: ${index * 0.05}s">
                <div class="message-header">
                    <div class="message-author">
                        <div class="message-avatar" style="background: ${msg.author.avatarColor}">${msg.author.nickname.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="message-name">${escapeHtml(msg.author.nickname)}</div>
                            <div class="message-time">${formatTime(msg.createdAt)}</div>
                        </div>
                    </div>
                    ${currentUser && currentUser.id === msg.author.id ? 
                        `<button class="message-delete" onclick="deleteMessage(${msg.id})">å é¤</button>` : 
                        ''}
                </div>
                <div class="message-content">${escapeHtml(msg.content)}</div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('å è½½çè¨éè¯¯:', error);
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="emoji">â ï¸</div>
                <p>å è½½å¤±è´¥ï¼è¯·å·æ°é¡µé¢éè¯</p>
            </div>
        `;
    }
}

/**
 * åè¡¨çè¨
 */
async function submitMessage() {
    if (!currentUser || !authToken) {
        showToast('è¯·åç»å½', 'error');
        showAuthModal('login');
        return;
    }
    
    const contentInput = document.getElementById('content-input');
    const content = contentInput.value.trim();
    
    if (!content) {
        showToast('è¯·è¾å¥çè¨åå®¹', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || 'åè¡¨å¤±è´¥', 'error');
            return;
        }
        
        contentInput.value = '';
        loadMessages();
        showToast('åè¡¨æåï¼');
        
    } catch (error) {
        console.error('åè¡¨çè¨éè¯¯:', error);
        showToast('ç½ç»éè¯¯ï¼è¯·ç¨åéè¯', 'error');
    }
}

/**
 * å é¤çè¨
 */
async function deleteMessage(id) {
    if (!confirm('ç¡®å®è¦å é¤è¿æ¡çè¨åï¼')) return;
    
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || 'å é¤å¤±è´¥', 'error');
            return;
        }
        
        loadMessages();
        showToast('å é¤æå');
        
    } catch (error) {
        console.error('å é¤çè¨éè¯¯:', error);
        showToast('ç½ç»éè¯¯ï¼è¯·ç¨åéè¯', 'error');
    }
}

// ========== å·¥å·å½æ° ==========

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}å¹´${month}æ${day}æ¥ ${hours}:${minutes}`;
}

function showToast(text, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.style.background = type === 'error' ? '#e74c3c' : '#00b894';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function clearForm() {
    document.getElementById('content-input').value = '';
}

// ========== é¡µé¢å è½½ ==========
document.addEventListener('DOMContentLoaded', initGuestbook);

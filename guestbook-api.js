/**
 * 留言板脚本 - 连接后端 API 版本
 * 
 * 功能：
 * 1. 用户注册和登录
 * 2. 从后端获取留言
 * 3. 发表留言（需登录）
 * 4. 删除留言（只能删除自己的）
 */

// ========== 配置 ==========
// 后端 API 地址
const API_URL = 'https://my-blog-server-drtg58j60-fay020515-s-projects.vercel.app/api';

// ========== 状态管理 ==========
let currentUser = null;  // 当前登录用户
let authToken = null;    // 登录令牌

// ========== 初始化 ==========
function initGuestbook() {
    // 从 localStorage 恢复登录状态
    const savedToken = localStorage.getItem('blog-token');
    const savedUser = localStorage.getItem('blog-user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    // 加载留言
    loadMessages();
}

// ========== 用户认证 ==========

/**
 * 显示登录/注册弹窗
 */
function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle');
    const nicknameField = document.getElementById('auth-nickname-field');
    
    if (mode === 'login') {
        title.textContent = '登录';
        submitBtn.textContent = '登录';
        submitBtn.onclick = handleLogin;
        toggleLink.textContent = '没有账号？去注册';
        toggleLink.onclick = () => showAuthModal('register');
        nicknameField.style.display = 'none';
    } else {
        title.textContent = '注册';
        submitBtn.textContent = '注册';
        submitBtn.onclick = handleRegister;
        toggleLink.textContent = '已有账号？去登录';
        toggleLink.onclick = () => showAuthModal('login');
        nicknameField.style.display = 'block';
    }
    
    modal.classList.add('show');
}

/**
 * 关闭弹窗
 */
function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('show');
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-nickname').value = '';
}

/**
 * 处理登录
 */
async function handleLogin() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!username || !password) {
        showToast('请输入用户名和密码', 'error');
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
            showToast(data.error || '登录失败', 'error');
            return;
        }
        
        // 保存登录状态
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('blog-token', authToken);
        localStorage.setItem('blog-user', JSON.stringify(currentUser));
        
        closeAuthModal();
        updateAuthUI();
        showToast('登录成功！');
        
    } catch (error) {
        console.error('登录错误:', error);
        showToast('网络错误，请稍后重试', 'error');
    }
}

/**
 * 处理注册
 */
async function handleRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const nickname = document.getElementById('auth-nickname').value.trim();
    
    if (!username || !password) {
        showToast('请输入用户名和密码', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码至少需要6个字符', 'error');
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
            showToast(data.error || '注册失败', 'error');
            return;
        }
        
        // 保存登录状态
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('blog-token', authToken);
        localStorage.setItem('blog-user', JSON.stringify(currentUser));
        
        closeAuthModal();
        updateAuthUI();
        showToast('注册成功！');
        
    } catch (error) {
        console.error('注册错误:', error);
        showToast('网络错误，请稍后重试', 'error');
    }
}

/**
 * 退出登录
 */
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('blog-token');
    localStorage.removeItem('blog-user');
    updateAuthUI();
    showToast('已退出登录');
}

/**
 * 更新登录状态 UI
 */
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const messageForm = document.getElementById('message-form-section');
    
    if (currentUser) {
        // 已登录
        authSection.innerHTML = `
            <div class="user-info">
                <div class="user-avatar" style="background: ${currentUser.avatarColor}">${currentUser.nickname.charAt(0).toUpperCase()}</div>
                <span class="user-name">${currentUser.nickname}</span>
                <button class="logout-btn" onclick="handleLogout()">退出</button>
            </div>
        `;
        messageForm.style.display = 'block';
    } else {
        // 未登录
        authSection.innerHTML = `
            <button class="login-btn" onclick="showAuthModal('login')">登录</button>
            <button class="register-btn" onclick="showAuthModal('register')">注册</button>
        `;
        messageForm.style.display = 'none';
    }
}

// ========== 留言功能 ==========

/**
 * 加载留言列表
 */
async function loadMessages() {
    const listEl = document.getElementById('message-list');
    const countEl = document.getElementById('message-count');
    
    try {
        const response = await fetch(`${API_URL}/messages`);
        const data = await response.json();
        
        countEl.textContent = `共 ${data.messages.length} 条留言`;
        
        if (data.messages.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">💬</div>
                    <p>还没有留言，来做第一个留言的人吧！</p>
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
                        `<button class="message-delete" onclick="deleteMessage(${msg.id})">删除</button>` : 
                        ''}
                </div>
                <div class="message-content">${escapeHtml(msg.content)}</div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('加载留言错误:', error);
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="emoji">⚠️</div>
                <p>加载失败，请刷新页面重试</p>
            </div>
        `;
    }
}

/**
 * 发表留言
 */
async function submitMessage() {
    if (!currentUser || !authToken) {
        showToast('请先登录', 'error');
        showAuthModal('login');
        return;
    }
    
    const contentInput = document.getElementById('content-input');
    const content = contentInput.value.trim();
    
    if (!content) {
        showToast('请输入留言内容', 'error');
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
            showToast(data.error || '发表失败', 'error');
            return;
        }
        
        contentInput.value = '';
        loadMessages();
        showToast('发表成功！');
        
    } catch (error) {
        console.error('发表留言错误:', error);
        showToast('网络错误，请稍后重试', 'error');
    }
}

/**
 * 删除留言
 */
async function deleteMessage(id) {
    if (!confirm('确定要删除这条留言吗？')) return;
    
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || '删除失败', 'error');
            return;
        }
        
        loadMessages();
        showToast('删除成功');
        
    } catch (error) {
        console.error('删除留言错误:', error);
        showToast('网络错误，请稍后重试', 'error');
    }
}

// ========== 工具函数 ==========

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
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
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

// ========== 页面加载 ==========
document.addEventListener('DOMContentLoaded', initGuestbook);

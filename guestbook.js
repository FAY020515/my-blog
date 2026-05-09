/**
 * 留言板脚本
 * 
 * 工作原理：
 * 1. 用户填写昵称和留言内容，点击"发表留言"
 * 2. 留言数据保存到 localStorage（浏览器本地存储）
 * 3. 页面加载时从 localStorage 读取所有留言并显示
 * 4. 支持删除留言和清空表单
 * 
 * 注意：localStorage 是浏览器本地存储，数据只保存在当前浏览器中。
 *       如果换了浏览器或清除了浏览器数据，留言会丢失。
 *       这是纯前端方案的局限，真正的留言板需要后端服务器和数据库。
 */

// ========== 头像颜色池 ==========
// 每个留言者根据名字自动分配一个颜色
const avatarColors = [
    '#6c5ce7', '#0984e3', '#00b894', '#e17055',
    '#e84393', '#fdcb6e', '#00cec9', '#d63031',
    '#a29bfe', '#55efc4', '#fab1a0', '#74b9ff'
];

// ========== 工具函数 ==========

/**
 * 根据名字生成固定的头像颜色
 * 原理：把名字的每个字符编码相加，对颜色数量取余
 * 这样同一个名字每次都会得到相同的颜色
 */
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }
    return avatarColors[hash % avatarColors.length];
}

/**
 * 格式化时间
 * 把 "2024-01-15T10:30:00.000Z" 变成 "2024年1月15日 18:30"
 */
function formatTime(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 转义 HTML 特殊字符（防止 XSS 攻击）
 * 用户输入的内容可能包含 <script> 等恶意标签
 * 转义后 < 变成 &lt;，> 变成 &gt;，确保安全显示
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== 核心功能 ==========

/**
 * 获取所有留言
 * 从 localStorage 读取，key 是 'blog-messages'
 */
function getMessages() {
    const data = localStorage.getItem('blog-messages');
    // 如果没有数据，返回空数组
    return data ? JSON.parse(data) : [];
}

/**
 * 保存所有留言
 * 把留言数组转为 JSON 字符串存入 localStorage
 */
function saveMessages(messages) {
    localStorage.setItem('blog-messages', JSON.stringify(messages));
}

/**
 * 发表留言
 */
function submitMessage() {
    const nameInput = document.getElementById('name-input');
    const contentInput = document.getElementById('content-input');

    const name = nameInput.value.trim();
    const content = contentInput.value.trim();

    // 验证：昵称不能为空
    if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = '#e74c3c';
        setTimeout(() => { nameInput.style.borderColor = ''; }, 2000);
        return;
    }

    // 验证：内容不能为空
    if (!content) {
        contentInput.focus();
        contentInput.style.borderColor = '#e74c3c';
        setTimeout(() => { contentInput.style.borderColor = ''; }, 2000);
        return;
    }

    // 创建一条新留言
    const message = {
        id: Date.now(),           // 用时间戳作为唯一ID
        name: name,               // 昵称
        content: content,         // 内容
        time: new Date().toISOString()  // 时间
    };

    // 读取现有留言，把新留言添加到最前面（最新的在前面）
    const messages = getMessages();
    messages.unshift(message);

    // 保存
    saveMessages(messages);

    // 重新渲染留言列表
    renderMessages();

    // 清空表单
    clearForm();

    // 显示成功提示
    showToast('留言成功！');
}

/**
 * 删除留言
 */
function deleteMessage(id) {
    // 读取所有留言
    let messages = getMessages();

    // 过滤掉要删除的留言
    messages = messages.filter(msg => msg.id !== id);

    // 保存
    saveMessages(messages);

    // 重新渲染
    renderMessages();

    showToast('留言已删除');
}

/**
 * 清空表单
 */
function clearForm() {
    document.getElementById('name-input').value = '';
    document.getElementById('content-input').value = '';
}

/**
 * 渲染留言列表
 * 这是把数据显示到页面上的核心函数
 */
function renderMessages() {
    const listEl = document.getElementById('message-list');
    const countEl = document.getElementById('message-count');
    const messages = getMessages();

    // 更新留言数量
    countEl.textContent = `共 ${messages.length} 条留言`;

    // 如果没有留言，显示空状态
    if (messages.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="emoji">💬</div>
                <p>还没有留言，来做第一个留言的人吧！</p>
            </div>
        `;
        return;
    }

    // 把每条留言生成 HTML 卡片
    let html = '';
    messages.forEach((msg, index) => {
        const color = getAvatarColor(msg.name);
        const initial = msg.name.charAt(0).toUpperCase();  // 取名字首字母作为头像
        const time = formatTime(msg.time);
        const safeContent = escapeHtml(msg.content);      // 转义防XSS
        const safeName = escapeHtml(msg.name);

        html += `
            <article class="message-card" style="animation-delay: ${index * 0.05}s">
                <div class="message-header">
                    <div class="message-author">
                        <div class="message-avatar" style="background: ${color}">${initial}</div>
                        <div>
                            <div class="message-name">${safeName}</div>
                            <div class="message-time">${time}</div>
                        </div>
                    </div>
                    <button class="message-delete" onclick="deleteMessage(${msg.id})" title="删除留言">删除</button>
                </div>
                <div class="message-content">${safeContent}</div>
            </article>
        `;
    });

    listEl.innerHTML = html;
}

/**
 * 显示提示消息（Toast）
 */
function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.add('show');

    // 2秒后自动消失
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ========== 页面加载完成后渲染留言列表 ==========
document.addEventListener('DOMContentLoaded', renderMessages);

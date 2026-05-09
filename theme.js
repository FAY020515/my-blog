/**
 * 主题颜色 + 暗色/亮色模式切换脚本
 * 
 * 工作原理：
 * 1. 通过修改 CSS 变量来改变整个网站的主题色和明暗模式
 * 2. 使用 localStorage 保存用户选择，下次打开自动恢复
 * 3. 提供 6 种预设颜色 + 2 种明暗模式
 */

// ========== 预设颜色方案 ==========
const themes = {
    purple: { name: '优雅紫', accent: '#6c5ce7', gradient: '#a29bfe' },
    blue:   { name: '天空蓝', accent: '#0984e3', gradient: '#74b9ff' },
    green:  { name: '森林绿', accent: '#00b894', gradient: '#55efc4' },
    orange: { name: '活力橙', accent: '#e17055', gradient: '#fab1a0' },
    pink:   { name: '少女粉', accent: '#e84393', gradient: '#fd79a8' },
    dark:   { name: '暗夜黑', accent: '#2d3436', gradient: '#636e72' }
};

// ========== 明暗模式配色 ==========
// light: 亮色模式（浅色背景，深色文字）
// dark: 暗色模式（深色背景，浅色文字）
const modes = {
    light: {
        bgColor: '#fafafa',      // 页面背景
        cardBg: '#ffffff',       // 卡片背景
        textColor: '#2d3436',    // 文字颜色
        textLight: '#636e72',    // 次要文字
        borderColor: '#eee'      // 边框颜色
    },
    dark: {
        bgColor: '#1a1a2e',      // 深蓝黑色背景
        cardBg: '#16213e',       // 深蓝色卡片
        textColor: '#eaeaea',    // 浅灰文字
        textLight: '#a0a0a0',    // 次要文字
        borderColor: '#2d2d44'   // 暗色边框
    }
};

// ========== 初始化 ==========
function initTheme() {
    // 读取保存的颜色和模式，默认紫色+亮色
    const savedTheme = localStorage.getItem('blog-theme') || 'purple';
    const savedMode = localStorage.getItem('blog-mode') || 'light';
    
    // 应用颜色和模式
    applyTheme(savedTheme);
    applyMode(savedMode);
    
    // 高亮当前选中的按钮
    highlightActiveButton(savedTheme);
    updateModeButton(savedMode);
}

// ========== 应用主题颜色 ==========
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--accent-color', theme.accent);

    // 更新渐变元素
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1) {
        heroH1.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.gradient})`;
        heroH1.style.webkitBackgroundClip = 'text';
        heroH1.style.backgroundClip = 'text';
    }

    document.querySelectorAll('.article-tag').forEach(tag => {
        tag.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.gradient})`;
    });

    document.querySelectorAll('.back-link').forEach(btn => {
        btn.style.background = theme.accent;
    });

    // 更新关于页面的标题渐变
    const pageHeaderH1 = document.querySelector('.page-header h1');
    if (pageHeaderH1) {
        pageHeaderH1.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.gradient})`;
        pageHeaderH1.style.webkitBackgroundClip = 'text';
        pageHeaderH1.style.backgroundClip = 'text';
    }

    // 更新时间线
    const timelineBefore = document.querySelector('.timeline::before');
    const timelineItems = document.querySelectorAll('.timeline-item::before');

    localStorage.setItem('blog-theme', themeName);
}

// ========== 应用明暗模式 ==========
// 这是核心功能！切换整个页面的明暗
function applyMode(modeName) {
    const mode = modes[modeName];
    if (!mode) return;

    const root = document.documentElement;
    
    // 修改 CSS 变量 —— 一改全站变色！
    root.style.setProperty('--bg-color', mode.bgColor);
    root.style.setProperty('--card-bg', mode.cardBg);
    root.style.setProperty('--text-color', mode.textColor);
    root.style.setProperty('--text-light', mode.textLight);

    // 更新所有边框颜色
    document.querySelectorAll('footer').forEach(el => {
        el.style.borderTopColor = mode.borderColor;
    });

    document.querySelectorAll('.article-header').forEach(el => {
        el.style.borderBottomColor = mode.borderColor;
    });

    // 更新表格边框（暗色模式下需要调整）
    const isDark = modeName === 'dark';
    document.querySelectorAll('.article-content th').forEach(th => {
        th.style.background = isDark ? '#2d2d44' : '#f5f5f5';
    });

    document.querySelectorAll('.article-content td, .article-content th').forEach(cell => {
        cell.style.borderColor = isDark ? '#3d3d5c' : '#e0e0e0';
    });

    // 保存到 localStorage
    localStorage.setItem('blog-mode', modeName);
}

// ========== 切换明暗模式 ==========
function toggleMode() {
    const currentMode = localStorage.getItem('blog-mode') || 'light';
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    
    applyMode(newMode);
    updateModeButton(newMode);
}

// ========== 更新模式按钮显示 ==========
function updateModeButton(modeName) {
    const btn = document.querySelector('.mode-toggle-btn');
    if (btn) {
        btn.textContent = modeName === 'light' ? '🌙' : '☀️';
        btn.title = modeName === 'light' ? '切换到暗色模式' : '切换到亮色模式';
    }
}

// ========== 高亮当前选中的颜色按钮 ==========
function highlightActiveButton(themeName) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });
}

// ========== 切换主题颜色 ==========
function switchTheme(themeName) {
    applyTheme(themeName);
    highlightActiveButton(themeName);
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', initTheme);

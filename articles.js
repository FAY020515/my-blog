/**
 * 文章数据配置
 * 
 * 这个文件包含所有文章的信息，用于：
 * 1. 首页文章列表展示
 * 2. 文章搜索功能
 * 3. 文章分类筛选功能
 * 
 * 每当添加新文章时，只需在这里添加一行数据即可
 */

const articles = [
    {
        id: 2,
        title: "TRAE SOLO CN 桌面端保姆级教程",
        excerpt: "TRAE SOLO 是字芃跳动推出的 AI 原生工作台，覆盖从专业开发到日常办公的全场景 AI 协作。本教程从安装到实战，手把手带你掌握 MTC 模式和 Code 模式的核心用法。",
        tag: "工具教程",
        tagColor: "#e17055",
        date: "2026-05-09",
        dateText: "2026年5月9日",
        readTime: "15分钟",
        cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
        url: "post2.html"
    },
    {
        id: 1,
        title: "我的第一篇博客：开始学习编程",
        excerpt: "今天是我开始学习编程的第一天。虽然之前对代码一窍不通，但我相信只要坚持学习，一定能够掌握这项技能。这篇文章记录了我为什么要学习编程，以及我的学习计划。",
        tag: "学习笔记",
        tagColor: "#6c5ce7",
        date: "2024-01-15",
        dateText: "2024年1月15日",
        readTime: "3分钟",
        cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
        url: "post1.html"
    }
];

// 获取所有标签（去重）
function getAllTags() {
    const tags = [...new Set(articles.map(a => a.tag))];
    return tags;
}

// 根据标签筛选文章
function filterByTag(tag) {
    if (!tag || tag === '全部') {
        return articles;
    }
    return articles.filter(a => a.tag === tag);
}

// 搜索文章（搜索标题和摘要）
function searchArticles(keyword) {
    if (!keyword || keyword.trim() === '') {
        return articles;
    }
    const lowerKeyword = keyword.toLowerCase().trim();
    return articles.filter(a => 
        a.title.toLowerCase().includes(lowerKeyword) || 
        a.excerpt.toLowerCase().includes(lowerKeyword)
    );
}

// 渲染文章卡片 HTML
function renderArticleCard(article) {
    return `
        <article class="article-card" data-tag="${article.tag}">
            <img class="article-cover" src="${article.cover}" alt="${article.title}">
            <div class="article-card-content">
                <span class="article-tag" style="background: linear-gradient(135deg, ${article.tagColor}, ${article.tagColor}88)">${article.tag}</span>
                <h2><a href="${article.url}">${article.title}</a></h2>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-meta">${article.dateText} · 阅读${article.readTime}</div>
                <a href="${article.url}" class="read-more">阅读全文 →</a>
            </div>
        </article>
    `;
}

// 渲染文章列表
function renderArticleList(articleList) {
    const container = document.getElementById('article-list');
    if (!container) return;
    
    if (articleList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="emoji">🔍</div>
                <p>没有找到相关文章</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = articleList.map(renderArticleCard).join('');
}

// 渲染标签筛选按钮
function renderTagFilters() {
    const container = document.getElementById('tag-filters');
    if (!container) return;
    
    const tags = ['全部', ...getAllTags()];
    container.innerHTML = tags.map(tag => `
        <button class="tag-filter-btn ${tag === '全部' ? 'active' : ''}" 
                data-tag="${tag}"
                onclick="filterByTagClick('${tag}')">
            ${tag}
        </button>
    `).join('');
}

// 当前选中的标签和搜索关键词
let currentTag = '全部';
let currentKeyword = '';

// 筛选按钮点击处理
function filterByTagClick(tag) {
    currentTag = tag;
    
    // 更新按钮状态
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    
    // 更新显示
    updateArticleDisplay();
}

// 搜索输入处理
function handleSearchInput(keyword) {
    currentKeyword = keyword;
    updateArticleDisplay();
}

// 更新文章显示（根据筛选和搜索条件）
function updateArticleDisplay() {
    let result = articles;
    
    // 先筛选标签
    if (currentTag !== '全部') {
        result = filterByTag(currentTag);
    }
    
    // 再搜索
    if (currentKeyword.trim()) {
        const lowerKeyword = currentKeyword.toLowerCase().trim();
        result = result.filter(a => 
            a.title.toLowerCase().includes(lowerKeyword) || 
            a.excerpt.toLowerCase().includes(lowerKeyword)
        );
    }
    
    // 渲染结果
    renderArticleList(result);
    
    // 更新结果数量
    const countEl = document.getElementById('article-count');
    if (countEl) {
        countEl.textContent = result.length;
    }
}

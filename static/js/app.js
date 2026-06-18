// State Management
let state = {
    releases: [],
    selectedUpdate: null,
    currentFilter: 'all',
    searchQuery: ''
};

// DOM Elements
const elements = {
    refreshButton: document.getElementById('refresh-button'),
    refreshIcon: document.getElementById('refresh-icon'),
    searchInput: document.getElementById('search-input'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    releasesContainer: document.getElementById('releases-container'),
    
    // States
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    emptyState: document.getElementById('empty-state'),
    retryButton: document.getElementById('retry-button'),
    
    // Composer
    composerEmpty: document.getElementById('composer-empty'),
    composerActive: document.getElementById('composer-active'),
    tweetTextarea: document.getElementById('tweet-textarea'),
    tweetAttachedLink: document.getElementById('tweet-attached-link'),
    charCount: document.getElementById('char-count'),
    btnSendTweet: document.getElementById('btn-send-tweet'),
    progressRing: document.querySelector('.progress-ring__circle'),
    
    // Toast
    toast: document.getElementById('toast-notification'),
    toastMessage: document.getElementById('toast-message'),
    toastIcon: document.getElementById('toast-icon')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initProgressRing();
    fetchReleases();
    setupEventListeners();
});

// Progress Ring Math
let circumference;
function initProgressRing() {
    const radius = elements.progressRing.r.baseVal.value;
    circumference = radius * 2 * Math.PI;
    elements.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    elements.progressRing.style.strokeDashoffset = circumference;
}

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    elements.progressRing.style.strokeDashoffset = offset;
    
    // Dynamic coloring based on usage
    if (percent >= 100) {
        elements.progressRing.style.stroke = '#ef4444'; // Red
        elements.charCount.style.color = '#ef4444';
    } else if (percent >= 90) {
        elements.progressRing.style.stroke = '#f97316'; // Orange
        elements.charCount.style.color = '#f97316';
    } else {
        elements.progressRing.style.stroke = '#3b82f6'; // Blue
        elements.charCount.style.color = '#8899a6';
    }
}

// Fetch Release Notes
async function fetchReleases(isRefresh = false) {
    showState('loading');
    if (isRefresh) {
        elements.refreshButton.classList.add('refreshing');
    }
    
    try {
        const url = isRefresh ? '/api/refresh' : '/api/releases';
        const method = isRefresh ? 'POST' : 'GET';
        
        const response = await fetch(url, { method });
        const data = await response.json();
        
        if (data.status === 'success') {
            state.releases = data.releases;
            renderReleases();
            
            if (isRefresh) {
                showToast('Release notes updated successfully!', 'success');
            }
        } else {
            throw new Error(data.message || 'Unknown backend error');
        }
    } catch (error) {
        console.error('Error fetching release notes:', error);
        elements.errorMessage.textContent = error.message || 'Could not connect to the local server.';
        showState('error');
    } finally {
        elements.refreshButton.classList.remove('refreshing');
    }
}

// Display appropriate loading/error/content states
function showState(type) {
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.releasesContainer.classList.add('hidden');
    
    if (type === 'loading') {
        elements.loadingState.classList.remove('hidden');
    } else if (type === 'error') {
        elements.errorState.classList.remove('hidden');
    } else if (type === 'empty') {
        elements.emptyState.classList.remove('hidden');
        elements.releasesContainer.classList.remove('hidden');
    } else if (type === 'content') {
        elements.releasesContainer.classList.remove('hidden');
    }
}

// Render release entries dynamically
function renderReleases() {
    elements.releasesContainer.innerHTML = '';
    
    let renderedCount = 0;
    
    state.releases.forEach((day, dayIndex) => {
        // Filter individual updates within this day
        const filteredUpdates = day.updates.filter(update => {
            const matchesType = state.currentFilter === 'all' || 
                                update.type.toLowerCase() === state.currentFilter.toLowerCase();
            
            const searchLower = state.searchQuery.toLowerCase();
            const matchesSearch = !state.searchQuery || 
                                  update.plain_text.toLowerCase().includes(searchLower) ||
                                  update.type.toLowerCase().includes(searchLower) ||
                                  day.date.toLowerCase().includes(searchLower);
            
            return matchesType && matchesSearch;
        });
        
        if (filteredUpdates.length > 0) {
            renderedCount += filteredUpdates.length;
            
            // Create Date Group Element
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = `
                <div class="date-badge"></div>
                <h3 class="date-title">${day.date}</h3>
                ${day.link ? `<a href="${day.link}" target="_blank" class="date-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> docs</a>` : ''}
            `;
            dateGroup.appendChild(dateHeader);
            
            const cardList = document.createElement('div');
            cardList.className = 'release-card-list';
            
            filteredUpdates.forEach((update, idx) => {
                const originalIdx = day.updates.indexOf(update);
                
                const card = document.createElement('div');
                card.className = 'update-card';
                card.setAttribute('data-type', update.type);
                
                // If this card is currently selected, add active style
                if (state.selectedUpdate && 
                    state.selectedUpdate.dayIndex === dayIndex && 
                    state.selectedUpdate.originalIdx === originalIdx) {
                    card.classList.add('selected');
                }
                
                card.innerHTML = `
                    <div class="update-header">
                        <span class="type-badge" data-type="${update.type}">
                            ${getBadgeIcon(update.type)} ${update.type}
                        </span>
                        <span class="select-indicator">
                            <i class="fa-solid fa-feather-pointed"></i> Select to Tweet
                        </span>
                    </div>
                    <div class="update-body">
                        ${update.html}
                    </div>
                `;
                
                // Click to select update card
                card.addEventListener('click', () => {
                    selectCard(dayIndex, originalIdx, day, update, card);
                });
                
                cardList.appendChild(card);
            });
            
            dateGroup.appendChild(cardList);
            elements.releasesContainer.appendChild(dateGroup);
        }
    });
    
    if (renderedCount === 0) {
        showState('empty');
    } else {
        showState('content');
    }
}

// Get Icon for Badge Type
function getBadgeIcon(type) {
    switch(type) {
        case 'Feature': return '<i class="fa-solid fa-wand-magic-sparkles"></i>';
        case 'Announcement': return '<i class="fa-solid fa-bullhorn"></i>';
        case 'Issue': return '<i class="fa-solid fa-triangle-exclamation"></i>';
        case 'Deprecation': return '<i class="fa-solid fa-ban"></i>';
        default: return '<i class="fa-solid fa-circle-info"></i>';
    }
}

// Select Card and load into Tweet Station
function selectCard(dayIndex, originalIdx, dayData, updateData, cardElement) {
    // Remove selected state from other cards
    document.querySelectorAll('.update-card').forEach(c => c.classList.remove('selected'));
    
    // Add selected state to this card
    cardElement.classList.add('selected');
    
    // Save selected state
    state.selectedUpdate = {
        dayIndex,
        originalIdx,
        dayData,
        updateData
    };
    
    // Toggle composer view
    elements.composerEmpty.classList.add('hidden');
    elements.composerActive.classList.remove('hidden');
    
    // Format default Tweet
    const maxTextLen = 220; // Save some space for hashtags and links
    let updateText = updateData.plain_text;
    
    // Clean double spaces or excess breaks
    updateText = updateText.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long
    if (updateText.length > maxTextLen) {
        updateText = updateText.substring(0, maxTextLen - 3) + '...';
    }
    
    const tweetTemplate = `📢 BigQuery Release Note [${updateData.type}] (${dayData.date}):\n\n"${updateText}"\n\n#BigQuery #GoogleCloud`;
    
    elements.tweetTextarea.value = tweetTemplate;
    elements.tweetAttachedLink.textContent = dayData.link || 'https://docs.cloud.google.com/bigquery/docs/release-notes';
    
    updateCharCount();
    showToast('Release loaded into Tweet Station!', 'info');
}

// Character Limit Math
function updateCharCount() {
    const tweetText = elements.tweetTextarea.value;
    const linkText = elements.tweetAttachedLink.textContent;
    
    // Twitter links are automatically shortened to 23 characters by t.co
    const tweetLen = tweetText.length + 24; // 23 chars for URL + 1 space
    const remaining = 280 - tweetLen;
    
    elements.charCount.textContent = remaining;
    
    // Calculate percentage
    const percent = Math.min((tweetLen / 280) * 100, 100);
    setProgress(percent);
    
    if (remaining < 0) {
        elements.btnSendTweet.disabled = true;
        elements.btnSendTweet.style.opacity = '0.5';
    } else {
        elements.btnSendTweet.disabled = false;
        elements.btnSendTweet.style.opacity = '1';
    }
}

// Trigger Twitter Web Intent
function sendTweet() {
    const text = elements.tweetTextarea.value;
    const url = elements.tweetAttachedLink.textContent;
    const fullTweet = `${text} ${url}`;
    
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer');
}

// Event Listeners
function setupEventListeners() {
    // Refresh click
    elements.refreshButton.addEventListener('click', () => {
        fetchReleases(true);
    });
    
    // Retry click
    elements.retryButton.addEventListener('click', () => {
        fetchReleases(true);
    });
    
    // Search input
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchQuery = e.target.value;
            renderReleases();
        }, 250); // Debounce
    });
    
    // Filter selection click
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            const button = e.currentTarget;
            button.classList.add('active');
            
            state.currentFilter = button.getAttribute('data-filter');
            renderReleases();
        });
    });
    
    // Composer text entry listener
    elements.tweetTextarea.addEventListener('input', updateCharCount);
    
    // Post click
    elements.btnSendTweet.addEventListener('click', sendTweet);
}

// Toast System
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast show';
    
    if (type === 'success') {
        elements.toastIcon.className = 'fa-solid fa-circle-check text-green';
    } else if (type === 'info') {
        elements.toastIcon.className = 'fa-solid fa-circle-info text-blue';
    } else if (type === 'error') {
        elements.toastIcon.className = 'fa-solid fa-circle-exclamation text-red';
    }
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

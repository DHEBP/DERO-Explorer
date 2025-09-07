// TELA Explorer - Router Utilities (< 18KB)
// Navigation helpers and global functions

// Update active navigation button
function updateActiveNav(page) {
    var buttons = document.querySelectorAll('.nav-btn');
    
    // Remove active classes from all buttons and reset styles
    buttons.forEach(function(button) {
        button.classList.remove('active');
        button.style.removeProperty('background');
        button.style.removeProperty('color');
        button.style.removeProperty('border-color');
    });
    
    // Handle home page special case - no button to highlight since logo handles this
    if (page === 'loadHome' || page === 'home') {
        return;
    }
    
    // Create a mapping of page names to data-page attributes
    const pageMapping = {
        'blocks': 'blocks',
        'loadBlocksIncremental': 'blocks',
        'transactions': 'transactions',
        'pool': 'pool',
        'smartcontracts': 'contracts',
        'network': 'network'
    };
    
    const dataPage = pageMapping[page];
    if (!dataPage) return;
    
    // Find and activate the correct button
    var activeButton = document.querySelector(`.nav-btn[data-page="${dataPage}"]`);
    
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.style.setProperty('background', 'rgba(185,89,182,0.15)', 'important');
        activeButton.style.setProperty('color', 'white', 'important');
        activeButton.style.setProperty('border-color', '#b959b6', 'important');
        window.currentActivePage = page;
    }
}

// Navigate to specific block
function navigateToBlock(height) {
    window.location.hash = 'block/' + height;
}

// Common loading and error templates
function getLoadingHtml(message) {
    return '<div class="loading-progress">' + (message || 'Loading...') + '<div class="progress-bar"></div></div>';
}

function getErrorHtml(title, message) {
    return '<div class="enhanced-card"><h3>' + (title || 'Error') + '</h3>' + 
           (message ? '<p>' + message + '</p>' : '') + '</div>';
}

function getConnectionErrorHtml() {
    return '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
}

// Navigation state helpers
function setRouteAndUpdateNav(route, param) {
    if (window.setCurrentRoute) window.setCurrentRoute(route);
    window.location.hash = route + (param ? '/' + param : '');
    updateActiveNav(route);
}

// Immediate active state setter for instant visual feedback
function setActiveNavImmediate(clickedButton, page) {
    var buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(function(button) {
        button.classList.remove('active');
        button.style.removeProperty('background');
        button.style.removeProperty('color');
        button.style.removeProperty('border-color');
    });
    
    const pageMapping = {
        'blocks': 'blocks',
        'loadBlocksIncremental': 'blocks',
        'transactions': 'transactions',
        'pool': 'pool',
        'smartcontracts': 'contracts',
        'network': 'network'
    };
    
    const dataPage = pageMapping[page];
    if (!dataPage) return;
    
    var targetButton = clickedButton || document.querySelector(`.nav-btn[data-page="${dataPage}"]`);
    
    if (targetButton) {
        targetButton.classList.add('active');
        targetButton.style.setProperty('background', 'rgba(185,89,182,0.15)', 'important');
        targetButton.style.setProperty('color', 'white', 'important');
        targetButton.style.setProperty('border-color', '#b959b6', 'important');
        window.currentActivePage = page;
    }
}

// Export functions directly to global scope
window.updateActiveNav = updateActiveNav;
window.navigateToBlock = navigateToBlock;
window.setActiveNavImmediate = setActiveNavImmediate;
window.navigateToPage = navigateToPage;

// Active state functionality integrated into router

// Export router utilities
window.routerUtils = {
    updateActiveNav: updateActiveNav,
    navigateToBlock: navigateToBlock,
    getLoadingHtml: getLoadingHtml,
    getErrorHtml: getErrorHtml,
    getConnectionErrorHtml: getConnectionErrorHtml,
    setRouteAndUpdateNav: setRouteAndUpdateNav,
    setActiveNavImmediate: setActiveNavImmediate,
    restoreActiveState: restoreActiveState
};

// Export restore function globally
window.restoreActiveState = restoreActiveState;

// Global router functions (keep for compatibility)
window.handleRoute = function() {
    if (window.router) window.router.hr();
};

window.loadBlocks = function() {
    if (window.router) window.router.lbs();
};

window.loadTransactions = function() {
    if (window.router) window.router.lts();
};

window.loadNetwork = function() {
    if (window.router) window.router.ln();
};



window.navigateToBlock = function(height) {
    if (window.router) window.router.navigateToBlock(height);
};

window.loadBlocksIncremental = function() {
    if (window.router) window.router.loadBlocksIncremental();
};

// Function to restore active state after page loads
function restoreActiveState() {
    const hash = window.location.hash.slice(1);
    const route = hash.split('/')[0] || 'home';
    
    if (route && route !== 'home' && route !== '' && window.currentActivePage !== route) {
        updateActiveNav(route);
    }
}

// Removed conflicting definition - using direct export above

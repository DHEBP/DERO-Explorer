// TELA Explorer - Main Module Coordinator (< 18KB)
// This file coordinates between split explorer modules

// Import and setup explorer modules using main.js module loader
async function initializeExplorerModules() {
    // Use the global module loader from main.js
    const lm = window.lm || loadModule;
    const [blocks, transactions, render] = await Promise.all([
        lm('explorer-blocks'),
        lm('explorer-transactions'), 
        lm('explorer-render')
    ]);
    
    // Store modules globally for cross-module access
    window.explorerModules = { blocks, transactions, render };
    
    return { blocks, transactions, render };
}

// Block functions - delegate to explorer-blocks module
async function loadBlocks(xswdCall) {
    const modules = await initializeExplorerModules();
    if (modules.blocks?.loadBlocks) {
        return modules.blocks.loadBlocks(xswdCall);
    }

}

async function loadBlock(height) {
    const modules = await initializeExplorerModules();
    if (modules.blocks?.loadBlock) {
        return modules.blocks.loadBlock(height);
    }

}

// Transaction functions - delegate to explorer-transactions module  
async function loadTransactions() {
    const modules = await initializeExplorerModules();
    if (modules.transactions?.loadTransactions) {
        return modules.transactions.loadTransactions();
    }

}

async function loadTransaction(txid) {
    const modules = await initializeExplorerModules();
    if (modules.transactions?.loadTransaction) {
        return modules.transactions.loadTransaction(txid);
    }

}



// Utility functions - delegate to render module
async function getPoolData() {
    const modules = await initializeExplorerModules();
    if (modules.transactions?.getPoolData) {
        return modules.transactions.getPoolData();
    }

}

async function getRecentBlocks(count = 5) {
    const modules = await initializeExplorerModules();
    if (modules.transactions?.getRecentBlocks) {
        return modules.transactions.getRecentBlocks(count);
    }

}

function renderTransactionExplorer(poolData, networkInfo, recentBlocks) {
    const modules = window.explorerModules;
    if (modules?.render?.renderTransactionExplorer) {
        return modules.render.renderTransactionExplorer(poolData, networkInfo, recentBlocks);
    }
    return '<div class="enhanced-card"><h3>Render module not loaded</h3></div>';
}

function renderAuthenticTxPool(poolData) {
    // Legacy function - redirect to enhanced transaction explorer
    const networkInfo = window.lastNetworkInfo || {};
    return renderTransactionExplorer(poolData, networkInfo, []);
}

// Export functions to global scope for backwards compatibility
window.loadBlocks = loadBlocks;
window.loadBlock = loadBlock;
window.loadTransactions = loadTransactions;
window.loadTransaction = loadTransaction;

window.getPoolData = getPoolData;
window.getRecentBlocks = getRecentBlocks;
window.renderTransactionExplorer = renderTransactionExplorer;
window.renderAuthenticTxPool = renderAuthenticTxPool;

// Pagination is handled by explorer-blocks.js
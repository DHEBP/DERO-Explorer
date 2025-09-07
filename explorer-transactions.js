// TELA Explorer - Transaction Functions Module (< 18KB)

async function loadTransactions() {
    currentRoute = 'transactions';
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="loading-progress">Loading transaction explorer...<div class="progress-bar"></div></div>';

    if (!xswdCore?.isConnected) {
        c.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
        return;
    }

    try {

        
        // Get comprehensive transaction data
        const [poolData, networkInfo, recentBlocks] = await Promise.all([
            getPoolData(),
            xswdCore.call('DERO.GetInfo'),
            getRecentBlocks(5) // Get last 5 blocks for recent transactions
        ]);
        


        
        // Load render module and render
        const renderModule = await lm('explorer-render');
        if (!renderModule) throw new Error('Failed to load render module');
        
        c.innerHTML = renderModule.renderTransactionExplorer(poolData, networkInfo, recentBlocks);
        
    } catch (error) {
        console.error('Transaction explorer loading failed:', error);
        c.innerHTML = `<div class="enhanced-card">
            <h3>Transaction Explorer Loading Failed</h3>
            <p style="color:#888;margin-top:1rem">${error.message}</p>
            <button onclick="loadTransactions()" style="margin-top:1rem;padding:0.5rem 1rem;background:#52c8db;color:#000;border:none;border-radius:4px;cursor:pointer;">Retry</button>
        </div>`;
    }
}

async function loadTransaction(txid) {
    currentRoute = 'tx';
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="loading-progress">Loading transaction details...<div class="progress-bar"></div></div>';

    if (!xswdCore?.isConnected) {
        c.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
        return;
    }

    try {
        const core = await lm('transactions');
        if (!core) throw new Error('Failed to load enhanced transactions module');

        const result = await core.renderTransaction(txid, xswdCore.call.bind(xswdCore));
        c.innerHTML = result;
    } catch (error) {
        console.error('Transaction details failed:', error);
        c.innerHTML = `<div class="enhanced-card"><h3>Error Loading Transaction</h3><p>${error.message}</p></div>`;
    }
}



async function getPoolData() {
    try {
        const enhancedPool = await window.xswd?.getTxPoolWithStats?.();
        return enhancedPool;
    } catch(e) {
        const rawPool = await xswdCore.call('DERO.GetTxPool');
        if (rawPool?.txs) {
            const processedPool = {
                txs: rawPool.txs,
                stats: {
                    total_count: rawPool.txs.length,
                    total_size: rawPool.txs.reduce((acc,tx) => acc + (tx.size||0), 0),
                    avg_fee: rawPool.txs.length > 0 ? rawPool.txs.reduce((acc,tx) => acc + (tx.fee||0), 0) / rawPool.txs.length : 0
                }
            };
            return processedPool;
        }
        return null;
    }
}

async function getRecentBlocks(count = 5) {
    try {
        const info = await xswdCore.call('DERO.GetInfo');
        const currentHeight = info.height;
        const blocks = [];
        
        for (let i = 0; i < count; i++) {
            const height = currentHeight - i;
            if (height > 0) {
                try {
                    const block = await xswdCore.call('DERO.GetBlock', { height: height });
                    if (block) {
                        // Parse the JSON field to get the actual block structure
                        let parsedBlock = block;
                        if (block.json) {
                            try {
                                const blockData = JSON.parse(block.json);
                                parsedBlock = { ...block, ...blockData, height: height };
                            } catch (e) {
                                console.warn(`Failed to parse JSON for block ${height}:`, e);
                                parsedBlock = { ...block, height: height };
                            }
                        }
                        blocks.push(parsedBlock);
                    }
                } catch (e) {
                    console.warn(`Failed to get block ${height}:`, e);
                }
            }
        }
        
        return blocks;
    } catch (error) {
        console.error('Failed to get recent blocks:', error);
        return [];
    }
}

// Export for module loading
window.explorerTransactions = { 
    loadTransactions, 
    loadTransaction, 

    getPoolData, 
    getRecentBlocks 
};
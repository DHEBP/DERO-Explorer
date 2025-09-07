// TELA Explorer - Rendering Functions Module (< 18KB)

// Utility function to format transaction hashes
function formatTxHash(hash) {
    if (!hash || hash.length < 16) return 'Unknown';
    if (hash === 'unknown') return 'Pending...';
    return hash.length > 16 ? hash.substring(0, 8) + '...' + hash.slice(-8) : hash;
}

// Utility function to detect coinbase transactions
async function detectCoinbaseTransaction(txHash, xswdCall) {
    try {
        const txResponse = await xswdCall('DERO.GetTransaction', { txs_hashes: [txHash], decode_as_json: 1 });
        if (txResponse && txResponse.txs && txResponse.txs.length > 0) {
            const tx = txResponse.txs[0];
            const txData = tx.as_json ? JSON.parse(tx.as_json) : {};
            // A coinbase transaction has no inputs (vin is empty or doesn't exist)
            return !txData.vin || txData.vin.length === 0;
        }
    } catch (error) {
        console.warn('Could not fetch transaction for coinbase detection:', txHash);
    }
    return false; // Default to not coinbase if we can't determine
}

// Utility function to create responsive hash display
function formatTxHashResponsive(hash, linkHref) {
    if (!hash || hash.length < 16) return 'Unknown';
    if (hash === 'unknown') return 'Pending...';
    
    const fullHash = hash;
    const truncatedHash = hash.length > 16 ? hash.substring(0, 8) + '...' + hash.slice(-8) : hash;
    
    const linkStart = linkHref ? `<a href="${linkHref}" style="color:#52c8db;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">` : '';
    const linkEnd = linkHref ? '</a>' : '';
    
    return `<span class="hash-container hash-responsive">
        <span class="hash-full">${linkStart}${fullHash}${linkEnd}</span>
        <span class="hash-truncated">${linkStart}${truncatedHash}${linkEnd}</span>
    </span>`;
}

function renderTransactionExplorer(poolData, networkInfo, recentBlocks) {
    const currentHeight = networkInfo?.height || 0;
    const targetTime = networkInfo?.target || 18;
    const totalPoolSize = networkInfo?.tx_pool_size || 0;
    
    // Extract all transactions from recent blocks
    const recentTransactions = extractTransactionsFromBlocks(recentBlocks);
    const txStats = calculateTransactionStats(recentTransactions, networkInfo);
    
    return `
    <div class="enhanced-card">
        <div class="card-header">
            <h2 style="color:#fff;margin:0;font-size:1.6rem;font-weight:700;">DERO Transaction Explorer</h2>
            <div class="actions">
                <button onclick="loadTransactions()" style="background:rgba(82,200,219,0.1);border:1px solid #52c8db;color:#52c8db;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;transition:all 0.2s ease;font-weight:500;">Refresh</button>
            </div>
        </div>
        <div class="card-content">
        
            ${renderTransactionPoolStatus(poolData, totalPoolSize)}
            ${renderTransactionStatistics(txStats, networkInfo)}
            ${renderRecentTransactions(recentTransactions)}
            ${renderNetworkActivity(networkInfo, recentBlocks)}
        </div>
    </div>`;
}

function extractTransactionsFromBlocks(blocks) {
    const transactions = [];
    
    blocks.forEach((block, blockIndex) => {
        // Check multiple possible transaction hash fields
        const possibleTxFields = ['tx_hashes', 'txs_hashes', 'transactions', 'tx_hash_list'];
        let foundTxHashes = null;
        
        for (const field of possibleTxFields) {
            if (block[field] && Array.isArray(block[field]) && block[field].length > 0) {
                foundTxHashes = block[field];
                break;
            }
        }
        
        if (foundTxHashes && foundTxHashes.length > 0) {
            foundTxHashes.forEach((txHash, index) => {
                // Improved coinbase detection logic
                let isCoinbase = false;
                
                if (foundTxHashes.length === 1) {
                    isCoinbase = true; // Single tx in block = coinbase
                } else if (index === 0) {
                    isCoinbase = true; // First of multiple = probably coinbase
                } else {
                    isCoinbase = false; // Others = likely transfers
                }
                
                const transaction = {
                    hash: txHash,
                    blockHeight: block.height,
                    blockHash: block.block_header?.hash || block.hash || 'Unknown',
                    timestamp: block.timestamp || block.block_header?.timestamp || Date.now()/1000,
                    blockIndex: index,
                    isCoinbase: isCoinbase,
                    blockReward: block.block_header?.reward || 0,
                    totalTxInBlock: foundTxHashes.length
                };
                transactions.push(transaction);
            });
        }
    });
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

function calculateTransactionStats(transactions, networkInfo) {
    const now = Date.now() / 1000;
    const last24h = transactions.filter(tx => (now - tx.timestamp) < 86400);
    const last1h = transactions.filter(tx => (now - tx.timestamp) < 3600);
    
    return {
        total: transactions.length,
        last24h: last24h.length,
        last1h: last1h.length,
        coinbaseCount: transactions.filter(tx => tx.isCoinbase).length,
        regularCount: transactions.filter(tx => !tx.isCoinbase).length,
        avgPerBlock: transactions.length > 0 ? (transactions.length / new Set(transactions.map(tx => tx.blockHeight)).size) : 0,
        networkTps: networkInfo?.target ? (last1h.length / 3600) : 0,
        totalBlocks: new Set(transactions.map(tx => tx.blockHeight)).size
    };
}

function renderTransactionPoolStatus(poolData, totalPoolSize) {
    const hasPool = poolData && poolData.txs && poolData.txs.length > 0;
    
    if (hasPool) {
        const validTxs = poolData.txs.filter(tx => {
            const hash = tx.txid || tx.hash || tx.id_hash || tx.tx_hash || tx.txhash;
            return hash && hash.length >= 32 && /^[a-f0-9]+$/i.test(hash);
        });
        
        return `
        <div style="margin-bottom:2rem;">
            <h3 style="color:#52c8db;margin-bottom:1.5rem;font-size:1.2rem;font-weight:600;">Transaction Pool Status</h3>
            <div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);border-radius:8px;padding:1.5rem;border-left:4px solid #ffc107;">
                <div style="color:#ffc107;font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;">${validTxs.length} Pending Transactions</div>
                <div style="color:#b3b3b3;font-size:0.9rem;">Transactions waiting for confirmation</div>
            </div>
        </div>`;
    } else {
        return `
        <div style="margin-bottom:2rem;">
            <h3 style="color:#52c8db;margin-bottom:1.5rem;font-size:1.2rem;font-weight:600;">Transaction Pool Status</h3>
            <div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:8px;padding:1.5rem;text-align:center;border-left:4px solid #4ade80;">
                <div style="color:#4ade80;font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;">✅ Pool Empty</div>
                <div style="color:#b3b3b3;font-size:0.9rem;">All transactions processed instantly - excellent network performance!</div>
            </div>
        </div>`;
    }
}

function renderTransactionStatistics(stats, networkInfo) {
    return `
    <div style="margin-bottom:2rem;">
        <h3 style="color:#52c8db;margin-bottom:1.5rem;font-size:1.2rem;font-weight:600;">Transaction Analytics</h3>
        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;">
            <div class="stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);padding:1.5rem;border-radius:8px;text-align:center;transition:all 0.2s ease;">
                <div style="color:#52c8db;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem;">${stats.total}</div>
                <div style="color:#b3b3b3;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.5px;">Recent Transactions</div>
                <div style="color:#4ade80;font-size:0.8rem;margin-top:0.5rem;">Last ${stats.totalBlocks} blocks</div>
            </div>
            <div class="stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(251,191,36,0.3);padding:1.5rem;border-radius:8px;text-align:center;transition:all 0.2s ease;">
                <div style="color:#fbbf24;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem;">${stats.last1h}</div>
                <div style="color:#b3b3b3;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.5px;">Last Hour</div>
                <div style="color:#fbbf24;font-size:0.8rem;margin-top:0.5rem;">${stats.networkTps.toFixed(2)} TPS</div>
            </div>
            <div class="stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(239,68,68,0.3);padding:1.5rem;border-radius:8px;text-align:center;transition:all 0.2s ease;">
                <div style="color:#ef4444;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem;">${stats.avgPerBlock.toFixed(1)}</div>
                <div style="color:#b3b3b3;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.5px;">Avg per Block</div>
                <div style="color:#ef4444;font-size:0.8rem;margin-top:0.5rem;">Including coinbase</div>
            </div>
            <div class="stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(139,92,246,0.3);padding:1.5rem;border-radius:8px;text-align:center;transition:all 0.2s ease;">
                <div style="color:#b959b6;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem;">${networkInfo?.height?.toLocaleString() || 'N/A'}</div>
                <div style="color:#b3b3b3;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.5px;">Current Height</div>
                <div style="color:#b959b6;font-size:0.8rem;margin-top:0.5rem;">Live network</div>
            </div>
        </div>
    </div>`;
}

function renderRecentTransactions(transactions) {
    if (transactions.length === 0) {
        return `
        <div style="margin-bottom:2rem;">
            <h3 style="color:#52c8db;margin-bottom:1rem;font-size:1.2rem;">Recent Transactions</h3>
            <div style="text-align:center;color:#888;padding:20px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
                No recent transactions found in analyzed blocks
            </div>
        </div>`;
    }
    
    const displayTxs = transactions.slice(0, 15); // Show 15 most recent
    
    const txRows = displayTxs.map(tx => {
        const timeAgo = getTimeAgo(tx.timestamp);
        const responsiveHash = tx.hash ? formatTxHashResponsive(tx.hash, `#tx/${tx.hash}`) : 'Unknown';
        const txType = tx.isCoinbase ? 'Coinbase' : 'Transfer';
        const txTypeColor = tx.isCoinbase ? '#fbbf24' : '#4ade80';
        
        return `
        <div style="display:grid;grid-template-columns:1fr 100px 120px 100px;gap:1rem;padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.05);align-items:center;font-size:0.85rem;transition:background 0.2s ease;" 
             onmouseover="this.style.background='rgba(255,255,255,0.02)'" 
             onmouseout="this.style.background='transparent'">
            <div style="color:#52c8db;overflow:hidden;">
                ${responsiveHash}
                <div style="color:#888;font-size:0.75rem;margin-top:0.2rem;">Block ${tx.blockHeight}</div>
            </div>
            <div style="color:${txTypeColor};text-align:center;font-weight:500;">${txType}</div>
            <div style="color:#888;text-align:center;">${timeAgo}</div>
            <div style="color:#4ade80;text-align:right;font-size:0.8rem;">Confirmed</div>
        </div>`;
    }).join('');
    
    return `
    <div style="margin-bottom:2rem;">
        <h3 style="color:#52c8db;margin-bottom:1.5rem;font-size:1.2rem;font-weight:600;">Recent Transactions</h3>
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);border-radius:8px;overflow:hidden;">
            <div style="display:grid;grid-template-columns:1fr 100px 120px 100px;gap:1rem;padding:1rem;border-bottom:2px solid rgba(82,200,219,0.3);font-weight:600;font-size:0.9rem;color:#52c8db;background:rgba(82,200,219,0.1);">
                <div>Transaction Hash</div>
                <div style="text-align:center;">Type</div>
                <div style="text-align:center;">Time</div>
                <div style="text-align:right;">Status</div>
            </div>
            ${txRows}
        </div>
        ${transactions.length > 15 ? `<div style="text-align:center;margin-top:1rem;color:#b3b3b3;font-size:0.9rem;">Showing 15 of ${transactions.length} recent transactions</div>` : ''}
    </div>`;
}

function renderNetworkActivity(networkInfo, recentBlocks) {
    const avgBlockTime = networkInfo?.averageblocktime50 || 18;
    const targetTime = networkInfo?.target || 18;
    const efficiency = targetTime > 0 ? Math.min(100, (targetTime / avgBlockTime) * 100) : 100;
    
    return `
    <div>
        <h3 style="color:#52c8db;margin-bottom:1.5rem;font-size:1.2rem;font-weight:600;">Network Activity</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
            <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);padding:1.5rem;border-radius:8px;transition:all 0.2s ease;">
                <div style="color:#52c8db;font-weight:600;margin-bottom:1rem;font-size:1.1rem;">Block Performance</div>
                <div style="margin-bottom:0.75rem;">
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Average Block Time</div>
                    <div style="color:#fff;font-size:1.2rem;font-weight:600;">${avgBlockTime.toFixed(1)}s</div>
                </div>
                <div style="margin-bottom:0.75rem;">
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Target Time</div>
                    <div style="color:#4ade80;font-size:1.2rem;font-weight:600;">${targetTime}s</div>
                </div>
                <div>
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Efficiency</div>
                    <div style="color:${efficiency > 90 ? '#4ade80' : efficiency > 70 ? '#fbbf24' : '#ef4444'};font-size:1.2rem;font-weight:600;">${efficiency.toFixed(1)}%</div>
                </div>
            </div>
            
            <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);padding:1.5rem;border-radius:8px;transition:all 0.2s ease;">
                <div style="color:#52c8db;font-weight:600;margin-bottom:1rem;font-size:1.1rem;">Network Stats</div>
                <div style="margin-bottom:0.75rem;">
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Total Supply</div>
                    <div style="color:#fff;font-size:1.2rem;font-weight:600;">${(networkInfo?.total_supply || 0).toLocaleString()} DERO</div>
                </div>
                <div style="margin-bottom:0.75rem;">
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Difficulty</div>
                    <div style="color:#fbbf24;font-size:1.2rem;font-weight:600;">${(networkInfo?.difficulty || 0).toLocaleString()}</div>
                </div>
                <div>
                    <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:0.25rem;">Connected Peers</div>
                    <div style="color:#b959b6;font-size:1.2rem;font-weight:600;">${(networkInfo?.outgoing_connections_count || 0)}</div>
                </div>
            </div>
        </div>
    </div>`;
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    
    // Handle both seconds and milliseconds timestamps
    let tsMs = timestamp;
    if (timestamp < 1e12) {
        // Timestamp is in seconds, convert to milliseconds
        tsMs = timestamp * 1000;
    }
    
    const diff = Math.floor((now - tsMs) / 1000); // Difference in seconds
    
    // Ensure positive difference
    if (diff < 0) return 'now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Export for module loading
window.explorerRender = { 
    formatTxHash,
    formatTxHashResponsive,
    renderTransactionExplorer,
    extractTransactionsFromBlocks,
    calculateTransactionStats,
    renderTransactionPoolStatus,
    renderTransactionStatistics,
    renderRecentTransactions,
    renderNetworkActivity,
    getTimeAgo,
    detectCoinbaseTransaction
};
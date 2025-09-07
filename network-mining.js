async function loadNetwork() {
    currentRoute = 'network';
    window.location.hash = 'network';
    
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="loading-progress">Loading network...<div class="progress-bar"></div></div>';

    try {
        const network = await lm('network-ui');
        if (network && xswdCore) {
            const info = await window.getCachedData('networkInfo', () => xswdCore.call('DERO.GetInfo', {}));
            
            if (info && Object.keys(info).length > 5) {
                const rpcWrapper = (method, params) => {
                    if (method === 'DERO.GetInfo') {
                        return Promise.resolve(info);
                    } else {
                        return xswdCore.call(method, params);
                    }
                };
                
                try {
                    c.innerHTML = await network.renderNetworkDashboard(rpcWrapper);
                } catch (dashboardError) {
                    c.innerHTML = `<div class="enhanced-card"><h3>⚠️ Network Dashboard Loading Failed</h3><p>Unable to load complete network dashboard. This is expected when running outside TELA environment.</p><div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:1rem;margin:1rem 0"><h4 style="color:#fbbf24;margin:0 0 0.5rem 0">Basic Network Information:</h4><ul style="margin:0.5rem 0;padding-left:1.5rem;color:#ccc"><li>Height: ${info.height || 'Unknown'}</li><li>Difficulty: ${info.difficulty || 'Unknown'}</li><li>Network: ${info.mainnet ? 'Mainnet' : 'Testnet'}</li><li>Status: ${info.status || 'Unknown'}</li></ul></div><div style="display:flex;gap:1rem"><button onclick="loadNetwork()" style="padding:8px 16px;background:#52c8db;color:#000;border:none;border-radius:6px;cursor:pointer">Retry</button><button onclick="loadHome()" style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;cursor:pointer">Return to Dashboard</button></div></div>`;
                }
            } else {
                c.innerHTML = `<div class="enhanced-card"><h3>⚠️ Insufficient Network Data</h3><p>Unable to load complete network health data from DERO daemon.</p><div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:1rem;margin:1rem 0"><h4 style="color:#fbbf24;margin:0 0 0.5rem 0">Possible Solutions:</h4><ul style="margin:0.5rem 0;padding-left:1.5rem;color:#ccc"><li>Enable XSWD in Engram wallet settings</li><li>Ensure DERO daemon is fully synced</li><li>Check daemon connection status</li><li>Restart Engram and try again</li></ul></div><div style="display:flex;gap:1rem"><button onclick="loadNetwork()" style="padding:8px 16px;background:#52c8db;color:#000;border:none;border-radius:6px;cursor:pointer">Retry</button><button onclick="loadHome()" style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;cursor:pointer">Return to Dashboard</button></div>${info ? `<div style="margin-top:1rem;font-size:0.9rem;color:#888"><strong>Debug:</strong> Received ${Object.keys(info).length} fields from DERO.GetInfo</div>` : ''}</div>`;
            }
        } else {
            c.innerHTML = '<div class="enhanced-card"><h3>Failed to load network module</h3></div>';
        }
    } catch (error) {
        c.innerHTML = `<div class="enhanced-card"><h3>Connection Error</h3><p>Failed to load network health: ${error.message}</p><div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:1rem;margin:1rem 0"><h4 style="color:#ef4444;margin:0 0 0.5rem 0">Common Issues:</h4><ul style="margin:0.5rem 0;padding-left:1.5rem;color:#ccc"><li>Running outside TELA environment</li><li>XSWD connection not available</li><li>DERO daemon not accessible</li><li>Network timeout issues</li></ul></div><div style="display:flex;gap:1rem;margin-top:1rem"><button onclick="loadNetwork()" style="padding:8px 16px;background:#52c8db;color:#000;border:none;border-radius:6px;cursor:pointer">Retry</button><button onclick="loadHome()" style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;cursor:pointer">Return to Dashboard</button></div></div>`;
    }
}








// Global mining status management






// Pool monitoring functionality
let poolMonitoringInterval = null, poolMonitoringActive = false;

async function startPoolMonitoring() {
    if (poolMonitoringActive) {
        stopPoolMonitoring();
        return;
    }

    poolMonitoringActive = true;
    const status = document.getElementById('monitoring-status');
    const button = document.querySelector('button[onclick="startPoolMonitoring()"]');
    
    if (button) {
        button.textContent = '⏹️ Stop Monitoring';
        button.style.background = '#ef4444';
        button.style.color = '#fff';
    }
    
    if (status) {
        status.textContent = '🟢 Monitoring active...';
        status.style.color = '#4ade80';
    }

    poolMonitoringInterval = setInterval(async () => {
        try {
            if (!xswdCore) return;
            
            const [poolData, networkInfo] = await Promise.all([
                window.getCachedData('poolData', () => xswdCore.getTransactionPool()),
                window.getCachedData('networkInfo', () => xswdCore.call('DERO.GetInfo'))
            ]);
            
            if (poolData?.txs?.length > 0) {
                stopPoolMonitoring();
                if (status) {
                    status.textContent = `🎉 Found ${poolData.txs.length} transaction(s)!`;
                    status.style.color = '#52c8db';
                }
                setTimeout(() => loadTxPool(), 1000);
            } else {
                if (status) {
                    const timestamp = new Date().toLocaleTimeString();
                    status.textContent = `🔍 Last: ${timestamp} - Pool: ${networkInfo?.tx_pool_size || 0}`;
                }
            }
        } catch (error) {
            if (status) {
                status.textContent = '⚠️ Monitoring error - retrying...';
                status.style.color = '#fbbf24';
            }
        }
    }, 5000);
}

function stopPoolMonitoring() {
    if (poolMonitoringInterval) {
        clearInterval(poolMonitoringInterval);
        poolMonitoringInterval = null;
    }
    
    poolMonitoringActive = false;
    const status = document.getElementById('monitoring-status');
    const button = document.querySelector('button[onclick="startPoolMonitoring()"]');
    
    if (button) {
        button.textContent = '📡 Start Monitoring';
        button.style.background = '#52c8db';
        button.style.color = '#000';
    }
    
    if (status) {
        status.textContent = 'Monitoring stopped';
        status.style.color = '#888';
    }
}

// Global refresh functions
window.refreshNetworkData = () => currentRoute === 'network' && loadNetwork();
window.refreshTxPoolData = () => currentRoute === 'pool' && loadTxPool();

// Handle navigation cleanup
function handleNavigationCleanup(newRoute) {
    if (poolMonitoringActive && newRoute !== 'pool') {
        stopPoolMonitoring();
    }
}

// Global load more blocks function
window.loadMoreBlocks = async function() {
    try {
        let blocksModule = await lm('blocks-core');
        
        if (!blocksModule?.loadMoreBlocks) {
            cl('blocks-core');
            blocksModule = await lm('blocks-core');
        }
        
        if (blocksModule?.loadMoreBlocks && xswdCore) {
            await blocksModule.loadMoreBlocks(xswdCore.call.bind(xswdCore));
        } else {
            const [li, lb] = [document.getElementById('loading-indicator'), document.getElementById('load-more-blocks')];
            
            if (li) li.style.display = 'none';
            if (lb) {
                lb.textContent = 'Module Error - Refresh page';
                lb.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                lb.onclick = () => window.location.reload();
            }
        }
    } catch (error) {
        const [li, lb] = [document.getElementById('loading-indicator'), document.getElementById('load-more-blocks')];
        
        if (li) li.style.display = 'none';
        if (lb) {
            lb.style.display = 'block';
            lb.textContent = 'Error - Try again';
            lb.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            
            setTimeout(() => {
                lb.textContent = 'Load more blocks';
                lb.style.background = 'linear-gradient(135deg, #52c8db, #52c8db)';
            }, 3000);
        }
    }
};

// Raw data tab switching
window.showRawDataTab = function(tabId, button) {
    document.querySelectorAll('.raw-data-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.raw-data-tab').forEach(tab => {
        tab.style.background = 'rgba(0,0,0,0.1)';
        tab.style.color = '#888';
        tab.classList.remove('active');
    });
    
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.style.display = 'block';
    
    button.style.background = 'rgba(69, 227, 221, 0.1)';
    button.style.color = '#52c8db';
    button.classList.add('active');
};

// Export functions to global scope
window.loadNetwork = loadNetwork;

window.startPoolMonitoring = startPoolMonitoring;
window.stopPoolMonitoring = stopPoolMonitoring;
window.handleNavigationCleanup = handleNavigationCleanup; 
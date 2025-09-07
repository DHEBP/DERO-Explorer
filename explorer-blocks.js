// TELA Explorer - Block Functions Module (< 9KB)

async function loadBlocks(xswdCall) {
    currentRoute = 'blocks';
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="loading-progress">Loading blocks explorer...<div class="progress-bar"></div></div>';

    // Check XSWD connection status
    if (!xswdCall || !window.xswd || !window.xswd.isConnected) {
        
        // Update status indicators
        if (window.updateAllStatusIndicators) {
            window.updateAllStatusIndicators('connecting');
        }
        
        try {
            await window.initializeTELA(true);
            if (!window.xswd || !window.xswd.isConnected) {
                throw new Error('XSWD connection failed');
            }
            xswdCall = window.gx; // Use the global XSWD call function
        } catch (error) {
            c.innerHTML = '<div class="enhanced-card"><div class="card-header"><h2 style="color:#ef4444;font-size:1.6rem;font-weight:700;margin:0;">🚫 XSWD Connection Required</h2></div><div class="card-content"><div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:2rem;text-align:center;border-left:4px solid #ef4444;"><div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:1.5rem;">Unable to connect to DERO daemon via XSWD protocol.</div><div style="color:#888;font-size:0.8rem;margin-bottom:1.5rem;">Please ensure:<br/>• DERO daemon is running and synced<br/>• Engram wallet is open with XSWD enabled<br/>• No firewall blocking port 44326</div><div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;"><button onclick="window.reconnectXSWD?.()" style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#ef4444;padding:0.75rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:500;">🔄 Retry Connection</button><button onclick="window.location.hash=\'home\'" style="background:rgba(82,200,219,0.1);border:1px solid #52c8db;color:#52c8db;padding:0.75rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:500;">← Back to Dashboard</button></div></div></div></div>';
            return;
        }
    }

    try {
        const core = await lm('blocks-core');
        if (!core) throw new Error('Failed to load blocks module');

        const result = await core.renderBlocksExplorer(xswdCall);
        c.innerHTML = result;
        
        // Store references for pagination
        window.blocksCore = core;
        window.blocksXswd = xswdCall;
        
        // Load and store the blocks-list module for direct pagination access
        if (!window.blocksListModule) {
            window.blocksListModule = await lm('blocks-list');
            
            // Simple rate limiting for pagination
            window.blockRequestQueue = {
                lastRequest: 0,
                async add(fn) {
                    const now = Date.now();
                    const delay = Math.max(0, 500 - (now - this.lastRequest));
                    if (delay > 0) await new Promise(r => setTimeout(r, delay));
                    this.lastRequest = Date.now();
                    return fn();
                }
            };

            // Export the pagination function with rate limiting
            window.loadBlocksPage = async function(page) {
                // Disable all pagination buttons immediately
                window.disablePaginationButtons?.(true);
                
                try {
                    await window.blockRequestQueue.add(async () => {
                        if (window.blocksListModule && window.blocksXswd) {
                            await window.blocksListModule.loadBlocksPage.call(window.blocksListModule, page, window.blocksXswd);
                        } else {
                            throw new Error('Missing blocksListModule or blocksXswd');
                        }
                    });
                } catch (e) {
                } finally {
                    // Re-enable pagination buttons
                    window.disablePaginationButtons?.(false);
                }
            };

        }
        
        // Load first page automatically
        setTimeout(() => {
            const container = document.getElementById('blocks-container');
            if (core.loadBlocksPage && container) {
                core.loadBlocksPage(1, xswdCall);
            }
        }, 200);
    } catch (error) {
        c.innerHTML = `<div class="enhanced-card"><h3>Error Loading Blocks</h3><p>${error.message}</p></div>`;
    }
}

async function loadBlock(height) {
    currentRoute = 'block';
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="loading-progress">Loading block details...<div class="progress-bar"></div></div>';

    if (!xswdCore?.isConnected) {
        c.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
        return;
    }

    try {
        const [core, extras] = await Promise.all([lm('blocks-core'), lm('blocks-extras')]);
        if (!core) throw new Error('Failed to load blocks module');

        const result = await core.renderBlock(height, xswdCore.call.bind(xswdCore));
        
        if (extras) {
            // Initialize copy function
            if (extras.initCopyFunction) {
                extras.initCopyFunction();
            }
            
            const data = await xswdCore.call('DERO.GetBlock', { height: parseInt(height) });
            if (data) {
                const json = data.json ? JSON.parse(data.json) : {};
                const mini = json.miniblocks || [];
                
                // Get miners from both locations
                const miners = data.block_header?.miners || data.miners || [];
                
                const div = document.createElement('div');
                div.innerHTML = result;
                
                const card = div.querySelector('.card');
                if (card) {
                    // Always show miniblock analysis (even if empty)
                    card.insertAdjacentHTML('beforeend', extras.renderMiniblockExplorer(mini, miners));
                    card.insertAdjacentHTML('beforeend', extras.renderTechnicalAnalysis(data, json, data.block_header?.hash));
                    card.insertAdjacentHTML('beforeend', extras.renderRawDataViewer(data, json, data.block_header?.hash));
                }
                
                c.innerHTML = div.innerHTML;
            } else {
                c.innerHTML = result;
            }
        } else {
            c.innerHTML = result;
        }
    } catch (error) {
        c.innerHTML = `<div class="enhanced-card"><h3>Error Loading Block</h3><p>${error.message}</p></div>`;
    }
}

// Global pagination function is registered when blocks module loads

// Export for module loading
window.explorerBlocks = { loadBlocks, loadBlock };
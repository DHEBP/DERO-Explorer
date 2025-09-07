({
    name: 'dashboard-core',
    version: '1.0.0',

    // Core dashboard orchestration and live monitoring framework
    lastKnownHeight: 0,
    monitoringInterval: null,
    isMonitoring: false,

    async renderDashboard(xswdCall) {
        return `
        <div style="max-width: 1200px; margin: 0 auto;">


            <!-- Network Overview -->
            <div class="enhanced-card">
                <div class="card-header">
                    <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Network Overview</h2>
                    <div class="section-info" style="color: #b3b3b3; font-size: 0.9rem; margin-top: 0.5rem;">Core network statistics and health metrics</div>
                </div>
                <div class="card-content">
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.5rem;" id="network-overview">
                        <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                            <div class="stat-value" id="current-height" style="font-size: 1.8rem; font-weight: 700; color: #52c8db; margin-bottom: 0.5rem;">Loading...</div>
                            <div class="stat-label" style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Current Height</div>
                        </div>
                        <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                            <div class="stat-value" id="node-uptime" style="font-size: 1.8rem; font-weight: 700; color: #52c8db; margin-bottom: 0.5rem;">Loading...</div>
                            <div class="stat-label" style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Node Uptime</div>
                        </div>
                        <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                            <div class="stat-value" id="connected-peers" style="font-size: 1.8rem; font-weight: 700; color: #52c8db; margin-bottom: 0.5rem;">Loading...</div>
                            <div class="stat-label" style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Connected Peers</div>
                        </div>
                        <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                            <div class="stat-value" id="network-difficulty" style="font-size: 1.8rem; font-weight: 700; color: #52c8db; margin-bottom: 0.5rem;">Loading...</div>
                            <div class="stat-label" style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Difficulty</div>
                        </div>
                        <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                            <div class="stat-value" id="tx-pool-size" style="font-size: 1.8rem; font-weight: 700; color: #52c8db; margin-bottom: 0.5rem;">Loading...</div>
                            <div class="stat-label" style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">TX Pool</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Blocks Explorer -->
            <div id="homepage-block-explorer">
                <div class="enhanced-card">
                    <div class="card-header">
                        <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Recent Blocks</h2>
                        <div class="actions">
                            <button onclick="loadBlocksIncremental()" style="background: rgba(82,200,219,0.1); border: 1px solid #52c8db; color: #52c8db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;">View All Blocks</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="section-info" style="color: #b3b3b3; font-size: 0.9rem; margin-bottom: 1.5rem;">Latest blocks mined on the DERO blockchain</div>
                        <div class="loading-indicator">
                            <div class="loading-text">Loading blockchain data...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Module Loading Areas -->
            <div id="blocks-module-container"></div>
            <div id="pool-module-container"></div>
            <div id="network-module-container"></div>
            <div id="smartcontracts-module-container"></div>
            <div id="mining-module-container"></div>
        </div>`;
    },

    async updateNetworkOverview() {
        if (!this.isOnDashboard()) return; // Don't update if not on dashboard
        
        try {
            const info = await window.xswd.getNetworkInfo();
            if (!info) return;

            // Update core network stats - check if elements exist first
            const heightEl = document.getElementById('current-height');
            if (heightEl) heightEl.textContent = info.height?.toLocaleString() || '0';
            
            const uptimeEl = document.getElementById('node-uptime');
            if (uptimeEl) uptimeEl.textContent = this.formatUptime(info.uptime || 0);
            
            const peersEl = document.getElementById('connected-peers');
            if (peersEl) peersEl.textContent = ((info.incoming_connections_count || 0) + (info.outgoing_connections_count || 0)).toLocaleString();
            
            const difficultyEl = document.getElementById('network-difficulty');
            if (difficultyEl) difficultyEl.textContent = this.formatDifficulty(info.difficulty || 0);
            
            const poolEl = document.getElementById('tx-pool-size');
            if (poolEl) poolEl.textContent = info.tx_pool_size?.toLocaleString() || '0';
        } catch (error) {
        }
    },

    formatUptime(seconds) {
        if (!seconds || seconds === 0) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    },

    formatDifficulty(difficulty) {
        if (!difficulty || difficulty === 0) return '0';
        if (difficulty >= 1e9) return (difficulty / 1e9).toFixed(1) + 'G';
        if (difficulty >= 1e6) return (difficulty / 1e6).toFixed(1) + 'M';
        if (difficulty >= 1e3) return (difficulty / 1e3).toFixed(1) + 'K';
        return difficulty.toLocaleString();
    },

    async loadDashboardModules() {
        try {
            // Wait for DOM containers to be available
            const maxWaitTime = 5000; // 5 seconds max wait
            const checkInterval = 100; // Check every 100ms
            let waited = 0;
            
            while (waited < maxWaitTime) {
                const containers = [
                    'blocks-module-container',
                    'pool-module-container', 
                    'network-module-container',
                    'smartcontracts-module-container'
                ];
                
                const allContainersExist = containers.every(id => document.getElementById(id));
                
                if (allContainersExist) {
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                waited += checkInterval;
            }
            
            // Load modules in parallel for performance
            const [blocks, pool, network, smartcontracts] = await Promise.all([
                window.loadModule('dashboard-blocks'),
                window.loadModule('dashboard-pool'),
                window.loadModule('dashboard-network'),
                window.loadModule('dashboard-smartcontracts')
            ]);

            // Render each module in its container with null checks
            if (blocks) {
                const container = document.getElementById('blocks-module-container');
                if (container) {
                    const blocksHtml = await blocks.renderBlocksModule();
                    container.innerHTML = blocksHtml;
                    window.dashboardBlocks = blocks;
                }
            }

            if (pool) {
                const container = document.getElementById('pool-module-container');
                if (container) {
                    const poolHtml = await pool.renderPoolModule();
                    container.innerHTML = poolHtml;
                    window.dashboardPool = pool;
                }
            }

            if (network) {
                const container = document.getElementById('network-module-container');
                if (container) {
                    const networkHtml = await network.renderNetworkModule();
                    container.innerHTML = networkHtml;
                    window.dashboardNetwork = network;
                }
            }

            if (smartcontracts) {
                const container = document.getElementById('smartcontracts-module-container');
                if (container) {
                    const scHtml = await smartcontracts.renderSCModule();
                    container.innerHTML = scHtml;
                    window.dashboardSC = smartcontracts;
                }
            }

            // Wait for DOM to be fully ready before first updates
            setTimeout(() => {
                if (window.dashboardBlocks) window.dashboardBlocks.updateModule();
                if (window.dashboardPool) window.dashboardPool.updateModule();
                if (window.dashboardNetwork) window.dashboardNetwork.updateModule();
                if (window.dashboardSC) window.dashboardSC.updateModule();
            }, 100);

        } catch (error) {
        }
    },

    async startLiveMonitoring() {
        if (this.isMonitoring) return;
        

        this.isMonitoring = true;
        
        // Wait a moment for DOM to be ready, then start monitoring with staggered updates
        setTimeout(() => {
            if (this.isOnDashboard()) this.updateNetworkOverview();
        }, 200);
        
        // Stagger module updates to prevent XSWD overload (1 second apart)
        setTimeout(() => {
            if (this.isOnDashboard() && window.dashboardBlocks) window.dashboardBlocks.updateModule();
        }, 1200);
        
        setTimeout(() => {
            if (this.isOnDashboard() && window.dashboardPool) window.dashboardPool.updateModule();
        }, 2200);
        
        setTimeout(() => {
            if (this.isOnDashboard() && window.dashboardNetwork) window.dashboardNetwork.updateModule();
        }, 3200);
        
        setTimeout(() => {
            if (this.isOnDashboard() && window.dashboardSC) window.dashboardSC.updateModule();
        }, 4200);
        
        // Set up interval for updates every 18 seconds with staggered calls
        this.monitoringInterval = setInterval(() => {
            if (window.xswd && window.xswd.isConnected && this.isOnDashboard()) {
                // Stagger interval updates to prevent XSWD overload
                this.updateNetworkOverview();
                
                setTimeout(() => {
                    if (this.isOnDashboard() && window.dashboardBlocks) window.dashboardBlocks.updateModule();
                }, 1000);
                
                setTimeout(() => {
                    if (this.isOnDashboard() && window.dashboardPool) window.dashboardPool.updateModule();
                }, 2000);
                
                setTimeout(() => {
                    if (this.isOnDashboard() && window.dashboardNetwork) window.dashboardNetwork.updateModule();
                }, 3000);
                
                setTimeout(() => {
                    if (this.isOnDashboard() && window.dashboardSC) window.dashboardSC.updateModule();
                }, 4000);
            } else if (!this.isOnDashboard()) {
                // Don't log disconnection if we're just on a different page
            } else {
                this.stopLiveMonitoring();
            }
        }, 18000);
        

    },

    // Helper function to check if we're on the dashboard page
    isOnDashboard() {
        return window.r === 'home' || window.r === '' || !window.r;
    },

    async stopLiveMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        // Stop all module monitoring
        if (window.dashboardBlocks && window.dashboardBlocks.stopMonitoring) window.dashboardBlocks.stopMonitoring();
        if (window.dashboardPool && window.dashboardPool.stopMonitoring) window.dashboardPool.stopMonitoring();
        if (window.dashboardNetwork && window.dashboardNetwork.stopMonitoring) window.dashboardNetwork.stopMonitoring();
        if (window.dashboardSC && window.dashboardSC.stopMonitoring) window.dashboardSC.stopMonitoring();
    },

    toggleLiveMonitoring() {
        if (this.isMonitoring) {
            this.stopLiveMonitoring();
        } else {
            this.startLiveMonitoring();
        }
        return this.isMonitoring;
    }
})
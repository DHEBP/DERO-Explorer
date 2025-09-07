({
    name: 'network-ui',
    version: '1.0.0',

    // Enhanced CSS Style definitions for cohesive design system
    styles: {
        // Enhanced card styles matching homepage dashboard
        cardBase: 'background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;',
        cardSuccess: 'background:rgba(0,0,0,0.2);border:1px solid rgba(74,222,128,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;',
        cardWarning: 'background:rgba(0,0,0,0.2);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;',
        cardPurple: 'background:rgba(0,0,0,0.2);border:1px solid rgba(185,89,182,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;',
        // Typography styles matching homepage
        textSecondary: 'color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px',
        textPrimary: 'color:#52c8db;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem',
        textPurple: 'color:#b959b6;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem',
        sectionInfo: 'color:#b3b3b3;font-size:0.9rem;margin-top:0.5rem',
        // Button styles matching homepage
        button: 'background:rgba(82,200,219,0.1);border:1px solid #52c8db;color:#52c8db;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;transition:all 0.2s ease;font-weight:500'
    },

    // Enhanced stat card matching homepage dashboard design
    renderEnhancedStatCard(value, label, color) {
        return `
            <div class="enhanced-stat-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(82,200,219,0.3); border-radius: 8px; padding: 1.5rem; text-align: center; transition: all 0.2s ease;">
                <div style="font-size: 1.8rem; font-weight: 700; color: ${color}; margin-bottom: 0.5rem;">${value}</div>
                <div style="color: #b3b3b3; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
            </div>
        `;
    },

    // Main dashboard rendering function
    async renderNetworkDashboard(xswdCall) {
        const networkCore = await window.lm('network-core');
        if (!networkCore) {
            return '<div class="card"><h3>Network core module unavailable</h3></div>';
        }

        const networkInfo = await xswdCall('DERO.GetInfo');
        if (!networkInfo) {
            return '<div class="card"><h3>Unable to fetch network data</h3></div>';
        }

        const totalPeers = (networkInfo.incoming_connections_count || 0) + (networkInfo.outgoing_connections_count || 0);

        return `
            <div style="max-width: 1200px; margin: 0 auto;">
                <!-- Network Overview Stats -->
                <div class="enhanced-card">
                    <div class="card-header">
                        <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Network Overview</h2>
                        <div class="section-info" style="color: #b3b3b3; font-size: 0.9rem; margin-top: 0.5rem;">Core network statistics and health metrics</div>
                    </div>
                    <div class="card-content">
                        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                            ${this.renderEnhancedStatCard((networkInfo.height || 0).toLocaleString(), 'Current Height', '#b959b6')}
                            ${this.renderEnhancedStatCard(totalPeers, 'Connected Peers', '#4ade80')}
                            ${this.renderEnhancedStatCard((networkInfo.stableheight || 0).toLocaleString(), 'Stable Height', '#52c8db')}
                            ${this.renderEnhancedStatCard(networkCore.formatUptime(networkInfo.uptime || 0), 'Node Uptime', '#fbbf24')}
                        </div>
                    </div>
                </div>

                <!-- Peer Connections and Sync Status -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                    ${this.renderPeerConnectionsCard(networkCore.analyzePeerConnections(networkInfo))}
                    ${this.renderSyncStatusCard(networkCore.analyzeSyncStatus(networkInfo))}
                </div>

                <!-- Mining & Block Performance -->
                ${this.renderMiningPerformanceCard(networkCore.analyzeMiningPerformance(networkInfo))}

                <!-- Advanced Network Analytics -->
                ${await this.renderAdvancedAnalytics(networkInfo, xswdCall)}
            </div>
        `;
    },

    // Utility function for stat cards
    renderStatCard: function(value, label, cardStyle, valueStyle) {
        return `
            <div class="stat-card" style="${cardStyle}">
                <div style="${valueStyle}">${value}</div>
                <div style="${this.styles.textSecondary}">${label}</div>
            </div>
        `;
    },

    // Peer Connections Card
    renderPeerConnectionsCard: function(peerData) {
        return `
            <div class="enhanced-card">
                <div class="card-header">
                    <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Peer Connections</h2>
                </div>
                <div class="card-content">
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Total Peers:</div>
                        <div style="color:#4ade80;font-size:1.1rem;font-weight:600">${peerData.total}</div>
                    </div>
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Incoming:</div>
                        <div style="color:#52c8db;font-size:1.1rem;font-weight:600">${peerData.incoming}</div>
                    </div>
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Outgoing:</div>
                        <div style="color:#b959b6;font-size:1.1rem;font-weight:600">${peerData.outgoing}</div>
                    </div>
                    <div>
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Network Type:</div>
                        <div style="color:#4ade80;font-size:1.1rem;font-weight:600">${peerData.networkType}</div>
                    </div>
                </div>
            </div>
        `;
    },

    // Sync Status Card
    renderSyncStatusCard: function(syncData) {
        return `
            <div class="enhanced-card">
                <div class="card-header">
                    <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Sync Status</h2>
                </div>
                <div class="card-content">
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Sync Status:</div>
                        <div style="color:${syncData.color};font-size:1.1rem;font-weight:600">${syncData.status}</div>
                    </div>
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Pool Size:</div>
                        <div style="color:#fbbf24;font-size:1.1rem;font-weight:600">${syncData.poolSize}</div>
                    </div>
                    <div style="margin-bottom:0.75rem">
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Height Gap:</div>
                        <div style="color:#4ade80;font-size:1.1rem;font-weight:600">${syncData.heightGap}</div>
                    </div>
                    <div>
                        <div style="color:#888;font-size:0.8rem;margin-bottom:0.25rem">Block Size:</div>
                        <div style="color:#52c8db;font-size:1.1rem;font-weight:600">0 B</div>
                    </div>
                </div>
            </div>
        `;
    },

    // Mining Performance Card
    renderMiningPerformanceCard: function(miningData) {
        const borderColor = miningData.variance < 10 ? 'rgba(74,222,128,0.3)' : 
                           miningData.variance < 25 ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.3)';
        
        return `
            <div class="enhanced-card">
                <div class="card-header">
                    <h2 style="color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0;">Mining & Block Performance</h2>
                    <div class="section-info" style="color: #b3b3b3; font-size: 0.9rem; margin-top: 0.5rem;">Performance: <span style="color: #4ade80; font-weight: 500;">Optimal</span> • Trend: <span style="color: #4ade80; font-weight: 500;">Stable</span></div>
                </div>
                <div class="card-content">
                    <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                        <div class="enhanced-stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(185,89,182,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;">
                            <div style="color:#b959b6;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem">${miningData.difficulty}</div>
                            <div style="color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px">Network Difficulty</div>
                        </div>
                        <div class="enhanced-stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(82,200,219,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;">
                            <div style="color:#52c8db;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem">${miningData.hashrate}</div>
                            <div style="color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px">Est. Hashrate</div>
                        </div>
                        <div class="enhanced-stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;">
                            <div style="color:#fbbf24;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem">${miningData.targetTime}s</div>
                            <div style="color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px">Target Time</div>
                        </div>
                        <div class="enhanced-stat-card" style="background:rgba(0,0,0,0.2);border:1px solid rgba(74,222,128,0.3);border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;">
                            <div style="color:#4ade80;font-size:1.8rem;font-weight:700;margin-bottom:0.5rem">${miningData.blockTime}s</div>
                            <div style="color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px">Avg Time</div>
                        </div>
                        <div class="enhanced-stat-card" style="background:rgba(0,0,0,0.2);border:1px solid ${borderColor};border-radius:8px;padding:1.5rem;text-align:center;transition:all 0.2s ease;">
                            <div style="color:${miningData.performanceColor};font-size:1.8rem;font-weight:700;margin-bottom:0.5rem">${miningData.variance}%</div>
                            <div style="color:#b3b3b3;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px">Variance</div>
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.1);border-radius:6px;padding:0.75rem;font-size:0.8rem;color:#888">
                        Performance: <span style="color:${miningData.performanceColor};font-weight:600">${miningData.status}</span> • Trend: <span style="color:#4ade80;font-weight:600">Stable</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Advanced analytics with error handling - delegates to analytics module
    async renderAdvancedAnalytics(networkInfo, xswdCall) {
        const networkAnalytics = await window.lm('network-analytics');
        if (!networkAnalytics) {
            return `
                <div style="margin-bottom:1.5rem">
                    <h3 style="color:#52c8db;margin-bottom:1rem;font-size:1.2rem;font-weight:600">Advanced Network Analytics</h3>
                    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:1rem;color:#ef4444">
                        Error: Analytics module unavailable
                    </div>
                </div>
            `;
        }
        
        return await networkAnalytics.renderAdvancedAnalytics(networkInfo, xswdCall);
    },

    // Node info renderer
    async renderNodeInfo(networkInfo) {
        const networkAnalytics = await window.lm('network-analytics');
        const networkCore = await window.lm('network-core');
        
        if (!networkAnalytics || !networkCore) {
            return '<div class="enhanced-card"><h3>Module loading error</h3></div>';
        }
        
        const nodeData = networkCore.analyzeNodeInfo(networkInfo);
        return networkAnalytics.renderNodeInfo(nodeData);
    },

    // Main network loading and refresh functions
    async refreshData(xswdCall) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading-progress">Refreshing network data...<div class="progress-bar"></div></div>';
        
        try {
            const html = await this.renderNetworkDashboard(xswdCall);
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="enhanced-card"><h3>Network refresh failed</h3><p>${error.message}</p></div>`;
        }
    },

    async loadNetwork(xswdCall) {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading-progress">Loading network health...<div class="progress-bar"></div></div>';
        
        try {
            const html = await this.renderNetworkDashboard(xswdCall);
            container.innerHTML = html;
            
            // Set up global refresh function
            window.refreshNetworkData = () => {
                this.refreshData(xswdCall);
            };
        } catch (error) {
            container.innerHTML = `<div class="enhanced-card"><h3>Network loading failed</h3><p>${error.message}</p></div>`;
        }
    }
});

// Global network module registration
window.refreshNetworkData = function() {
    if (window.networkModule && window.gx) {
        window.networkModule.refreshData(window.gx);
    }
};

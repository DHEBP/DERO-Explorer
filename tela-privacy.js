window.TelaPrivacy = ({
    name: 'tela-privacy',
    version: '1.0.0',

    // Privacy modal state
    isVisible: false,
    apiRequestCount: 0,
    externalRequestsBlocked: 0,
    connectionStartTime: null,
    telexModule: null,

    async init() {
        this.connectionStartTime = Date.now();
        
        // Load TELEX module
        try {
            this.telexModule = await window.lm('telex');
            if (this.telexModule) {
                window.telex = this.telexModule;
                this.telexModule.init();
            }
        } catch (error) {
            console.warn('TELEX module failed to load:', error);
            // Create fallback basic modal
            this.createBasicPrivacyModal();
        }
        
        // Don't immediately set to secure - let main.js control the status
        this.startMetricsTracking();
    },

    updatePrivacyStatus: function(status) {
        const dot = document.querySelector('#privacy-indicator .privacy-dot');
        const text = document.getElementById('privacy-status-text');
        
        if (dot) {
            dot.className = 'privacy-dot';
            
            switch (status) {
                case 'secure':
                case 'connected':
                    dot.classList.add('dot-green');
                    if (text) {
                        text.textContent = 'Connected';
                        text.style.color = '#28a745';
                    }
                    break;
                case 'connecting':
                    dot.classList.add('dot-yellow');
                    if (text) {
                        text.textContent = 'Connecting...';
                        text.style.color = '#fbbf24';
                    }
                    break;
                case 'warning':
                    dot.classList.add('dot-yellow');
                    if (text) {
                        text.textContent = 'Monitored';
                        text.style.color = '#fbbf24';
                    }
                    break;
                case 'insecure':
                case 'disconnected':
                case 'error':
                    dot.classList.add('dot-red');
                    if (text) {
                        text.textContent = 'Disconnected';
                        text.style.color = '#ef4444';
                    }
                    break;
                default:
                    dot.classList.add('dot-yellow');
                    if (text) {
                        text.textContent = 'Connecting...';
                        text.style.color = '#fbbf24';
                    }
            }
        }
    },

    togglePrivacyStatus: function() {
        // Use TELEX terminal if available, otherwise fallback to basic modal
        if (this.telexModule) {
            this.telexModule.togglePrivacyStatus();
        } else {
            this.toggleBasicModal();
        }
    },

    toggleBasicModal: function() {
        const modal = document.getElementById('basic-privacy-modal');
        if (modal) {
            this.isVisible = !this.isVisible;
            modal.style.display = this.isVisible ? 'block' : 'none';
        }
    },

    createBasicPrivacyModal: function() {
        const modal = document.createElement('div');
        modal.id = 'basic-privacy-modal';
        modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000';
        
        modal.innerHTML = `
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;border:1px solid #52c8db;border-radius:8px;width:90%;max-width:500px;padding:2rem">
                <div style="color:#52c8db;font-size:1.2rem;margin-bottom:1rem">TELA Privacy Status</div>
                <div style="color:#fff;margin-bottom:1rem">
                    ✅ All data flows directly from your DERO node<br/>
                    ✅ No external APIs or tracking<br/>
                    ✅ Complete privacy and decentralization
                </div>
                <div style="color:#b3b3b3;font-size:0.9rem;margin-bottom:1.5rem">
                    API Requests: <span id="basic-api-count">${this.apiRequestCount}</span><br/>
                    External Requests Blocked: <span id="basic-blocked-count">${this.externalRequestsBlocked}</span>
                </div>
                <button onclick="window.TelaPrivacy.toggleBasicModal()" style="background:#52c8db;border:none;color:#000;padding:0.5rem 1rem;border-radius:4px;cursor:pointer">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    startMetricsTracking: function() {
        setInterval(() => {
            this.updateMetrics();
        }, 1000);
    },

    updateMetrics: function() {
        // Update basic modal if it exists
        const apiCount = document.getElementById('basic-api-count');
        const blockedCount = document.getElementById('basic-blocked-count');
        
        if (apiCount) apiCount.textContent = this.apiRequestCount;
        if (blockedCount) blockedCount.textContent = this.externalRequestsBlocked;
    },

    incrementApiRequests: function() {
        this.apiRequestCount++;
        if (this.telexModule) {
            this.telexModule.incrementApiRequests();
        }
    },

    incrementBlockedRequests: function() {
        this.externalRequestsBlocked++;
        if (this.telexModule) {
            this.telexModule.incrementBlockedRequests();
        }
    },

    // Legacy compatibility methods
    togglePrivacyModal: function() {
        this.togglePrivacyStatus();
    },

    showPrivacyModal: function() {
        this.togglePrivacyStatus();
    }
});

window.TelaPrivacy;
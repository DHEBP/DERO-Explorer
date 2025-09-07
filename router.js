({
    name: 'router',
    version: '1.0.0',

    // Helper function to ensure updateActiveNav works properly
    ensureActiveNavUpdate: function(page) {
        requestAnimationFrame(() => {
            setTimeout(async () => {
                try {
                    if (!window.routerUtils && window.lm) {
                        await window.lm('router-utils');
                    }
                    
                    if (window.updateActiveNav) {
                        window.updateActiveNav(page);
                    } else if (window.routerUtils && window.routerUtils.updateActiveNav) {
                        window.routerUtils.updateActiveNav(page);
                    }
                } catch (error) {
                    console.warn('Failed to update active nav for ' + page + ':', error);
                }
            }, 50);
        });
    },

    // Handle route changes
    hr: function() {
        var hash = window.location.hash.slice(1);
        var parts = hash.split('/');
        var route = parts[0];
        var param = parts[1];
        
        // Cleanup: stop pool auto-refresh when leaving pool page
        if (window.r === 'pool' && route !== 'pool' && window.dashboardPool && window.dashboardPool.stopAutoRefresh) {
            window.dashboardPool.stopAutoRefresh();
        }
        
        if (window.addToHistory) {
            window.addToHistory(hash || 'home');
        }
        
        switch (route) {
            case 'block':
                this.lb(param);
                break;
            case 'tx':
                this.lt(param);
                break;
            case 'sc':
                this.lsc(param);
                break;
            case 'blocks':
                this.lbs();
                this.ensureActiveNavUpdate('blocks');
                break;
            case 'transactions':
                this.lts();
                this.ensureActiveNavUpdate('transactions');
                break;
            case 'smartcontracts':
                this.lscs();
                this.ensureActiveNavUpdate('smartcontracts');
                break;
            case 'network':
                this.ln();
                this.ensureActiveNavUpdate('network');
                break;
            case 'pool':
                this.lp();
                this.ensureActiveNavUpdate('pool');
                break;

            default:
                if (window.loadHome) {
                    window.loadHome();
                }
        }
    },

    // Load block by height/hash
    lb: function(height) {
        if (window.setCurrentRoute) window.setCurrentRoute('block');
        window.location.hash = 'block/' + height;
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading block...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('explorer').then(function(explorer) {
            if (explorer && explorer.loadBlock) {
                return explorer.loadBlock(height, window.gx);
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load block module</h3></div>';
            }
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Block loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load transaction by hash
    lt: function(txHash) {
        if (window.setCurrentRoute) window.setCurrentRoute('tx');
        window.location.hash = 'tx/' + txHash;
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading transaction...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('explorer').then(function(explorer) {
            if (explorer && explorer.loadTransaction) {
                return explorer.loadTransaction(txHash, window.gx);
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load transaction module</h3></div>';
            }
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Transaction loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load blocks page
    lbs: function() {
        if (window.setCurrentRoute) window.setCurrentRoute('blocks');
        window.location.hash = 'blocks';
        this.ensureActiveNavUpdate('blocks');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading blocks...<div class="progress-bar"></div></div>';
        
        window.lm('explorer').then(function(explorer) {
            if (explorer && explorer.loadBlocks) {
                return explorer.loadBlocks(window.gx);
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load blocks module</h3></div>';
            }
        }).then(function() {
            // Restore active state after content loads
            setTimeout(() => {
                if (window.restoreActiveState) window.restoreActiveState();
            }, 200);
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Blocks loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load transactions page
    lts: function() {
        if (window.setCurrentRoute) window.setCurrentRoute('transactions');
        window.location.hash = 'transactions';
        this.ensureActiveNavUpdate('transactions');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading transactions...<div class="progress-bar"></div></div>';
        
        window.lm('explorer-transactions').then(function(transactionsModule) {
            if (transactionsModule && transactionsModule.loadTransactions) {
                return transactionsModule.loadTransactions();
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load transactions module</h3></div>';
            }
        }).then(function() {
            // Restore active state after content loads
            setTimeout(() => {
                if (window.restoreActiveState) window.restoreActiveState();
            }, 200);
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Transactions loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load network page
    ln: function() {
        if (window.setCurrentRoute) window.setCurrentRoute('network');
        window.location.hash = 'network';
        this.ensureActiveNavUpdate('network');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading network...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('network-ui').then(function(network) {
            if (network && network.loadNetwork) {
                return network.loadNetwork(window.gx);
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load network UI module</h3></div>';
            }
        }).then(function() {
            // Restore active state after content loads
            setTimeout(() => {
                if (window.restoreActiveState) window.restoreActiveState();
            }, 200);
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Network loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load transaction pool page
    lp: function() {
        if (window.setCurrentRoute) window.setCurrentRoute('pool');
        window.r = 'pool'; // Ensure route variable is set
        window.location.hash = 'pool';
        this.ensureActiveNavUpdate('pool');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading transaction pool...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('dashboard-pool').then(function(poolModule) {
            if (poolModule && poolModule.renderPoolModule) {
                return poolModule.renderPoolModule();
            } else {
                output.innerHTML = '<div class="enhanced-card"><h3>Unable to load pool module</h3></div>';
            }
        }).then(function(poolHTML) {
            if (poolHTML) {
                output.innerHTML = poolHTML;
                // Initialize pool monitoring if available
                return window.lm('dashboard-pool').then(function(poolModule) {
                    if (poolModule && poolModule.updateModule) {
                        window.dashboardPool = poolModule;
                        // Wait a bit for DOM to be ready, then update and start auto-refresh
                        setTimeout(function() {
                            poolModule.updateModule();
                            poolModule.startAutoRefresh();
                            // Restore active state after pool content loads
                            if (window.restoreActiveState) window.restoreActiveState();
                        }, 100);
                    }
                });
            }
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Transaction pool loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load smart contracts page
    lscs: function() {
        if (window.setCurrentRoute) window.setCurrentRoute('smartcontracts');
        window.location.hash = 'smartcontracts';
        this.ensureActiveNavUpdate('smartcontracts');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading smart contracts...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('smartcontracts').then(function(smartcontracts) {
            if (!smartcontracts) {
                throw new Error('Failed to load smartcontracts module');
            }
            
            // Make smart contracts functions globally available
            window.smartcontracts = smartcontracts;
            if (smartcontracts.searchSC) {
                window.searchSC = smartcontracts.searchSC;
            }
            
            return smartcontracts.renderSmartContracts(window.gx);
        }).then(function(result) {
            output.innerHTML = result;
            // Restore active state after content loads
            setTimeout(() => {
                if (window.restoreActiveState) window.restoreActiveState();
            }, 200);
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Smart contracts loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load smart contract details
    lsc: function(scid) {
        if (window.setCurrentRoute) window.setCurrentRoute('sc');
        window.location.hash = 'sc/' + scid;
        this.ensureActiveNavUpdate('smartcontracts');
        
        var output = document.getElementById('main-content');
        output.innerHTML = '<div class="loading-progress">Loading smart contract...<div class="progress-bar"></div></div>';
        
        if (!window.xswd || window.connectionStatus === 'error') {
            output.innerHTML = '<div class="enhanced-card"><h3>TELA connection required</h3></div>';
            return;
        }
        
        window.lm('smartcontracts').then(function(smartcontracts) {
            if (!smartcontracts) {
                throw new Error('Failed to load smartcontracts module');
            }
            
            // Make smart contracts functions globally available
            window.smartcontracts = smartcontracts;
            if (smartcontracts.searchSC) {
                window.searchSC = smartcontracts.searchSC;
            }
            
            return smartcontracts.renderSCDetails(scid, window.gx);
        }).then(function(result) {
            output.innerHTML = result;
        }).catch(function(error) {
            output.innerHTML = '<div class="enhanced-card"><h3>Smart contract loading failed</h3><p>' + error.message + '</p></div>';
        });
    },

    // Load blocks page (incremental/alternative)
    loadBlocksIncremental: function() {

        this.lbs();
    },



    // Navigate to specific block
    navigateToBlock: function(height) {
        window.location.hash = 'block/' + height;
    },

    // Update active navigation button (delegates to utils)
    updateActiveNav: function(page) {
        if (window.routerUtils) {
            window.routerUtils.updateActiveNav(page);
        }
    }
});

// Note: Global router functions moved to router-utils.js for better organization
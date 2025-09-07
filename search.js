({
    name: 'search',
    version: '1.0.0',

    // Render search bar HTML
    renderSearchBar: function() {
        return '<div class="card"><div class="section-header"><h2>Blockchain Search</h2><div class="section-info">Search blocks, transactions, and addresses on the DERO blockchain</div></div><div class="search-bar" style="margin-top:0;margin-bottom:1rem"><input type="text" id="dashboard-search-input" placeholder="Block height, hash, transaction hash, or SCID..." onkeypress="if(event.key===\'Enter\')window.searchModule.performSearch()"><button onclick="window.searchModule.performSearch()">Search</button></div><div class="search-hint"><strong>Examples:</strong><a href="#" onclick="window.searchModule.quickSearch(\'0\')" style="color:var(--primary-color);margin:0 8px">Block 0</a> • <a href="#" onclick="window.searchModule.quickSearch(\'543210\')" style="color:var(--primary-color);margin:0 8px">Block 543210</a> • <a href="#" onclick="window.searchModule.quickSearch(\'latest\')" style="color:var(--primary-color);margin:0 8px">Latest</a> • <a href="#" onclick="window.searchModule.quickSearch(\'pool\')" style="color:var(--primary-color);margin:0 8px">Mempool</a><br><strong>Also supports:</strong> Transaction hashes, Block hashes, Smart Contract IDs (SCIDs)</div></div>';
    },

    // Quick search with predefined query
    quickSearch: function(query) {
        const input = document.getElementById('dashboard-search-input') || document.getElementById('search-input');
        if (input) {
            input.value = query;
            this.performSearch();
        }
    },

    // Detect search query type
    detectType: function(query) {
        query = query.trim();
        
        // Check for block height (numbers only)
        if (/^\d+$/.test(query)) return 'height';
        
        // Check for 64-character hex strings (could be SCID, block hash, or tx hash)
        if (/^[0-9a-fA-F]{64}$/i.test(query)) {
            // Try to distinguish between SCID and regular hashes
            // SCIDs often have different patterns than block/tx hashes
            // For now, default to 'hash' and let the search function try both
            return 'hash';
        }
        
        // Special keywords
        if (query.toLowerCase() === 'latest') return 'latest';
        if (query.toLowerCase() === 'pool') return 'pool';
        
        // Partial hash (less than 64 chars but hex)
        if (/^[0-9a-fA-F]{8,}$/i.test(query) && query.length < 64) return 'partial';
        
        return 'unknown';
    },

    // Perform search based on query
    performSearch: async function() {
        const input = document.getElementById('dashboard-search-input') || document.getElementById('search-input');
        const query = input ? input.value.trim() : '';
        
        if (!query) {
            this.showError('Please enter a search query');
            return;
        }
        
        this.showProgress('Searching...');
        
        try {
            const type = this.detectType(query);
            
            switch (type) {
                case 'height':
                    this.clearSearch();
                    window.location.hash = 'block/' + query;
                    break;
                    
                case 'latest':
                    if (window.stats && window.stats.height) {
                        this.clearSearch();
                        window.location.hash = 'block/' + window.stats.height;
                    } else {
                        const info = await window.xswdCore.getNetworkInfo();
                        if (info && info.height) {
                            this.clearSearch();
                            window.location.hash = 'block/' + info.height;
                        } else {
                            this.showError('Unable to get latest block height');
                        }
                    }
                    break;
                    
                case 'pool':
                    this.clearSearch();
                    window.location.hash = 'pool';
                    break;
                    
                case 'hash':
                    await this.searchHash(query);
                    break;
                    
                case 'partial':
                    this.showError('Hash appears incomplete. Please provide the full 64-character hash.');
                    break;
                    
                default:
                    this.showError('Invalid search query. Use block height, block hash, transaction hash, SCID, "latest", or "pool".');
            }
        } catch (error) {
            this.showError('Search failed: ' + error.message);
        }
    },

    // Search for hash (could be block or transaction)
    searchHash: async function(hash) {
        if (!window.xswdCore || !window.xswdCore.isConnected) {
            this.showError('XSWD connection required');
            return;
        }
        
        try {
            // Try as block hash first
            const blockResult = await window.xswdCore.call('DERO.GetBlockHeaderByHash', { hash: hash });
            
            if (blockResult && blockResult.block_header) {
                this.clearSearch();
                window.location.hash = 'block/' + blockResult.block_header.height;
                return;
            }
        } catch (error) {
            // Not a block hash, continue to try as transaction
        }
        
        try {
            // Try as transaction hash
            const txResult = await window.xswdCore.call('DERO.GetTransaction', { txs_hashes: [hash] });
            
            if (txResult && txResult.txs_as_hex && txResult.txs_as_hex.length > 0) {
                this.clearSearch();
                window.location.hash = 'tx/' + hash;
                return;
            }
        } catch (error) {
            // Not a transaction hash either
        }
        
        // Final fallback: try as SCID
        try {
            const normalizedSCID = hash.toLowerCase();
            const scInfo = await window.xswdCore.call('DERO.GetSC', { 
                scid: normalizedSCID,
                code: false,
                variables: true
            });
            
            if (scInfo && (scInfo.status === 'OK' || scInfo.balance !== undefined)) {
                this.clearSearch();
                window.location.hash = 'smartcontracts/' + normalizedSCID;
                return;
            }
        } catch (error) {
            // Not a valid SCID either
        }
        
        this.showError('Hash not found in blockchain. Please verify it is a valid block hash, transaction hash, or smart contract ID (SCID).');
    },

    // Search for SCID (Smart Contract ID)
    searchSCID: async function(scid) {
        if (!window.xswdCore || !window.xswdCore.isConnected) {
            this.showError('XSWD connection required');
            return;
        }
        
        try {
            // Normalize SCID to lowercase
            const normalizedSCID = scid.toLowerCase();
            
            // Try to get smart contract information
            const scInfo = await window.xswdCore.call('DERO.GetSC', { 
                scid: normalizedSCID,
                code: false,
                variables: true
            });
            
            if (scInfo && (scInfo.status === 'OK' || scInfo.balance !== undefined)) {
                // SCID exists - navigate to smart contracts page with this SCID
                this.clearSearch();
                window.location.hash = 'smartcontracts/' + normalizedSCID;
                return;
            }
        } catch (error) {
        }
        
        // If SCID lookup failed, try as a regular hash (could be misidentified)
        try {
            await this.searchHash(scid);
            return;
        } catch (error) {
            // Final fallback error
            this.showError('SCID "' + scid + '" not found. Please verify it is a valid smart contract ID, block hash, or transaction hash.');
        }
    },

    // Clear search input
    clearSearch: function() {
        const input = document.getElementById('dashboard-search-input') || document.getElementById('search-input');
        if (input) {
            input.value = '';
        }
    },

    // Show search progress
    showProgress: function(message) {
        const searchResult = document.getElementById('search-result');
        if (searchResult) {
            searchResult.innerHTML = '<div class="loading-indicator">' + message + '</div>';
        }
    },

    // Show search error
    showError: function(message) {
        const searchResult = document.getElementById('search-result');
        if (searchResult) {
            searchResult.innerHTML = '<div class="enhanced-card"><div class="error-card"><h3>Search Error</h3><p>' + message + '</p></div></div>';
        } else {
            alert(message);
        }
    },

    // Show search success
    showSuccess: function(message) {
        const searchResult = document.getElementById('search-result');
        if (searchResult) {
            searchResult.innerHTML = '<div class="enhanced-card"><div class="success-card"><h3>Search Complete</h3><p>' + message + '</p></div></div>';
        }
    }
});
({
    name: 'network-core',
    version: '1.0.0',

    // Core utility functions
    formatUptime: function(uptime) {
        if (!uptime) return '0s';
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    },

    formatHashrate: function(difficulty) {
        if (!difficulty) return '0 H/s';
        const hashrate = difficulty / 18;
        
        if (hashrate > 1e12) return `${(hashrate / 1e12).toFixed(1)} TH/s`;
        if (hashrate > 1e9) return `${(hashrate / 1e9).toFixed(1)} GH/s`;
        if (hashrate > 1e6) return `${(hashrate / 1e6).toFixed(1)} MH/s`;
        if (hashrate > 1e3) return `${(hashrate / 1e3).toFixed(1)} KH/s`;
        return `${hashrate.toFixed(0)} H/s`;
    },

    // Core network analysis functions
    analyzePeerConnections: function(networkInfo) {
        const totalPeers = (networkInfo.incoming_connections_count || 0) + (networkInfo.outgoing_connections_count || 0);
        const incoming = networkInfo.incoming_connections_count || 0;
        const outgoing = networkInfo.outgoing_connections_count || 0;
        
        return {
            total: totalPeers,
            incoming: incoming,
            outgoing: outgoing,
            networkType: 'Mainnet'
        };
    },

    analyzeSyncStatus: function(networkInfo) {
        const syncStatus = networkInfo.stableheight ? 
            (networkInfo.height - networkInfo.stableheight <= 8 ? 'Fully Synced' : 'Syncing') : 
            networkInfo.status || 'Unknown';
        const syncColor = syncStatus === 'Fully Synced' ? '#4ade80' : '#fbbf24';
        const poolSize = networkInfo.tx_pool_size || 0;
        const heightGap = (networkInfo.height || 0) - (networkInfo.stableheight || 0);
        
        return {
            status: syncStatus,
            color: syncColor,
            poolSize: poolSize,
            heightGap: heightGap
        };
    },

    analyzeMiningPerformance: function(networkInfo) {
        const difficulty = (networkInfo.difficulty || 0).toLocaleString();
        const hashrate = this.formatHashrate(networkInfo.difficulty || 0);
        const blockTime = networkInfo.averageblocktime50 || networkInfo.target || 18;
        const targetTime = networkInfo.target || 18;
        const variance = (Math.abs(blockTime - targetTime) / targetTime * 100).toFixed(1);
        const performanceColor = variance < 10 ? '#4ade80' : variance < 25 ? '#fbbf24' : '#ef4444';
        
        return {
            difficulty: difficulty,
            hashrate: hashrate,
            blockTime: blockTime,
            targetTime: targetTime,
            variance: variance,
            performanceColor: performanceColor,
            status: variance < 10 ? 'Optimal' : variance < 25 ? 'Good' : 'Variable'
        };
    },

    analyzeMiningProduction: function(networkInfo) {
        const expectedDaily = Math.floor(86400 / (networkInfo.target || 18));
        const blockRewardAtomic = 65000;
        const blockReward = blockRewardAtomic / 100000;
        const dailyEmission = expectedDaily * blockReward;
        const miningStatus = networkInfo.status === 'OK' ? 'Active' : 'Inactive';
        
        return {
            expectedDaily: expectedDaily,
            blockReward: blockReward,
            dailyEmission: dailyEmission,
            miningStatus: miningStatus
        };
    },

    analyzeMiningEfficiency: function(networkInfo) {
        const algorithm = 'AstroBWT';
        const avgBlockSize = (networkInfo.median_block_size || 0) / 1024;
        const networkType = networkInfo.testnet ? 'Testnet' : 'Mainnet';
        const syncStatus = networkInfo.status || 'Unknown';
        
        return {
            algorithm: algorithm,
            avgBlockSize: avgBlockSize,
            networkType: networkType,
            syncStatus: syncStatus
        };
    },

    analyzeMemoryStorage: function(networkInfo) {
        const miniblocksInMemory = networkInfo.miniblocks_in_memory || 0;
        const whitelistPeers = networkInfo.white_peerlist_size || 0;
        const greylistPeers = networkInfo.grey_peerlist_size || 0;
        const connectedMiners = networkInfo.connected_miners || 0;
        
        return {
            miniblocksInMemory: miniblocksInMemory,
            whitelistPeers: whitelistPeers,
            greylistPeers: greylistPeers,
            connectedMiners: connectedMiners
        };
    },

    analyzeTransactionPool: function(networkInfo, poolData) {
        const poolSize = (poolData && poolData.txs) ? poolData.txs.length : 1;
        const registrationPool = 0;
        const dynamicFeeKB = (networkInfo.dynamic_fee_per_kb || 50000) / 100000;
        const totalSupply = ((networkInfo.total_supply || 0) / 1000).toLocaleString();
        
        return {
            poolSize: poolSize,
            registrationPool: registrationPool,
            dynamicFeeKB: dynamicFeeKB,
            totalSupply: totalSupply
        };
    },

    analyzeSecurityStatus: function(networkInfo, lastBlock) {
        let topBlockHash = 'Loading...';
        let treeHash = 'Loading...';
        
        if (lastBlock) {
            if (lastBlock.hash) {
                topBlockHash = lastBlock.hash;
            } else if (lastBlock.block_header && lastBlock.block_header.hash) {
                topBlockHash = lastBlock.block_header.hash;
            }
        }
        
        if (networkInfo.treehash) {
            treeHash = networkInfo.treehash;
        } else if (networkInfo.top_block_hash) {
            topBlockHash = networkInfo.top_block_hash;
        }
        
        const altBlocks = networkInfo.alt_blocks_count || 0;
        const chainExtended = 0;
        
        return {
            topBlockHash: topBlockHash,
            treeHash: treeHash,
            altBlocks: altBlocks,
            chainExtended: chainExtended
        };
    },

    analyzeNodeInfo: function(networkInfo) {
        const status = networkInfo.status || 'Unknown';
        const statusColor = status === 'OK' ? '#4ade80' : '#fbbf24';
        const memUsed = (networkInfo.rpc_connections || 0) * 0.1;
        const memPercent = (memUsed / 1024 * 100).toFixed(1);
        const memColor = memPercent < 70 ? '#4ade80' : memPercent < 85 ? '#fbbf24' : '#ef4444';
        const version = networkInfo.version || 'Unknown';
        const versionDisplay = version.length > 30 ? version.substring(0, 30) + '...' : version;
        
        return {
            status: status,
            statusColor: statusColor,
            memPercent: memPercent,
            memColor: memColor,
            version: version,
            versionDisplay: versionDisplay,
            rpcConnections: networkInfo.rpc_connections || 0,
            altBlocks: networkInfo.alt_blocks_count || 0
        };
    },

    // Main network data gathering function
    async getNetworkHealth(xswdCall) {
        try {
            const info = await xswdCall('DERO.GetInfo');
            const peers = await xswdCall('DERO.GetPeers');
            
            return {
                height: info.height || 0,
                peer_count: info.peer_count || 0,
                status: info.status || 'Unknown',
                uptime: info.uptime || 0,
                difficulty: info.difficulty || 0,
                version: info.version || 'Unknown',
                peers: peers || []
            };
        } catch (error) {
            console.error('Network health check failed:', error);
            return {
                height: 0,
                peer_count: 0,
                status: 'Error',
                uptime: 0,
                difficulty: 0,
                version: 'Unknown',
                peers: []
            };
        }
    },

    // Advanced analytics data gathering
    async gatherAdvancedAnalytics(networkInfo, xswdCall) {
        try {
            const poolData = await xswdCall('DERO.GetTxPool');
            const lastBlockData = await xswdCall('DERO.GetLastBlockHeader');
            
            return {
                networkInfo: networkInfo,
                poolData: poolData,
                lastBlockData: lastBlockData,
                success: true
            };
        } catch (error) {
            console.error('❌ XSWD API Error:', error);
            return {
                networkInfo: networkInfo,
                poolData: null,
                lastBlockData: null,
                success: false,
                error: error.message
            };
        }
    }
});

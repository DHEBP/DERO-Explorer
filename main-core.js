// TELA Explorer - Core System Module (< 18KB)
// Essential initialization, module loader, and XSWD connectivity
// Cache-bust: v2.1.0 - Syntax fixes applied

var c=null,s='disconnected',t={},r='',h=[],l=false,isLoadingBlocks=false,isLoadingTransactions=false;
var m={'xswd-core':null,'tela-privacy':null,'blocks-core':null,'blocks-list':null,'blocks-details':null,'blocks-extras':null,'transactions':null,'network-core':null,'network-ui':null,'network-analytics':null,'search':null,'dashboard':null,'explorer':null,'explorer-blocks':null,'explorer-transactions':null,'explorer-render':null,'network-mining':null,'smartcontracts':null,'router':null};

async function gx(m,p){if(!c)throw new Error('XSWD not initialized');return await c.call(m,p)}
function cl(n){n?m[n]=null:Object.keys(m).forEach(function(k){m[k]=null})}

async function forceReloadPrivacy(){m['tela-privacy']=null;var p=await lm('tela-privacy');if(p){p.init();window.TelaPrivacy=p}}

async function lm(n){if(m[n]&&n!=='tela-privacy')return m[n];var ext=(['network-mining','network-core','network-ui','network-analytics','explorer','explorer-blocks','explorer-transactions','explorer-render','main-core','main-utils','router','router-utils','search','tela-privacy','dashboard-core','telex'].includes(n))?'.js':'.min.js';try{var p=await fetch(n+ext+'?v='+Date.now()+'&cb='+Math.random());if(!p.ok)throw new Error('HTTP '+p.status);var d=await p.text();if(ext==='.js'){var o;if(n==='router'||n==='router-utils'||n==='search'||n==='tela-privacy'||n==='dashboard-core'||n==='telex'||n==='network-core'||n==='network-ui'||n==='network-analytics'){o=new Function('return '+d)()}else{eval(d);if(n==='explorer'){o={loadNetwork:window.loadNetwork,loadBlocks:window.loadBlocks,loadBlock:window.loadBlock,loadTransactions:window.loadTransactions,loadTransaction:window.loadTransaction,renderTransactionExplorer:window.renderTransactionExplorer,getPoolData:window.getPoolData,getRecentBlocks:window.getRecentBlocks}}else if(n==='explorer-blocks'){o=window.explorerBlocks||{loadBlocks:window.loadBlocks,loadBlock:window.loadBlock}}else if(n==='explorer-transactions'){o=window.explorerTransactions||{loadTransactions:window.loadTransactions,loadTransaction:window.loadTransaction,getPoolData:window.getPoolData,getRecentBlocks:window.getRecentBlocks}}else if(n==='explorer-render'){o=window.explorerRender||{renderTransactionExplorer:window.renderTransactionExplorer,formatTxHash:window.formatTxHash,getTimeAgo:window.getTimeAgo}}else{o={loadNetwork:window.loadNetwork,loadBlocks:window.loadBlocks,loadBlock:window.loadBlock,loadTransactions:window.loadTransactions,loadTransaction:window.loadTransaction}}}m[n]=o;return o}else{var o=new Function('return '+d)();m[n]=o;return o}}catch(e){return null}}

function ah(o){if(h[h.length-1]!==o){h.push(o);if(h.length>10)h.shift()}}
function gb(){if(h.length>1){h.pop();var p=h[h.length-1];p?window.location.hash=p:lh()}else lh()}

window.setCurrentRoute=function(route){r=route};
window.connectionStatus=s;
window.addToHistory=ah;

async function it(d){d=d||false;updateAllStatusIndicators('connecting');try{c=await lm('xswd-core');window.xswdCore=c;window.xswd=c;if(!c)throw new Error('Failed to load XSWD core');m['tela-privacy']=null;var p=await lm('tela-privacy');if(p){p.init();window.TelaPrivacy=p}var routerUtils=await lm('router-utils');var router=await lm('router');if(router)window.router=router;var n=await c.initialize(d);if(n){s='connected';window.connectionStatus='connected';updateAllStatusIndicators('connected')}else{s='disconnected';window.connectionStatus='disconnected';updateAllStatusIndicators('disconnected')}if(window.router)window.router.hr();pc()}catch(err){s='disconnected';window.connectionStatus='disconnected';updateAllStatusIndicators('disconnected')}}

async function pc(){setTimeout(async()=>{try{if(s==='connected'){const coreModules=['search','blocks-core','dashboard-core'];await Promise.all(coreModules.map(m=>lm(m)));setTimeout(async()=>{const secondaryModules=['explorer-render','network-core','smartcontracts'];await Promise.all(secondaryModules.map(m=>lm(m)));if(window.initResponsiveHashes)window.initResponsiveHashes()},1000)}}catch(e){}},500)}

async function lh(){if(l)return;l=true;r='home';window.location.hash='';if(window.router)window.router.updateActiveNav('loadHome');var o=document.getElementById('main-content');o.innerHTML='<div class="loading-progress">Loading Dashboard...<div class="progress-bar"></div></div>';if(!c||!c.isConnected){o.innerHTML='<div class="enhanced-card"><h3>TELA connection required</h3></div>';l=false;return}try{var u=await lm('search');var i=await c.getNetworkInfo();if(!i){o.innerHTML=await rd(u);l=false;return}t=i;window.stats=t;o.innerHTML=await rd(i,u);if(u){window.TelaSearch=u;window.searchModule=u}setTimeout(async function(){try{if(window.lbe)await window.lbe();var d=await lm('dashboard-core');if(d){window.dashboardLive=d;await d.loadDashboardModules();await d.updateNetworkOverview();setTimeout(()=>{if(d.startLiveMonitoring&&c&&c.isConnected){d.startLiveMonitoring()};if(window.initResponsiveHashes)window.initResponsiveHashes()},3000)}}catch(e){}},2000)}catch(e){var f=e&&e.message&&e.message.includes('Timeout');o.innerHTML=f?await rt(u,e):await rd(u)}finally{l=false}}

async function rd(i,u){var g=await lm('dashboard-core');return g?g.renderDashboard(c&&c.call?c.call.bind(c):null):'<div class="enhanced-card"><h3>Dashboard Loading Error</h3></div>'}
async function rt(u,e){var g=await lm('dashboard-core');return g?g.renderDashboard(c&&c.call?c.call.bind(c):null):'<div class="enhanced-card"><h3>Dashboard Loading Error</h3></div>'}

function nm(o){if(window.router){switch(o){case'blocks':window.router.lbs();break;case'smartcontracts':window.router.lscs();break;case'network':window.router.ln();break}}}

function rf(){s==='connected'?window.router.hr():it()}

function updateAllStatusIndicators(status){var nodeDot=document.querySelector('#connection-status .status-dot');var privacyDot=document.querySelector('#privacy-status .status-dot');if(nodeDot){nodeDot.className='status-dot';if(status==='connected')nodeDot.classList.add('dot-green');else if(status==='connecting')nodeDot.classList.add('dot-yellow');else nodeDot.classList.add('dot-red')}if(privacyDot){privacyDot.className='status-dot';if(status==='connected')privacyDot.classList.add('dot-green');else if(status==='connecting')privacyDot.classList.add('dot-yellow');else privacyDot.classList.add('dot-red')}if(window.TelaPrivacy){var privacyStatus=status==='connected'?'secure':status==='connecting'?'connecting':'insecure';window.TelaPrivacy.updatePrivacyStatus(privacyStatus)}}

// Core window exports
window.loadHome=lh;
window.goBack=gb;
window.refresh=rf;
window.navigateToModule=nm;
window.initializeTELA=it;
window.reconnectXSWD=async function(){try{updateAllStatusIndicators('connecting');window.xswd=null;window.gx=null;await it(true);setTimeout(()=>{window.location.reload(true)},1000);return true}catch(e){updateAllStatusIndicators('disconnected');setTimeout(()=>{window.location.reload(true)},2000);return false}};
window.loadModule=lm;
window.xswdCore=c;
window.xswd=c;
window.gx=gx;
window.forceReloadPrivacy=forceReloadPrivacy;
window.updateAllStatusIndicators=updateAllStatusIndicators;

// Privacy handled by tela-privacy.js + telex.js system
window.togglePrivacyModule=function(){if(window.TelaPrivacy&&window.TelaPrivacy.togglePrivacyStatus){window.TelaPrivacy.togglePrivacyStatus()}};

// Basic active nav function available immediately
window.setActiveNavImmediate=function(btn,page){var btns=document.querySelectorAll('.nav-btn');btns.forEach(function(b){b.classList.remove('active');b.style.removeProperty('background');b.style.removeProperty('color');b.style.removeProperty('border-color')});var pageMap={'blocks':'blocks','transactions':'transactions','pool':'pool','smartcontracts':'contracts','network':'network'};var dataPage=pageMap[page];var target=btn||document.querySelector('.nav-btn[data-page="'+dataPage+'"]');if(target){target.classList.add('active');target.style.setProperty('background','rgba(185,89,182,0.15)','important');target.style.setProperty('color','white','important');target.style.setProperty('border-color','#b959b6','important')}};

// Simple navigation functions that work immediately
window.navToBlocks=function(btn){window.setActiveNavImmediate(btn,'blocks');if(window.forceBlocks)window.forceBlocks();else if(window.router)window.router.lbs()};
window.navToTransactions=function(btn){window.setActiveNavImmediate(btn,'transactions');if(window.forceTransactions)window.forceTransactions();else if(window.router)window.router.lts()};
window.navToPool=function(btn){window.setActiveNavImmediate(btn,'pool');window.location.hash='pool'};
window.navToContracts=function(btn){window.setActiveNavImmediate(btn,'smartcontracts');if(window.loadSmartContracts)window.loadSmartContracts();else if(window.router)window.router.lscs()};
window.navToNetwork=function(btn){window.setActiveNavImmediate(btn,'network');if(window.loadNetwork)window.loadNetwork();else if(window.router)window.router.ln()};

// Legacy functions for compatibility
window.loadBlocks=async function(){if(isLoadingBlocks)return;isLoadingBlocks=true;try{if(window.router)await window.router.lbs()}finally{isLoadingBlocks=false}};
window.loadTransactions=function(){if(window.router)return window.router.lts()};
window.loadNetwork=function(){if(window.router)return window.router.ln()};
window.loadSmartContracts=function(){if(window.router)return window.router.lscs()};
window.navigateToBlock=function(h){if(window.router)window.router.navigateToBlock(h)};
window.loadBlocksIncremental=function(){if(window.router)window.router.loadBlocksIncremental()};
window.updateActiveNav=function(page){if(window.router)window.router.updateActiveNav(page)};
window.loadSC=function(scid){if(window.router)window.router.lsc(scid)};

// Initialize TELA system on DOM ready  
document.addEventListener('DOMContentLoaded',function(){
    it();
    
    // Set initial active nav state based on current hash
    setTimeout(() => {
        const hash = window.location.hash.slice(1);
        const route = hash.split('/')[0] || 'home';
        
        // Only set active state for non-home routes
        if (route && route !== 'home' && route !== '') {
            // Wait for router-utils to be loaded
            const waitForNavFunction = setInterval(() => {
                if (window.updateActiveNav) {
                    window.updateActiveNav(route);
                    clearInterval(waitForNavFunction);
                }
            }, 100);
            
            // Clear interval after 3 seconds if function never loads
            setTimeout(() => clearInterval(waitForNavFunction), 3000);
        }
    }, 500);
});

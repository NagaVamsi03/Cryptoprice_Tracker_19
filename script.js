// Mock data fallback
const MOCK_DATA = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceUsd: '45230.50', changePercent24Hr: '2.45', marketCapUsd: '885000000000', volumeUsd24Hr: '28500000000' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceUsd: '2890.75', changePercent24Hr: '-1.23', marketCapUsd: '347000000000', volumeUsd24Hr: '15200000000' },
    { id: 'binance-coin', name: 'BNB', symbol: 'BNB', priceUsd: '312.40', changePercent24Hr: '3.67', marketCapUsd: '48000000000', volumeUsd24Hr: '1200000000' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', priceUsd: '98.25', changePercent24Hr: '5.12', marketCapUsd: '42000000000', volumeUsd24Hr: '2100000000' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP', priceUsd: '0.5234', changePercent24Hr: '-0.89', marketCapUsd: '28000000000', volumeUsd24Hr: '1500000000' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', priceUsd: '0.4567', changePercent24Hr: '1.78', marketCapUsd: '16000000000', volumeUsd24Hr: '450000000' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', priceUsd: '0.0823', changePercent24Hr: '4.23', marketCapUsd: '11500000000', volumeUsd24Hr: '680000000' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', priceUsd: '6.78', changePercent24Hr: '-2.15', marketCapUsd: '9200000000', volumeUsd24Hr: '320000000' }
];

const API_URL = 'https://api.coincap.io/v2/assets';
const REFRESH_INTERVAL = 60000;

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const cryptoGridEl = document.getElementById('cryptoGrid');
const lastUpdateEl = document.getElementById('lastUpdate');
const retryBtn = document.getElementById('retryBtn');
const searchInput = document.getElementById('searchInput');

let intervalId = null;
let allCryptoData = [];

async function fetchCryptoData() {
    try {
        const response = await fetch(`${API_URL}?limit=10`);
        if (!response.ok) throw new Error('API failed');
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.log('Using mock data due to API error');
        return MOCK_DATA;
    }
}

function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

function formatLargeNumber(num) {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${formatNumber(num, 0)}`;
}

function updateTimestamp() {
    lastUpdateEl.textContent = new Date().toLocaleTimeString();
}

function createCryptoCard(crypto) {
    const priceChange = parseFloat(crypto.changePercent24Hr) || 0;
    const isPositive = priceChange >= 0;
    const arrow = isPositive ? '▲' : '▼';
    const price = parseFloat(crypto.priceUsd);
    const marketCap = parseFloat(crypto.marketCapUsd);
    const volume = parseFloat(crypto.volumeUsd24Hr);
    
    return `
        <div class="crypto-card">
            <div class="crypto-header">
                <div class="crypto-icon">${crypto.symbol.charAt(0)}</div>
                <div class="crypto-info">
                    <h2>${crypto.name}</h2>
                    <span class="crypto-symbol">${crypto.symbol}</span>
                </div>
            </div>
            
            <div class="crypto-price" data-id="${crypto.id}">
                $${formatNumber(price)}
            </div>
            
            <div class="crypto-change ${isPositive ? 'positive' : 'negative'}">
                ${arrow} ${Math.abs(priceChange).toFixed(2)}%
            </div>
            
            <div class="crypto-details">
                <div class="detail-row">
                    <span class="detail-label">Market Cap</span>
                    <span class="detail-value">${formatLargeNumber(marketCap)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">24h Volume</span>
                    <span class="detail-value">${formatLargeNumber(volume)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderCryptoData(data) {
    allCryptoData = data;
    cryptoGridEl.innerHTML = data.map(crypto => createCryptoCard(crypto)).join('');
    
    data.forEach(crypto => {
        const priceEl = document.querySelector(`[data-id="${crypto.id}"]`);
        if (priceEl) {
            priceEl.classList.add('price-update');
            setTimeout(() => priceEl.classList.remove('price-update'), 500);
        }
    });
}

function filterCrypto(searchTerm) {
    const filtered = allCryptoData.filter(crypto => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    cryptoGridEl.innerHTML = filtered.map(crypto => createCryptoCard(crypto)).join('');
}

function showLoading() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    cryptoGridEl.classList.add('hidden');
}

function showData() {
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    cryptoGridEl.classList.remove('hidden');
}

async function loadCryptoData() {
    try {
        if (cryptoGridEl.children.length === 0) showLoading();
        
        const data = await fetchCryptoData();
        renderCryptoData(data);
        updateTimestamp();
        showData();
    } catch (error) {
        console.error('Error:', error);
    }
}

function startPolling() {
    loadCryptoData();
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(loadCryptoData, REFRESH_INTERVAL);
}

retryBtn.addEventListener('click', startPolling);
searchInput.addEventListener('input', (e) => filterCrypto(e.target.value));

startPolling();

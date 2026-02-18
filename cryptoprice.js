const cryptoData = [
  { name: "Bitcoin", symbol: "BTC", price: 65000, change: 2.4 },
  { name: "Ethereum", symbol: "ETH", price: 3200, change: -1.2 },
  { name: "Solana", symbol: "SOL", price: 150, change: 3.1 },
  { name: "Cardano", symbol: "ADA", price: 0.55, change: -0.5 }
];

const tableBody = document.getElementById("cryptoTable");
const searchInput = document.getElementById("searchInput");

function displayData(data) {
  tableBody.innerHTML = "";
  data.forEach(coin => {
    const row = `
      <tr>
        <td>${coin.name}</td>
        <td>${coin.symbol}</td>
        <td>$${coin.price}</td>
        <td class="${coin.change >= 0 ? 'positive' : 'negative'}">
          ${coin.change}%
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = cryptoData.filter(coin =>
    coin.name.toLowerCase().includes(value) ||
    coin.symbol.toLowerCase().includes(value)
  );
  displayData(filtered);
});

displayData(cryptoData);

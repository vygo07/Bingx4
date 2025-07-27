let apiKey = localStorage.getItem('bingxApiKey');

document.addEventListener("DOMContentLoaded", () => {
  if (apiKey) {
    fetchAndDisplay();
    setInterval(fetchAndDisplay, 60000); // aktualizuj každou minutu
  }
});

function saveApiKey() {
  const keyInput = document.getElementById('apiKey');
  apiKey = keyInput.value.trim();
  localStorage.setItem('bingxApiKey', apiKey);
  fetchAndDisplay();
}

async function fetchAndDisplay() {
  try {
    // Simulace dat místo reálného volání API:
    const response = await fetch("https://raw.githubusercontent.com/openai/translations/main/examples/finance/dailyPnL.json");
    const data = await response.json(); // Očekáváme [{ date: "...", profit: ..., fee: ... }]

    const last10 = data.slice(-10).reverse();
    const tbody = document.querySelector('#profitTable tbody');
    tbody.innerHTML = '';
    let monthlyProfit = 0;
    let feeSum = 0;
    let wins = 0;

    const chartData = {
      labels: [],
      profits: []
    };

    last10.forEach(entry => {
      const tr = document.createElement('tr');
      tr.className = entry.profit >= 0 ? 'profit' : 'loss';

      tr.innerHTML = `<td>${entry.date}</td><td>${entry.profit.toFixed(2)} USDT</td>`;
      tbody.appendChild(tr);

      chartData.labels.push(entry.date);
      chartData.profits.push(entry.profit);

      monthlyProfit += entry.profit;
      feeSum += entry.fee;
      if (entry.profit > 0) wins++;
    });

    const avg7 = chartData.profits.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
    const estProfit = avg7 * 30;
    const winrate = (wins / last10.length) * 100;

    document.getElementById('monthlyProfit').textContent = monthlyProfit.toFixed(2) + ' USDT';
    document.getElementById('estimatedProfit').textContent = estProfit.toFixed(2) + ' USDT';
    document.getElementById('winrate').textContent = winrate.toFixed(1) + '%';
    document.getElementById('fees').textContent = feeSum.toFixed(2) + ' USDT';

    drawChart(chartData);
  } catch (err) {
    console.error("Chyba načítání:", err);
  }
}

let chart;
function drawChart(data) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Denní zisk',
        data: data.profits,
        borderColor: 'lime',
        backgroundColor: 'rgba(0,255,0,0.1)',
        tension: 0.2,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

/**
 * SubFlow - Lightweight SVG Chart Renderer
 * Generates clean, responsive, retina-sharp SVG charts using pure vanilla JavaScript.
 * Zero external libraries or heavy dependencies required.
 */

const Charts = {
  /**
   * Renders a sleek monthly revenue bar/trend chart
   */
  renderRevenueChart(containerId, dataPoints) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = dataPoints || [
      { label: 'May', value: 2450 },
      { label: 'Jun', value: 3100 },
      { label: 'Jul', value: 2850 },
      { label: 'Aug', value: 4200 },
      { label: 'Sep', value: 4950 },
      { label: 'Oct', value: 5800 }
    ];

    const width = 640;
    const height = 240;
    const padding = { top: 25, right: 25, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.value), 6000);
    const stepY = maxVal / 4;

    let gridLinesSvg = '';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (i * (chartH / 4));
      const val = Math.round(i * stepY);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3,3" />
        <text x="${padding.left - 12}" y="${y + 4}" font-size="11" fill="currentColor" opacity="0.6" text-anchor="end">$${val}</text>
      `;
    }

    const barWidth = Math.min(38, (chartW / data.length) * 0.55);
    const gap = chartW / data.length;

    let barsSvg = '';
    let linePoints = [];

    data.forEach((d, idx) => {
      const barH = (d.value / maxVal) * chartH;
      const x = padding.left + (idx * gap) + (gap / 2) - (barWidth / 2);
      const y = padding.top + chartH - barH;
      const centerX = x + barWidth / 2;

      linePoints.push(`${centerX},${y}`);

      barsSvg += `
        <g class="chart-bar-group" data-label="${d.label}" data-val="${d.value}">
          <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="6" fill="url(#purpleGradient)">
            <title>${d.label}: $${d.value.toLocaleString()}</title>
          </rect>
          <text x="${centerX}" y="${height - 15}" font-size="12" font-weight="500" fill="currentColor" opacity="0.75" text-anchor="middle">${d.label}</text>
          <text class="bar-value-label" x="${centerX}" y="${y - 8}" font-size="11" font-weight="600" fill="#7C3AED" text-anchor="middle">$${(d.value / 1000).toFixed(1)}k</text>
        </g>
      `;
    });

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" class="subflow-svg-chart" style="width: 100%; height: 100%; max-height: 250px;">
        <defs>
          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#A78BFA" stop-opacity="0.75" />
          </linearGradient>
        </defs>
        ${gridLinesSvg}
        ${barsSvg}
      </svg>
    `;

    container.innerHTML = svg;
  },

  /**
   * Renders a circular status distribution donut chart
   */
  renderSubscriptionDonut(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = stats || [
      { label: 'Active', count: 12, color: '#10B981' },
      { label: 'Confirmed', count: 4, color: '#6366F1' },
      { label: 'Draft', count: 2, color: '#F59E0B' },
      { label: 'Closed', count: 3, color: '#94A3B8' }
    ];

    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    let circlesSvg = '';
    data.forEach(item => {
      const strokeDashoffset = circumference - (item.count / total) * circumference;
      const rotation = (accumulatedAngle / total) * 360 - 90;
      accumulatedAngle += item.count;

      circlesSvg += `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
          fill="none" 
          stroke="${item.color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(${rotation} ${size / 2} ${size / 2})"
          stroke-linecap="round"
          style="transition: stroke-dashoffset 0.8s ease;"
        >
          <title>${item.label}: ${item.count} (${Math.round((item.count / total) * 100)}%)</title>
        </circle>
      `;
    });

    let legendHtml = `
      <div class="donut-legend-grid">
        ${data.map(item => `
          <div class="donut-legend-item">
            <span class="legend-color-dot" style="background-color: ${item.color};"></span>
            <span class="legend-label">${item.label}</span>
            <span class="legend-val font-semibold">${item.count}</span>
          </div>
        `).join('')}
      </div>
    `;

    const svg = `
      <div class="donut-chart-wrapper">
        <div class="donut-svg-container" style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="${strokeWidth}" />
            ${circlesSvg}
          </svg>
          <div class="donut-center-metric" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 26px; font-weight: 700; line-height: 1;">${total}</span>
            <span style="font-size: 11px; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.5px;">Plans</span>
          </div>
        </div>
        ${legendHtml}
      </div>
    `;

    container.innerHTML = svg;
  },

  /**
   * Renders horizontal subscription plan distribution
   */
  renderPlanDistribution(containerId, planData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = planData || [
      { name: 'Business Pro Suite', count: 18, share: 45, color: '#7C3AED' },
      { name: 'Developer Starter', count: 12, share: 30, color: '#6366F1' },
      { name: 'Enterprise Annual Cloud', count: 6, share: 15, color: '#EC4899' },
      { name: 'Security Shield Weekly', count: 4, share: 10, color: '#10B981' }
    ];

    let barsHtml = data.map(item => `
      <div class="plan-dist-row" style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span class="font-medium">${item.name}</span>
          <span style="opacity: 0.75;">${item.count} subs (${item.share}%)</span>
        </div>
        <div style="height: 10px; background-color: rgba(124, 58, 237, 0.1); border-radius: 999px; overflow: hidden;">
          <div style="height: 100%; width: ${item.share}%; background-color: ${item.color}; border-radius: 999px; transition: width 0.6s ease;"></div>
        </div>
      </div>
    `).join('');

    container.innerHTML = barsHtml;
  }
};

if (typeof window !== 'undefined') {
  window.Charts = Charts;
}

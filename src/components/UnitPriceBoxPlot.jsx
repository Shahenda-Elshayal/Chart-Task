import { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { aggregatePriceByUnitModel } from "../utils/dataProcessor";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Custom plugin to draw boxes and lines
const createBoxPlotPlugin = (aggregated) => ({
  id: 'customBoxPlot',
  afterDraw: function (chart) {
    const ctx = chart.ctx;
    const yScale = chart.scales.y;
    const xScale = chart.scales.x;

    if (!aggregated || aggregated.length === 0) return;

    const boxHeight = 14;
    const lineWidth = 2; // Thin line

    // Store box positions for hover detection
    if (!chart._boxPositions) {
      chart._boxPositions = [];
    } else {
      chart._boxPositions = [];
    }

    // Helper function to draw rounded rectangle box
    const drawBox = (x, y, text, bgColor, textColor, type, item, index) => {
      ctx.save();
      ctx.font = "bold 8px Arial";
      const textMetrics = ctx.measureText(text);
      const boxWidth = Math.max(textMetrics.width + 16, 20);
      const boxX = x - boxWidth / 2;
      const boxY = y - boxHeight / 2;
      const borderRadius = 2;

      // Store box position for hover detection
      chart._boxPositions.push({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        type: type, // 'max', 'avg', or 'min'
        item: item,
        index: index,
      });

      // Draw box background with rounded corners
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.moveTo(boxX + borderRadius, boxY);
      ctx.lineTo(boxX + boxWidth - borderRadius, boxY);
      ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius);
      ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius);
      ctx.quadraticCurveTo(
        boxX + boxWidth,
        boxY + boxHeight,
        boxX + boxWidth - borderRadius,
        boxY + boxHeight
      );
      ctx.lineTo(boxX + borderRadius, boxY + boxHeight);
      ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius);
      ctx.lineTo(boxX, boxY + borderRadius);
      ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY);
      ctx.closePath();
      ctx.fill();

      // Draw box border
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // Format number
    const formatNumber = (num) => {
      return new Intl.NumberFormat("en-US").format(num);
    };

    aggregated.forEach((item, index) => {
      const x = xScale.getPixelForValue(index);
      const yMax = yScale.getPixelForValue(item.max);
      const yAvg = yScale.getPixelForValue(item.avg);
      const yMin = yScale.getPixelForValue(item.min);

      // Draw Max box (white background, black text)
      const maxText = formatNumber(item.max);
      drawBox(x, yMax, maxText, "#FFFFFF", "#000000", "max", item, index);

      // Draw thin line from Max to Avg
      ctx.save();
      ctx.strokeStyle = "#FF9800"; // Orange line
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x, yMax + boxHeight / 2);
      ctx.lineTo(x, yAvg - boxHeight / 2);
      ctx.stroke();
      ctx.restore();

      // Draw Avg box (orange background, white text)
      const avgText = formatNumber(item.avg);
      drawBox(x, yAvg, avgText, "#FF9800", "#FFFFFF", "avg", item, index);

      // Draw thin line from Avg to Min
      ctx.save();
      ctx.strokeStyle = "#FF9800"; // Orange line
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x, yAvg + boxHeight / 2);
      ctx.lineTo(x, yMin - boxHeight / 2);
      ctx.stroke();
      ctx.restore();

      // Draw Min box (white background, black text)
      const minText = formatNumber(item.min);
      drawBox(x, yMin, minText, "#FFFFFF", "#000000", "min", item, index);
    });
  }
});

const UnitPriceBoxPlot = ({ data, onFocusClick, isFocusMode = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const aggregated = aggregatePriceByUnitModel(data);

    if (aggregated.length === 0) {
      return;
    }

    const labels = aggregated.map((item) => item.unitModel);
    
    // Create plugin with aggregated data
    const boxPlotPluginInstance = createBoxPlotPlugin(aggregated);
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Placeholder",
          data: aggregated.map((item) => item.max), // Use max for scale
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
      ],
    };

    const chartInstance = new Chart(ctx, {
      type: "bar",
      data: chartData,
      plugins: [boxPlotPluginInstance],
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false, // Disable default tooltip, we'll use custom
          },
        },
        animation: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(value);
              },
              font: {
                size: 11,
              },
            },
            title: {
              display: true,
              text: "Unit Price (Interest-Free)",
              font: {
                size: 13,
                weight: "bold",
              },
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 11,
              },
            },
            title: {
              display: true,
              text: "Unit Model",
              font: {
                size: 13,
                weight: "bold",
              },
            },
          },
        },
      },
    });

    chartInstanceRef.current = chartInstance;

    // Create tooltip element
    const tooltipContainer = chartRef.current.parentElement;
    let tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip-boxplot';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    tooltipEl.style.color = 'white';
    tooltipEl.style.padding = '8px 12px';
    tooltipEl.style.borderRadius = '4px';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.zIndex = '1000';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.transition = 'opacity 0.2s';
    tooltipEl.style.display = 'none';
    tooltipContainer.appendChild(tooltipEl);

    // Handle mouse move to show tooltip
    const handleMouseMove = (event) => {
      const canvas = chartInstance.canvas;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find which box is being hovered
      if (chartInstance._boxPositions && chartInstance._boxPositions.length > 0) {
        const hoveredBox = chartInstance._boxPositions.find(box => {
          return x >= box.x && x <= box.x + box.width &&
                 y >= box.y && y <= box.y + box.height;
        });

        if (hoveredBox) {
          canvas.style.cursor = 'pointer';
          const item = hoveredBox.item;
          const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);
          const typeLabel = hoveredBox.type === 'max' ? 'Max' : 
                          hoveredBox.type === 'avg' ? 'Avg' : 'Min';
          
          tooltipEl.innerHTML = `
            <div><strong>${item.unitModel}</strong></div>
            <div>${typeLabel}: ${formatNumber(item[hoveredBox.type])}</div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.2);">
              Min: ${formatNumber(item.min)}<br/>
              Avg: ${formatNumber(item.avg)}<br/>
              Max: ${formatNumber(item.max)}
            </div>
          `;
          
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = (x + 15) + 'px';
          tooltipEl.style.top = (y - 10) + 'px';
          tooltipEl.style.opacity = '1';
        } else {
          canvas.style.cursor = 'default';
          tooltipEl.style.opacity = '0';
          tooltipEl.style.display = 'none';
        }
      }
    };

    // Handle mouse leave to hide tooltip
    const handleMouseLeave = () => {
      tooltipEl.style.opacity = '0';
      tooltipEl.style.display = 'none';
      chartInstance.canvas.style.cursor = 'default';
    };

    chartInstance.canvas.addEventListener('mousemove', handleMouseMove);
    chartInstance.canvas.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup tooltip on unmount
    return () => {
      chartInstance.canvas.removeEventListener('mousemove', handleMouseMove);
      chartInstance.canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (tooltipEl && tooltipEl.parentNode) {
        tooltipEl.parentNode.removeChild(tooltipEl);
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, isFocusMode]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Unit Metrics Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Unit Price Range (Interest-Free)</p>
        </div>
        {!isFocusMode && onFocusClick && (
          <button
            onClick={onFocusClick}
            className="cursor-pointer rounded-full transition-colors"
            aria-label="Focus chart"
            title="Focus chart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className={`relative ${isFocusMode ? "h-full" : "h-full"} min-w-[1000px] `}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default UnitPriceBoxPlot;
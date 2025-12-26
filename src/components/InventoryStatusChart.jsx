import { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { aggregateByStatus } from "../utils/dataProcessor";

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const InventoryStatusChart = ({
  data,
  onStatusClick,
  activeStatusFilter,
  onFocusClick,
  isFocusMode = false,
}) => {
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

    const aggregated = aggregateByStatus(data);
    const statusColors = {
      Available: "#FF9800", // Orange
      "Blocked Development": "#FFC107", // Yellow
      Reserved: "#4CAF50", // Green
      Contracted: "#2196F3", // Blue
      Partner: "#00BCD4", // Light Blue
    };

    // If filter is active, show only that segment filling the entire circle
    let chartLabels,
      chartValues,
      chartBackgroundColors,
      chartBorderColors,
      chartBorderWidths;

    if (activeStatusFilter) {
      // Show only the filtered segment, filling the entire circle
      const filterIndex = aggregated.labels.indexOf(activeStatusFilter);
      if (filterIndex !== -1) {
        chartLabels = [aggregated.labels[filterIndex]];
        chartValues = [aggregated.values[filterIndex]];
        chartBackgroundColors = [statusColors[activeStatusFilter] || "#9E9E9E"];
      } else {
        // Fallback if filter not found
        chartLabels = aggregated.labels;
        chartValues = aggregated.values;
        chartBackgroundColors = aggregated.labels.map(
          (label) => statusColors[label] || "#9E9E9E"
        );
        chartBorderColors = aggregated.labels.map(() => "#FFFFFF");
        chartBorderWidths = aggregated.labels.map(() => 2);
      }
    } else {
      // Show all segments normally
      chartLabels = aggregated.labels;
      chartValues = aggregated.values;
      chartBackgroundColors = aggregated.labels.map(
        (label) => statusColors[label] || "#9E9E9E"
      );
      chartBorderColors = aggregated.labels.map(() => "#FFFFFF");
      chartBorderWidths = aggregated.labels.map(() => 2);
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartValues,
            backgroundColor: chartBackgroundColors,
            borderColor: chartBorderColors,
            borderWidth: chartBorderWidths,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                // If filtered, show 100%, otherwise calculate percentage from all data
                if (activeStatusFilter) {
                  return `${label}: ${value} units (100%)`;
                } else {
                  const total = aggregated.values.reduce((a, b) => a + b, 0);
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} units (${percentage}%)`;
                }
              },
            },
          },
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            // Use chartLabels instead of aggregated.labels to handle filtered state
            const clickedStatus = chartLabels[index];

            // Toggle filter: if clicking the same status, clear it
            if (clickedStatus === activeStatusFilter) {
              onStatusClick(null);
            } else {
              onStatusClick(clickedStatus);
            }
          }
        },
        onHover: (event, activeElements) => {
          if (activeElements.length > 0) {
            chartRef.current.style.cursor = "pointer";
          } else {
            chartRef.current.style.cursor = "default";
          }
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, activeStatusFilter, onStatusClick, isFocusMode]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Inventory Status
        </h3>
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
      <div className={`relative ${isFocusMode ? "h-64" : "h-64"}`}>
        <div className="w-full h-full mx-auto flex items-center justify-center">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatusChart;

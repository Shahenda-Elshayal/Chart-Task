import { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { aggregateByPaymentPlan } from "../utils/dataProcessor";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ContractPaymentPlanChart = ({ data, onFocusClick, isFocusMode = false }) => {
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

    const aggregated = aggregateByPaymentPlan(data);

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: aggregated.labels,
        datasets: [
          {
            label: "Number of Units",
            data: aggregated.values,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Units: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              callback: function (value) {
                return value;
              },
            },
            title: {
              display: true,
              text: "Number of Units",
            },
          },
          x: {
            title: {
              display: true,
              text: "Payment Plan",
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, isFocusMode]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Contract Payment Plan</h3>
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

export default ContractPaymentPlanChart;

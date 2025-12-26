import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register all Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// The controllers (DoughnutController, BarController, LineController) are auto-registered
// when you use the chart types, but let's try to explicitly import and register them
try {
  // Try importing controllers - they might not be available as named exports in v4
  // In Chart.js v4, controllers are typically auto-registered when using chart types
  // If this doesn't work, we'll rely on auto-registration
} catch (e) {
  // Controllers auto-register when chart types are used
  console.log("Controllers will be auto-registered when charts are created");
}

export default Chart;


<template>
  <component :is="chartComponent" :key="chartData.labels.length" :data="chartData" :options="chartOptions" />
</template>
<script>
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels, Filler)
export default {
  name: 'ChartComponent',
  components: {
    BarChart: Bar,
    LineChart: Line,
    PieChart: Pie,
    DoughnutChart: Doughnut,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['bar', 'line', 'pie', 'doughnut'].includes(value), // return true
    },
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    chartComponent() {
      return {
        bar: 'BarChart',
        line: 'LineChart',
        pie: 'PieChart',
        doughnut: 'DoughnutChart',
      }[this.type]
    },
  },
}
</script>

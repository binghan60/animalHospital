<template>
  <LineChart :key="chartData.labels.length" :data="chartData" :options="chartOptions" />
</template>
<script>
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(CategoryScale, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, ChartDataLabels, Filler)
export default {
  name: 'ChartComponent',
  components: {
    LineChart: Line,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

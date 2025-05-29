<template>
  <component :is="chartComponent" :key="chartData.labels.length" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels, Filler)

// props可以直接在templete使用，在script使用要自己接住const { type } = definePrope({...
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['bar', 'line', 'pie', 'doughnut'].includes(value),
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  },
})

const chartComponent = computed(() => {
  return {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[props.type]
})
</script>

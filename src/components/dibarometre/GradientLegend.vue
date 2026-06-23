<template>
  <div ref="container" class="gradient-legend-container">
    <svg
      :id="'gradientLegend' + _.uid"
      ref="legend"
      :width="width"
      :height="height"
    >
      <defs>
        <linearGradient :id="`grad-${_.uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            v-for="(stop, i) in stops"
            :key="i"
            :offset="`${stop}%`"
            :style="{ 'stop-color': colorScale[i], 'stop-opacity': '1' }"
          />
        </linearGradient>
      </defs>

      <rect :width="width" :height="height" :fill="`url(#grad-${_.uid})`" />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    colorScale: {
      type: Array,
      default: () => ["#eff4f7", "#5a8191"],
    },
  },
  data() {
    return {
      width: 200,
      height: 20,
    };
  },
  computed: {
    stops() {
      const step = 100 / (this.colorScale.length - 1);
      const steps = [];
      for (let i = 0; i < this.colorScale.length; i++) {
        steps.push(step * i);
      }
      return steps;
    },
  },
  mounted() {
    this.setSize();
    this.createLegend();
    window.addEventListener("resize", this.resize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resize);
  },
  methods: {
    setSize() {
      const container = this.$refs.container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        this.updateLegend();
      }
    },
    updateLegend() {},
    createLegend() {},
  },
};
</script>

<style></style>

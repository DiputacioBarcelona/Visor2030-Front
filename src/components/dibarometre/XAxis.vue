<template>
  <div ref="container">
    <svg ref="svg" class="ot-x-axis overflow-visible"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "XAxis",
  data() {
    return {
      width: 200,
      height: 20,
    };
  },
  props: {
    domain: {
      type: Array,
      default: () => [0, 100],
    },
    tickValues: {
      type: Array,
      default: null,
    },
    unit: {
      type: String,
      default: "%",
    },
    tickStroke: {
      type: String,
      default: "#DADADA",
    },
    ticks: {
      type: Number,
      default: 4,
    },
    showDomainLine: {
      type: Boolean,
      default: false,
    },
    showGrid: {
      type: Boolean,
      default: true,
    },
    moveOuterTicksInside: {
      type: Boolean,
      default: false, // move outer tick values slightly to center to avoid overflow
    },
    roundDomain: {
      type: Boolean,
      default: false,
    },
    decimals: {
      type: Number,
      default: 0,
    },
    showTicks: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.setSize();
    this.create();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.$refs.container);
    } else {
      // for IE
      window.addEventListener("resize", this.resize);
    }
  },
  beforeUnmount() {
    if (window.ResizeObserver) {
      this.resizeObserver.unobserve(this.$refs.container);
    } else {
      // for IE
      window.removeEventListener("resize", this.resize);
    }
  },
  computed: {
    scale() {
      let scale = d3.scaleLinear().domain(this.domain).range([0, this.width]);
      return this.roundDomain ? scale.nice() : scale;
    },
    xAxis() {
      return d3
        .axisBottom(this.scale)
        .ticks(this.ticks)
        .tickSize(this.showGrid ? this.height - 15 : null)
        .tickValues(this.tickValues)
        .tickFormat(
          (d) =>
            `${+Math.abs(d).toFixed(d < 1 ? 1 : this.decimals)}${this.unit}`,
        );
    },
    anchorFirstTick() {
      return this.moveOuterTicksInside ? "start" : "center";
    },
    anchorLastTick() {
      return this.moveOuterTicksInside ? "end" : "center";
    },
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
        this.update();
      }
    },
    update() {
      d3.select(this.$refs.svg).attr(
        "viewBox",
        `0 0 ${this.width} ${this.height}`,
      );

      this.axisContainer
        .call(this.xAxis)
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll("line").attr("stroke", this.tickStroke))
        .call(
          (g) =>
            g
              .attr("font-family", "inherit")
              // .selectAll(".tick:not(:first-of-type) line")
              .selectAll("line"),
          // .attr("stroke-opacity", (g) => {
          //   if (!this.showTicks) return 0;
          //   if (g === 50) return 0.3;
          //   return 0.1;
          // }),

          // .attr("stroke-dasharray", "2,2")
        )
        .call((g) => g.selectAll("text").attr("font-size", "10px"));

      // this.axisContainer.selectAll(".tick").attr("stroke-opacity", 0.5);

      if (this.showDomainLine) {
        this.axisDomain
          .attr("x1", 0)
          .attr("y1", this.height - 1)
          .attr("x2", this.width)
          .attr("y2", this.height - 1);
      }
    },
    create() {
      this.svg = d3
        .select(this.$refs.svg)
        .attr("viewBox", `0 0 ${this.width} ${this.height}`);

      this.axisContainer = this.svg.append("g");
      // .attr("transform", `translate(0,3)`);

      if (this.showDomainLine) {
        this.axisDomain = this.axisContainer.append("line");
        // .attr("stroke", this.tickStroke);
      }

      this.update();
    },
  },
  watch: {
    domain() {
      this.update();
    },
  },
};
</script>

<style>
/* hide the first tick */
/* .ot-x-axis g.tick:first-child {
  display: none;
} */

.ot-x-axis .tick:first-child text {
  text-anchor: v-bind(anchorFirstTick);
}

.ot-x-axis .tick:last-child text {
  text-anchor: v-bind(anchorLastTick);
}
</style>

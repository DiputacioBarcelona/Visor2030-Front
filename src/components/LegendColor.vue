<template>
  <div ref="container" class="ot-legend">
    <svg ref="svg" class="overflow-visible fill-current"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
// Vue implementation of:
// https://observablehq.com/@d3/color-legend

export default {
  name: "Legend",
  props: {
    color: {
      type: Function,
      default: d3.scaleSequential([0, 100], d3.interpolateViridis),
    },
    margin: {
      type: Object,
      default: () => ({ top: 0, right: 0, bottom: 16, left: 0 }),
    },
    ticks: {
      type: Number,
      default: undefined,
    },
    tickSize: {
      type: Number,
      default: 6,
    },
    tickValues: {
      type: Number,
      default: undefined,
    },
    tickFormat: {
      type: [Number, String, Function],
      default: undefined,
    },
    duration: {
      type: Number,
      default: 300,
    },
    ease: {
      type: String,
      default: "easeCubic",
    },
    n: {
      type: Number,
      default: 256,
    },
    showAxis: {
      type: Boolean,
      default: true,
    },
    height: {
      type: Number,
      default: 26,
    },
  },
  data() {
    return {
      width: 320,
      // height: 26 + this.margin.top,
    };
  },
  computed: {
    useTicks() {
      return 5; //undefined; // this.ticks || this.width / 64;
    },
  },
  watch: {
    color() {
      this.draw();
    },
  },
  mounted() {
    this.setSize();
    this.createChart();
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
  methods: {
    setSize() {
      const container = this.$refs.container;
      if (container) {
        this.width = container.clientWidth;
        // this.height = container.clientHeight;
      }
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        if (this.svg) this.draw();
      }
    },
    draw() {
      const that = this;

      let tickAdjust = (g) =>
        g
          .selectAll(".tick line")
          .attr("y1", this.margin.top + this.margin.bottom - this.height);
      let x;
      let useTickValues;
      let useTickFormat;

      // Continuous
      if (this.color.interpolate) {
        const n = Math.min(
          this.color.domain().length,
          this.color.range().length,
        );

        x = this.color
          .copy()
          .rangeRound(
            d3.quantize(
              d3.interpolate(this.margin.left, this.width - this.margin.right),
              n,
            ),
          )
          .nice();

        this.image
          .attr("x", this.margin.left)
          .attr("y", this.margin.top)
          .attr("width", this.width - this.margin.left - this.margin.right)
          .attr("height", this.height - this.margin.top - this.margin.bottom)
          .attr("preserveAspectRatio", "none")
          .attr(
            "xlink:href",
            this.ramp(
              this.color.copy().domain(d3.quantize(d3.interpolate(0, 1), n)),
              this.n,
            ).toDataURL(),
          );

        useTickValues = this.tickValues;
        useTickFormat = this.tickFormat;
      }
      // Sequential
      else if (this.color.interpolator) {
        x = Object.assign(
          this.color
            .copy()
            .interpolator(
              d3.interpolateRound(
                this.margin.left,
                this.width - this.margin.right,
              ),
            ),
          {
            range() {
              return [that.margin.left, that.width - that.margin.right];
            },
          },
        );

        this.image
          .attr("x", this.margin.left)
          .attr("y", this.margin.top)
          .attr("width", this.width - this.margin.left - this.margin.right)
          .attr("height", this.height - this.margin.top - this.margin.bottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", this.ramp(this.color.interpolator()).toDataURL());

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
          if (this.tickValues === undefined) {
            const n = Math.round(this.useTicks + 1);
            useTickValues = d3
              .range(n)
              .map((i) => d3.quantile(this.color.domain(), i / (n - 1)));
          }
          // I don't know what this is doing
          // if (typeof this.tickFormat !== "function") {
          //   useTickFormat = d3.format(
          //     this.tickFormat === undefined ? ",f" : this.tickFormat
          //   );
          // }
        }

        useTickFormat = this.tickFormat;
      }
      // Threshold
      else if (this.color.invertExtent) {
        // console.log("threshold");
        const thresholds = this.color.thresholds
          ? this.color.thresholds() // scaleQuantize
          : this.color.quantiles
            ? this.color.quantiles() // scaleQuantile
            : this.color.domain(); // scaleThreshold

        const domain = this.color.domain();

        // console.log(thresholds, domain);

        // we want to use thresholds.length + 2 ticks,starting at 0 and last is domain[1], equality distributed
        // for example if domain[1] is 8, ticks should be [0, 2, 4, 6, 8]
        // const step = (domain[1] - 0) / (thresholds.length + 1);
        // const step = domain[1] - domain[0];
        // console.log({ thresholds, domain, step });
        // useTickValues = d3.range(
        //   domain[0] - step,
        //   domain[domain.length - 1] + step,
        //   step,
        // );

        const portions = 5;
        const step = (domain[domain.length - 1] - domain[0]) / portions;

        useTickValues = d3.range(
          domain[0],
          domain[domain.length - 1] + step,
          step,
        );

        x = d3
          .scaleLinear()
          .domain([domain[0], domain[domain.length - 1]])
          .rangeRound([this.margin.left, this.width - this.margin.right]);

        // console.log("here", useTickValues);

        const that = this;

        this.rects
          .selectAll("rect")
          .data(useTickValues.slice(0, -1))
          .join("rect")
          .attr("x", (d, i) => x(d))
          .attr("y", this.margin.top)
          .attr("width", (d, i) => x(d + step) - x(d))
          .attr("height", this.height - this.margin.top - this.margin.bottom)
          .attr("fill", (d, i) => {
            // console.log(i, that.color.range()[i]);
            return that.color.range()[i];
          });

        x.useTickFormat = this.tickFormat;
      }

      // Ordinal
      else {
        console.log("ordinal");
        x = d3
          .scaleBand()
          .domain(this.color.domain())
          .rangeRound([this.margin.left, this.width - this.margin.right]);

        svg
          .append("g")
          .selectAll("rect")
          .data(this.color.domain())
          .join("rect")
          .attr("x", x)
          .attr("y", this.margin.top)
          .attr("width", Math.max(0, x.bandwidth() - 1))
          .attr("height", this.height - this.margin.top - this.margin.bottom)
          .attr("fill", this.color);

        tickAdjust = () => {};
      }

      //germi only integers
      // useTickValues = x.ticks().filter((tick) => Number.isInteger(tick));

      // console.log({ useTickValues });
      // axis
      if (this.showAxis) {
        this.axisContainer
          .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
          .transition()
          .duration(this.duration)
          .ease(d3[this.ease])
          .call(
            d3
              .axisBottom(x)
              .ticks(
                3,
                typeof useTickFormat === "string" ? useTickFormat : undefined,
              )
              .tickFormat(
                typeof useTickFormat === "function" ? useTickFormat : undefined,
              )
              .tickSize(this.tickSize)
              .tickValues(useTickValues),
          )
          .call(tickAdjust);
      }
    },
    ramp(color, n = 256) {
      const colors = [];

      for (let i = 0; i < n; ++i) {
        colors.push(d3.rgb(color(i / (n - 1))).hex());
      }

      // console.log(colors);

      const canvas = document.createElement("canvas");
      canvas.width = n;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
      }
      return canvas;
    },
    createChart() {
      if (!this.svg) {
        this.svg = d3
          .select(this.$refs.svg)
          .attr("width", this.width)
          .attr("height", this.height)
          .attr("viewBox", [0, 0, this.width, this.height])
          .style("overflow", "visible")
          .style("display", "block");

        this.image = this.svg.append("image");
        this.rects = this.svg.append("g");

        this.axisContainer = this.svg
          .append("g")
          .attr("class", "ot-legend-axis");
      }

      this.draw();
    },
  },
};
</script>
<style>
.ot-legend-axis .domain {
  display: none;
}
</style>

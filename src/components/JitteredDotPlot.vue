<template>
  <div ref="container" class="dot-plot-container">
    <svg ref="svg" class="overflow-visible fill-current text-gray-500"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "JitteredDotPlot",
  props: {
    data: {
      type: Array,
      default: () => [
        {
          id: "1-1",
          name: "Data 1",
          value: 10,
          x: 1,
          y: 1,
        },
        {
          id: "2-1",
          name: "Data 2",
          value: 20,
          x: 2,
          y: 1,
        },
      ],
    },
    color: {
      type: Object,
      default: () => ({ val1: "#eee", val2: "#ccc" }), // color for each segment
    },
    margin: {
      type: Object,
      default: () => ({ top: 0, right: 0, bottom: 20, left: 0 }),
    },
    max: {
      type: Number,
      default: null, // set fixed max value for y axis
    },
    duration: {
      type: Number,
      default: 300, // time of animation in ms
    },
    ease: {
      type: String,
      default: "easeCubic", // easing used for animation
    },
    refLine: {
      type: Number,
      default: null, // show ref line, e.g. average or median value
    },
    refLineText: {
      type: String,
      default: "", // label on ref line
    },
    showXAxis: {
      type: Boolean,
      default: true,
    },
    showYAxis: {
      type: Boolean,
      default: true,
    },
    yTickValues: {
      type: Array,
      default: null, // values to show on y axis
    },
    xTickValues: {
      type: Array,
      default: null, // values to show on x axis
    },
    paddingInner: {
      type: Number,
      default: 0.1, // padding between bars
    },
    paddingOuter: {
      type: Number,
      default: 0.1, // padding on the sides
    },
    bgColor: {
      type: String,
      default: null, // color for backgrounds of columns
    },
    format: {
      type: Function,
      default: (d) => d, // formatter for y axis values
    },
    xAccessor: {
      type: Function,
      default: (d) => d.x,
    },
    yAccessor: {
      type: Function,
      default: (d) => d.y,
    },
    radius: {
      type: Number,
      default: 2.5,
    },
    numBins: {
      type: Number,
      default: 50,
    },
    minRandomness: {
      type: Number,
      default: 0,
    },
    highlighted: {
      type: [String, Array],
      default: () => [],
    },
    opacityForNonHighlighted: {
      type: Number,
      default: 0.1,
    },
    opacityForHighlighted: {
      type: Number,
      default: 0.9,
    },
    defaultOpacity: {
      type: Number,
      default: 0.6,
    },
    colorForNonHighlighted: {
      type: String,
      default: "#ccc",
    },
  },
  data() {
    return {
      width: 500,
      height: 600,
    };
  },
  computed: {
    // max value of y axis
    computedMax() {
      return 100;
      if (this.max) return this.max;
    },
    x() {
      return d3
        .scaleBand()
        .domain(this.data.map(this.xAccessor).sort((a, b) => a - b))
        .range([this.margin.left, this.width - this.margin.right])
        .paddingInner(this.paddingInner)
        .paddingOuter(this.paddingOuter);
    },
    xBg() {
      return d3
        .scaleBand()
        .domain(this.data.map(this.xAccessor))
        .range([this.margin.left, this.width - this.margin.right])
        .padding(0);
    },
    y() {
      return d3
        .scaleLinear()
        .domain([0, this.computedMax])
        .nice()
        .range([this.height - this.margin.bottom, this.margin.top]);
    },
    jitteredData() {
      // randomize the data horizontally, but we want o center it as much as we can. we well divide the data set in bins, sized vertically 2x the radius of the circles. for every bin, let's see how many elements we have in it. if we have 1, the random "scale" wil be 0. let's calculate how many points would fit horizontally in the bin. if the amount of points that would fit is smaller than the amount of points in the bin, then the random factor will be maximum (0.8). if the amount is more than 1 but less than the max, then the random factor will be linearly distributed between the min random factor (0) and the max random factor (0.8).

      // we will calculate the random factor for each bin, and then we will calculate the random factor for each point in the bin. we will sort the points by the random factor, and then we will calculate the x position of the point as the position of the bin plus the random factor times the width of the bin.

      // we will calculate the random factor for each bin
      const radius = this.radius;
      // const numBins =
      //   (this.height - this.margin.top - this.margin.bottom) /
      //   (this.numBinsFactor * 2 * radius);
      const numBins = this.numBins;

      const binWidth = this.x.bandwidth();

      const maxPoints = Math.floor(binWidth / (2 * radius));

      const groups = d3.rollup(
        this.data,
        (v) => {
          const bins = d3
            .bin()
            .value((d) => d.value)
            .thresholds(numBins)(v);

          const municipis = {};

          bins.forEach((bin) => {
            let factor = this.minRandomness;
            // if there are more than maxPoints in the bin, then the random factor will be 0.8
            if (bin.length > maxPoints) factor = 0.8;
            // if there are less than 2 points in the bin, then the random factor will be 0
            else if (bin.length < 2) factor = this.minRandomness;
            // if there are between 2 and maxPoints, then the random factor will be bin.length linearly distributed between this.minRandomness and 0.8
            else {
              factor =
                this.minRandomness +
                ((0.8 - this.minRandomness) * (bin.length - 1)) /
                  (maxPoints - 1);
            }

            // console.log(factor);

            bin.forEach((d) => {
              municipis[d.municipality_code_6] = factor;
            });

            return bin;
          });
          return municipis;
        },
        this.xAccessor,
      );

      //   console.log(groups);

      // a threshold scale to know each point which bin it belongs to. data goes from 0 to 100, range goes from 0 to numBins
      //   const yScale = d3.scaleLinear().domain([0, 100]).range([0, numBins]);

      return this.data.map((d) => {
        // const binIndex = Math.floor(yScale(d.value));
        // const bin = groups.get(this.xAccessor(d))[binIndex];
        // const randomFactor = bin?.factor || 0;

        const randomFactor = groups.get(this.xAccessor(d))[
          d.municipality_code_6
        ];

        // console.log(numBins, binIndex, bin.points, randomFactor);

        const cx =
          this.x(this.xAccessor(d)) +
          this.x.bandwidth() / 2 +
          (Math.random() - 0.5) * this.x.bandwidth() * randomFactor;

        return {
          ...d,
          cx,
          cy: this.y(d.value),
          //   binIndex,
          //   points: bin?.points,
        };
      });
    },
  },
  watch: {
    data() {
      this.draw();
    },
    numBins() {
      this.draw();
    },
    minRandomness() {
      this.draw();
    },
    highlighted(newVal) {
      // if (newVal) {
      //   // draw ref lines from highlighted circle
      //   this.drawHoverRefLines(newVal);

      //   this.raisePoints();
      // } else {
      //   // reset axis ticks to automatically calculated values
      //   this.xAxisGenerator.tickValues(null).tickFormat(this.xTickFormat);
      //   this.yAxisGenerator.tickValues(null).tickFormat(this.yTickFormat);
      //   this.drawAxis();
      // }

      this.raisePoints();

      // paint circles
      this.circles
        .selectAll(`circle`)
        .attr("fill", this.fill)
        // .attr("fill-opacity", this.fillOpacity)
        .attr("opacity", this.opacity);
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
        this.height = container.clientHeight;
      }
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        this.updateChart();
      }
    },
    draw(delay = this.duration, duration = this.duration) {
      //   if (this.bgColor) {
      //     // draw rects for background color
      //     this.rectsColorBg
      //       .selectAll("rect")
      //       .data(this.data, (d) => d.id) // iterate over categories/layers
      //       .join("rect")
      //       .attr("id", (d) => `bg-${d.id}`)
      //       .attr("fill", this.bgColor)
      //       .attr("x", (d) => this.x(d.id))
      //       .attr("y", () => this.y(this.y.domain()[1]))
      //       .attr("height", this.y(0))
      //       .attr("width", this.x.bandwidth());
      //   }

      // draw transparent rectangles for events
      //   this.rectsBg
      //     .selectAll("rect")
      //     .data(this.data, (d) => d.id) // iterate over categories/layers
      //     .join("rect")
      //     .attr("id", (d) => `bg-${d.id}`)
      //     .attr("fill", "transparent")
      //     .attr("x", (d) => this.xBg(d.id))
      //     .attr("y", () => this.y(this.computedMax))
      //     .attr("height", this.y(0))
      //     .attr("width", this.xBg.bandwidth())
      //     .on("click", (event, data) => {
      //       // emit the rectangle of the last dataset (the top one)
      //       const id = event.target.id;
      //       // in the form key-SOMETHING. we will replace the key for the ID of thelast dataset
      //       const [_, ...rest] = id.split("-");
      //       // hover the rectangle on top...
      //       const lastKey = this.keys[this.keys.length - 1];
      //       const lastRectId = [lastKey, ...rest].join("-");
      //       // console.log(document.getElementById(lastRectId));
      //       const target = this.rects.select("#" + lastRectId)._groups[0][0];
      //       this.$emit("select", { target, data });
      //     })
      //     .on("mouseover", (event, data) => {
      //       // emit the rectangle of the last dataset (the top one)
      //       const id = event.target.id;
      //       // in the form key-SOMETHING. we will replace the key for the ID of thelast dataset
      //       const [_, ...rest] = id.split("-");
      //       // hover the rectangle on top...
      //       const lastKey = this.keys[this.keys.length - 1];
      //       const lastRectId = [lastKey, ...rest].join("-");
      //       // console.log(document.getElementById(lastRectId));
      //       const target = this.rects.select("#" + lastRectId)._groups[0][0];
      //       this.$emit("hover", { target, data });
      //     })
      //     .on("mouseout", () => {
      //       this.$emit("hover", null);
      //     });

      const id = (d) => `${this.xAccessor(d)}-${this.yAccessor(d)}`;

      // select the first dataset
      const selection = this.circles
        .selectAll("circle")
        .data(this.jitteredData, id);

      // calculate delays
      const updating = selection;
      const exiting = selection.exit();
      const updateDelay1 = 0; //exiting.size() ? delay : 0;
      const updateDelay = updateDelay1 + updating.size() ? updateDelay1 : 0;
      const enterDelay = updateDelay + (updating.size() ? delay * 2 : delay);
      // const enterDelayAxis = updateDelay + (updating.size() ? delay : 0);
      const enterDelayAxis = updateDelay;

      this.drawAxis(enterDelayAxis, duration);

      const that = this;

      selection.join(
        (enter) =>
          enter
            .append("circle")
            .attr("id", id)
            .attr("class", (d) => `dot-${this.yAccessor(d)}`)
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .attr("fill", this.fill)
            .attr("opacity", this.opacity)
            .attr("r", 0)
            .attr("bin", (d) => d.binIndex)
            .attr("points", (d) => d.points)
            .call((enter) =>
              enter
                .transition()
                .duration(duration)
                .delay(enterDelay)
                .ease(d3[this.ease])
                .attr("r", this.radius),
            )
            .on("click", ({ target }, data) => {
              this.$emit("select", { target, data });
            })
            .on("mouseover", ({ target }, data) => {
              this.$emit("hover", { target, data });
            })
            .on("mouseout", () => {
              this.$emit("hover", null);
            }),
        (update) =>
          update
            .transition()
            .duration(duration)
            .delay(updateDelay)
            .ease(d3[this.ease])
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .attr("fill", this.fill)
            .attr("opacity", this.opacity)
            .attr("bin", (d) => d.binIndex)
            .attr("points", (d) => d.points),
        (exit) =>
          exit
            .transition()
            .duration(duration)
            .ease(d3[this.ease])
            .attr("r", 0)
            .remove(),
      );

      // refLine line
      //   if (this.refLine !== null) {
      //     this.ref
      //       .attr("display", this.refLine !== null ? null : "none")
      //       .call((g) =>
      //         g
      //           .select("line")
      //           .attr("x1", this.margin.left)
      //           .attr("x2", this.width),
      //       )
      //       .transition()
      //       .duration(duration)
      //       .delay(delay)
      //       .ease(d3[this.ease])
      //       .attr("transform", `translate(0,${this.y(this.refLine)})`);
      //   }
    },
    fill(d) {
      if (this.highlighted) {
        if (
          !this.highlighted?.includes(this.yAccessor(d)) &&
          this.colorForNonHighlighted
        )
          return this.colorForNonHighlighted;
      }
      return this.color[this.xAccessor(d)];
    },
    opacity(d) {
      if (this.highlighted?.includes(this.yAccessor(d)))
        return this.opacityForHighlighted;
      if (d.highlighted) return this.opacityForHighlighted;
      if (this.highlighted?.length) return this.opacityForNonHighlighted;
      return this.defaultOpacity;
    },
    raisePoints() {
      // loop through every highlighted circle and raise it to the front
      this.highlighted?.forEach((id) => {
        this.circles.select(`.dot-${id}`).raise();
      });
      // NOT ANYMORE! order all the circles from bigger (use the this.radius function) to smaller
      // this.circles.selectAll("circle").sort((a, b) => {
      //   return d3.descending(this.radius(a), this.radius(b));
      // });
    },
    drawAxis(delay, duration) {
      // AXIS
      this.xAxis
        .attr(
          "transform",
          "translate(-0.5," + (this.height - this.margin.bottom) + ")",
        )
        .transition()
        .duration(duration)
        .delay(delay)
        .ease(d3[this.ease])
        .call(
          d3
            .axisBottom(this.x) //.ticks(this.numTicks)
            .tickFormat((d, i) => {
              return this.data.find((e) => e.id === d)?.name || d;
            })
            .tickValues(this.xTickValues),
        );

      if (!this.showXAxis) {
        this.xAxis.select(".domain").remove();
        this.xAxis.selectAll(".tick line").attr("stroke", "none");
      }

      //.call((g) => g.select(".domain").remove());
      if (this.showYAxis) {
        this.yAxis
          .attr("transform", `translate(${this.width},0)`)
          .transition()
          .duration(duration)
          .delay(delay)
          .ease(d3[this.ease])
          .call(
            d3
              .axisLeft(this.y)
              .tickSize(this.width - this.margin.left - this.margin.right)
              .tickFormat(this.format)
              .tickValues(this.yTickValues),
          );
      }
    },
    updateChart() {
      this.svg.attr("viewBox", [0, 0, this.width, this.height]);
      this.draw(0, 0);
    },
    createChart() {
      if (!this.svg) {
        this.svg = d3
          .select(this.$refs.svg)
          .attr("viewBox", [0, 0, this.width, this.height]);

        this.values = this.svg.append("g").attr("class", "values");

        this.yAxis = this.svg
          .append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(${this.width},0)`);

        // if (this.bgColor) {
        //   this.rectsColorBg = this.svg
        //     .append("g")
        //     .attr("class", "bars-color-bg");
        // }

        this.createBrush();

        this.circles = this.svg.append("g").attr("class", "circles");

        // this.rectsBg = this.svg.append("g").attr("class", "bars-bg");

        this.xAxis = this.svg
          .append("g")
          .attr("class", "x-axis")
          .attr(
            "transform",
            "translate(-0.5," + (this.height - this.margin.bottom) + ")",
          );

        if (!this.showXAxis) {
          this.xAxis.select(".domain").remove();
          this.xAxis.selectAll(".tick line").attr("stroke", "none");
        }

        // this.ref = this.svg
        //   .append("g")
        //   .attr("class", "ref-line")
        //   .attr("display", this.refLine !== null ? null : "none");

        // this.ref.append("line").attr("stroke", "black");

        // this.ref
        //   .append("text")
        //   .attr("class", "text-xs")
        //   .attr("fill", "black")
        //   .attr("x", this.margin.left)
        //   .attr("dy", "-4px")
        //   .text(this.refLineText);

        //first paint with no delay
        this.draw(0);
      }
    },
    createBrush() {
      // initial x position for knowing the dragging direction later
      let startX = null;

      // create brush
      this.brush = d3
        .brush()
        .extent([
          [this.margin.left - 30, this.margin.top - 25],
          [
            this.width - this.margin.right,
            this.height - this.margin.bottom + 25,
          ],
        ])
        .on("start", (e) => {
          // set initial x position
          startX = e.sourceEvent?.offsetX;
        })
        .on("brush end", brushed);

      this.gBrush = this.svg
        .append("g")
        .attr("class", "brush")
        .call(this.brush);

      // close button (initially hidden)
      this.brushClose = this.svg
        .append("g")
        .attr("class", "brush-close")
        .style("display", "none")
        .style("cursor", "pointer")
        .on("click", () => {
          this.gBrush.call(this.brush.clear);
        });

      this.brushClose
        .append("circle")
        .attr("r", 8)
        .attr("fill", "#fff")
        .attr("stroke", "#777");

      this.brushClose
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .style("font-size", "14px")
        .text("x");

      const that = this;

      function brushed(e) {
        const { selection } = e;

        //   console.log(e);
        const dots = that.circles.selectAll("circle");

        if (!selection) {
          dots.attr("fill", that.fill).attr("opacity", that.opacity);
          that.brushClose.style("display", "none");
          return;
        }

        let [[x0, y0], [x1, y1]] = selection;

        const maxWidth = that.x.bandwidth() + 5;

        // determine dragging direction using initial x position
        const draggingRight = startX < x1;

        // clamp brush width
        if (Math.abs(x1 - x0) > maxWidth) {
          if (draggingRight) x1 = x0 + maxWidth;
          else x0 = x1 - maxWidth;

          // programmatic move only for user event
          if (e.sourceEvent)
            that.gBrush.call(that.brush.move, [
              [x0, y0],
              [x1, y1],
            ]);
        }

        // close button position
        that.brushClose
          .attr("transform", `translate(${x1 - 2}, ${y0 + 5})`)
          .style("display", "block")
          .raise();

        const selectedMunicipalities = new Set();

        that.jitteredData.forEach((d) => {
          if (d.cx >= x0 && d.cx <= x1 && d.cy >= y0 && d.cy <= y1) {
            selectedMunicipalities.add(that.yAccessor(d));
          }
        });

        dots
          .attr("fill", (d) =>
            selectedMunicipalities.has(that.yAccessor(d))
              ? that.fill(d)
              : that.colorForNonHighlighted,
          )
          .attr("opacity", (d) =>
            selectedMunicipalities.has(that.yAccessor(d))
              ? that.opacityForHighlighted
              : that.opacityForNonHighlighted,
          );

        // for each selectedMunicipalities, rise them
        // selectedMunicipalities.forEach((id) => {
        //   that.circles.select(`.dot-${id}`).raise();
        // });

        that.raisePoints();
      }
    },
  },
};
</script>
<style>
.dot-plot-container .y-axis .tick line {
  stroke-opacity: 0.2;
  /* stroke-dasharray: 2, 2; */
}
.dot-plot-container .y-axis .domain {
  display: none;
}
</style>

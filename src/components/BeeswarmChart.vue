<template>
  <div
    ref="container"
    class="h-full transition-opacity"
    :class="{ 'overflow-hidden': !adaptSize }"
  >
    <svg
      :id="idLabel"
      ref="svg"
      class="chart h-full overflow-visible text-gray-500"
    ></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import gsap from "gsap";
import { AccurateBeeswarm } from "accurate-beeswarm-plot";
//https://observablehq.com/@d3/beeswarm-mirrored
//https://observablehq.com/@harrystevens/force-directed-beeswarm
//https://observablehq.com/@jtrim-ons/beeswarm-using-accurate-beeswarm-plot-library
export default {
  props: {
    data: {
      type: Array,
      default: () => [
        { id: "1", name: "country 1", value: 1 },
        { id: "2", name: "country 2", value: 3 },
        { id: "3", name: "country 3", value: 3 },
        { id: "4", name: "country 4", value: 3 },
        { id: "5", name: "country 5", value: 4 },
        { id: "6", name: "country 6", value: 5 },
        { id: "7", name: "country 7", value: 6 },
        { id: "8", name: "country 8", value: 6 },
        { id: "9", name: "country 9", value: 8 },
        { id: "10", name: "country 10", value: 10 },
      ],
    },
    // radius of the circles
    radius: {
      type: Number,
      default: 6,
    },
    // padding between the circles
    padding: {
      type: Number,
      default: 0.2,
    },
    // label for main axis
    axisLabel: {
      type: String,
      default: "",
    },
    // direction of main axis
    horizontal: {
      type: Boolean,
      default: true,
    },
    showAxis: {
      type: Boolean,
      default: true,
    },
    showRefLine: {
      type: Boolean,
      default: true,
    },
    refLineColor: {
      type: String,
      default: "#d1d5db", // gray-300
    },
    color: {
      type: String,
      default: "#0B4F96",
    },
    useColorScale: {
      type: Boolean,
      default: false,
    },
    domain: {
      type: Array,
      default: null, // [min, max]
    },
    // distance between axis and chart
    distanceFromAxis: {
      type: Number,
      default: 70,
    },
    marginCustom: {
      type: Object,
      default: null,
    },
    // showAnnotation: {
    //   type: Boolean,
    //   default: false,
    // },
    useForces: {
      type: Boolean,
      default: false,
    },
    compareValue: {
      type: Number,
      default: null,
    },
    showFlags: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: 300,
    },
    selected: {
      type: [String, Number, Array],
      default: null,
    },
    selectedColor: {
      type: String,
      default: "#F87171", // red-300
    },
    hoverByRegion: {
      type: Boolean,
      default: false,
    },
    numberOfBgRects: {
      type: Number,
      default: 20, // this affects the size of the hover rects
    },
    hoverRectColor: {
      type: String,
      default: "#d1d5db", // gray-300
    },
    flexibleRadius: {
      type: Boolean,
      default: false,
    },
    minRadius: {
      type: Number,
      default: 3, //used when radius is flexible
    },
    scaleType: {
      type: String,
      default: "scaleLinear",
    },
    highlightColor: {
      type: String,
      default: "#b91c1c",
    },
    clearBrushOnMouseUp: {
      type: Boolean,
      default: false, // whether to remove brush when selection is finished
    },
    animateEnter: {
      type: Boolean,
      default: true, // whether to animate new dots
    },
    allowBrush: {
      type: Boolean,
      default: false, // whether to allow brushing
    },
    adaptSize: {
      type: Boolean,
      default: false, // whether to adapt height/width to number of dots
    },
    tickFormat: {
      type: Function,
      default: null, // (d) => Math.round(d),
    },
    extent: {
      type: Array,
      default: null,
    },
    opacityForNonHighlighted: {
      type: Number,
      default: 0.3,
    },
    idLabel: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      width: 200,
      height: 500,
      firstPaint: true,
      hoveredRegion: null,
      brushIsActive: false,
      brushDomain: null, // store selected domain to redraw after resizing
    };
  },
  computed: {
    margin() {
      if (this.marginCustom) return this.marginCustom;
      return this.horizontal
        ? {
            top: 10,
            right: 10,
            bottom: 20,
            left: 10,
          }
        : { top: 10, right: 20, bottom: 10, left: 25 };
    },
    // min and max values
    domainComputed() {
      if (this.extent) {
        return this.extent;
      }
      return d3.extent(this.data, (d) => Number(d.value));
    },
    // scale for horizontal main axis
    x() {
      return (
        d3[this.scaleType]()
          // use provided or computed domain
          .domain(this.domain || this.domainComputed)
          .range([this.margin.left, this.width - this.margin.right])
        // .nice()
      );
    },
    //scale for dot radius when flexible radius is true
    r() {
      return d3
        .scaleSqrt()
        .domain([0, this.domainComputed[1]])
        .range([this.minRadius, this.radius]);
    },
    // xAxis() {
    //   return d3.axisBottom(this.x);
    // },
    // scale for vertical main axis
    y() {
      return d3[this.scaleType]()
        .domain(this.domain || this.domainComputed)
        .range([this.height - this.margin.bottom, this.margin.top])
        .nice();
    },
    xBg() {
      return d3
        .scaleBand()
        .domain(d3.range(this.numberOfBgRects))
        .range([this.margin.left, this.width - this.margin.right])
        .padding(0);
    },
    // yAxis() {
    //   return d3.axisLeft(this.y);
    // },
    // array of cross axis positions for dots
    // (y position for horizontal beeswarm, x position for vertical beeswarm)
    crossAxisPositions() {
      return this.dodge(
        this.sortedData.map((d) =>
          this.horizontal ? this.x(d.value) : this.y(d.value),
        ),
        this.radius * 2 + this.padding,
      );
    },
    // height for horizontal direction or width for vertical direction
    crossAxisSize() {
      if (this.crossAxisPositions.length) {
        const max = Math.max(
          ...this.crossAxisPositions.map((e) => Math.abs(e)),
        );
        const distance = this.showAxis ? this.distanceFromAxis : 0;
        const margin = this.horizontal
          ? this.margin.top + this.margin.bottom
          : this.margin.left + this.margin.right;
        return (max + this.radius + this.padding) * 2 + margin + distance;
      } else return 150;
    },
    colorScale() {
      return d3
        .scaleSequential()
        .domain(this.domain || this.domainComputed)
        .interpolator(d3.interpolateBlues);
    },
    // sort data so that animation starts from the bottom
    sortedData() {
      return this.data.sort((a, b) => a.value - b.value);
    },
    // store highest dot for annotation
    highestValue() {
      return this.sortedData[this.sortedData.length - 1];
    },
    accuratePositions() {
      return new AccurateBeeswarm(
        this.sortedData,
        this.radius + this.padding / 2,
        (d) => (this.horizontal ? this.x(d.value) : this.y(d.value)),
      )
        .withTiesBrokenRandomly()
        .calculateYPositions()
        .map((d) => ({
          x: this.horizontal
            ? d.x
            : d.y + (this.margin.left + this.width - this.margin.right) / 2,
          y: this.horizontal
            ? d.y + (this.margin.top + this.height - this.margin.bottom) / 2
            : d.x,
          data: d.datum,
        }));
    },
    hoverHeight() {
      const container = this.$refs.container;
      return container.clientHeight;
    },
  },
  methods: {
    setSize() {
      const container = this.$refs.container;
      if (container) {
        if (this.horizontal) {
          this.width = container.clientWidth;
          this.height = this.adaptSize
            ? this.crossAxisSize
            : container.clientHeight;
        } else {
          this.height = container.clientHeight;
          this.width = this.crossAxisSize;
        }
      }
    },
    resize() {
      const currentWidth = this.width;
      this.setSize();
      if (currentWidth !== this.width) {
        // position brush
        if (this.brushIsActive) {
          this.brushArea.call(this.brush.move, [
            this.x(this.brushDomain[0]),
            this.x(this.brushDomain[1]),
          ]);
        }

        this.updateChart();
      }
    },
    createChart() {
      this.svg = d3
        .select(this.$refs.svg)
        .attr("viewBox", [0, 0, this.width, this.height])
        .append("g")
        .on("mouseleave", () => (this.hoveredRegion = null));

      this.xAxis = this.svg
        .append("g")
        .attr("class", "x-axis")
        .attr(
          "transform",
          this.horizontal
            ? `translate(0,${this.height - this.margin.bottom})`
            : `translate(${this.margin.left},0)`,
        );

      this.ref = this.svg
        .append("line")
        .attr("stroke", this.refLineColor)
        .attr("visibility", "hidden");

      this.rectsBg = this.svg.append("g").attr("class", "bars-bg");

      this.dots = this.svg
        .append("g")
        .attr("class", "dots")
        .attr("clip-path", this.showAxis && "url(#clip)");

      if (this.allowBrush) {
        this.brush = d3
          // create brush on x axis
          .brushX()
          // set event listener for brush events
          .on("start brush", this.brushed)
          .on("brush.tooltip", this.showBrushTooltip)
          .on("end", this.emitBrushSelection);

        this.brushArea = this.svg
          .append("g")
          .attr("class", "brush-area")
          .call(this.brush)
          .on("mousemove", this.showBrushTooltip)
          .on("mouseleave", () => {
            this.brushTooltip.attr("visibility", "hidden");
          });

        this.brushArea.select(".selection").attr("fill-opacity", 0.2);

        this.brushTooltip = this.brushArea
          .append("g")
          .attr("visibility", "hidden");

        this.brushTooltip
          .append("rect")
          .attr("fill", "white")
          .attr("fill-opacity", 0.8)
          .attr("width", 15)
          .attr("height", 12)
          .attr("x", -1.5)
          .attr("y", -10.5);

        this.brushTooltip
          .append("text")
          .attr("fill", "currentColor")
          .attr("font-size", "10px");
      }

      this.draw();
    },

    draw() {
      const duration = 500;
      const enterDelay = 0;
      const updateDelay = 0;

      // draw axis
      if (this.showAxis) {
        this.xAxis
          .attr(
            "transform",
            this.horizontal
              ? `translate(0,${this.height - this.margin.bottom})`
              : `translate(${this.margin.left},0)`,
          )
          .transition("axis")
          .call(
            this.horizontal
              ? d3.axisBottom(this.x).tickFormat(this.tickFormat)
              : d3.axisLeft(this.y).tickFormat(this.tickFormat),
          );
      }
      if (this.showRefLine) {
        // draw reference line
        this.ref.attr("visibility", null);
        if (this.horizontal) {
          // y position of reference line
          const y =
            this.margin.top +
            (this.height - this.margin.top - this.margin.bottom) / 2;
          this.ref
            .attr("x1", this.margin.left)
            .attr("y1", y)
            .attr("x2", this.width - this.margin.right)
            .attr("y2", y);
        } else {
          // x position of reference line
          const x =
            this.margin.left +
            (this.width - this.margin.left - this.margin.right) / 2;
          this.ref
            .attr("x1", x)
            .attr("y1", this.margin.top)
            .attr("x2", x)
            .attr("y2", this.height - this.margin.bottom);
        }
      }

      const data = this.useForces
        ? this.beeswarmForce(this.sortedData)
        : this.accuratePositions;

      const that = this;

      // TODO: move this out of component and use popper tooltip to show flag
      // draw dots & flags (behind dots)
      if (this.showFlags) {
        this.flags = this.svg
          .append("g")
          .attr("class", "flags")
          .selectAll("circle")
          .data(data)
          .join("image")
          .attr("href", (d) => `img/flags/${d.data.id}.svg`)
          .attr("class", "flag")
          .attr("id", (d) => d.data.id)
          .attr("width", this.radius * 2)
          .attr("opacity", 0);
      }

      //clip svg so dots don't overlap xAxis
      if (this.showAxis && !this.adaptSize) {
        this.svg
          .append("defs")
          .append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("id", "clip-rect")
          .attr("x", "0")
          .attr("y", "-30")
          .attr("width", this.width)
          .attr("height", this.height);
      }

      if (this.hoverByRegion) {
        // draw transparent rectangles for events
        this.rectsBg
          .selectAll("rect")
          .data(d3.range(this.numberOfBgRects), (d) => d) // iterate over categories/layers
          .join("rect")
          .attr("id", (d) => `bg-${d}`)
          .attr("transform", "translate(0, -30)")
          .attr("fill", (d) =>
            d === this.hoveredRegion ? this.hoverRectColor : "transparent",
          )
          .attr("x", (d) => this.xBg(d))
          .attr("y", () => this.y(this.computedMax))
          .attr("height", this.hoverHeight)
          .attr("width", (this.width - this.margin.left) / this.numberOfBgRects)
          .on("mouseover", (e, d) => {
            const index = e.target.id.split("-")[1];
            this.hoveredRegion = Number(index);

            const x1 = this.x.invert(this.xBg(d));
            const x2 = this.x.invert(this.xBg(d + 1));

            const values = this.data.filter(
              (d) => d.value >= x1 && d.value < x2,
            );

            that.$emit("hover", {
              target: e.target,
              data: {
                d,
                x1,
                x2,
                values,
              },
            });
          });
      }

      this.dots
        .selectAll("circle")
        .data(data, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", "dot cursor-pointer")
              .attr("id", (d) => `dot-${d.data.id}`)
              .attr("r", 0)
              .attr("fill", this.getColor)
              .attr("opacity", this.opacity)
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
              // .attr("cursor", "pointer")
              .on("mouseover", function (e, d) {
                d3.select(this).attr("opacity", 1);
                that.$emit("hover", { target: e.target, data: d.data });
              })
              .on("mouseleave", function () {
                d3.select(this).attr("opacity", that.opacity);

                that.$emit("hover", null);
              })
              .on("click", (e, d) => {
                this.$emit("select", { target: e.target, data: d.data });
              })
              .call((enter) => {
                // this.animate(enter)
                enter
                  .transition("dot")
                  .duration(this.duration)
                  .attr("r", (d) =>
                    this.flexibleRadius ? this.r(d.data.value) : this.radius,
                  );
              }),
          (update) =>
            update
              .transition("dot")
              .duration(this.duration)
              .attr("fill", this.getColor)
              .attr("opacity", this.opacity)
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
              .attr("r", (d) =>
                this.flexibleRadius ? this.r(d.data.value) : this.radius,
              ),
          (exit) =>
            exit
              .transition("dot")
              .duration(this.duration)
              .attr("r", 0)
              .remove(),
        );
      // if (this.horizontal) {
      //   this.dots
      //     .attr("cx", (d) => d.x)
      //     .attr(
      //       "cy",
      //       (d) => (this.margin.top + this.height - this.margin.bottom) / 2
      //     )
      //     // transition dots moving from the middle outward
      //     .transition()
      //     .duration(1000)
      //     .attr("cy", (d) => d.y);
      // } else {
      //   this.dots
      //     .attr("cy", (d) => d.y)
      //     .attr("cx", (this.margin.left + this.width - this.margin.right) / 2)
      //     // transition dots moving from the middle outward
      //     .transition()
      //     .duration(1000)
      //     .attr("cx", (d) => d.x);
      // }
      if (this.showFlags) {
        this.flags
          .attr("y", (d) => d.y - this.radius)
          .attr("x", (d) => d.x - this.radius);
      }
      // if (this.showAnnotation) {
      //   // item with highest value
      //   const item = data[data.length - 1];
      //   const annotation = this.svg
      //     .append("g")
      //     .attr("class", "annotation")
      //     .attr("transform", `translate(${item.x - this.radius}, ${item.y})`);
      //   const flagWidth = this.radius * 2;
      //   // label
      //   this.label = annotation
      //     .append("text")
      //     .attr("id", "label")
      //     .text(`${item.data.name} (${item.data.value.toFixed(1)})`)
      //     .attr("text-anchor", "middle")
      //     .attr("y", -12)
      //     .attr("x", 0 + flagWidth / 2)
      //     .attr("font-size", "12px");
      //   // add background
      //   const box = this.label.node().getBBox();
      //   annotation
      //     .append("rect")
      //     .attr("x", box.x)
      //     .attr("y", box.y)
      //     .attr("width", box.width)
      //     .attr("height", box.height)
      //     .attr("fill", "#fff")
      //     .attr("opacity", 0.8)
      //     .lower();
      //   // country flag
      //   annotation
      //     .append("image")
      //     .attr("width", flagWidth)
      //     .attr("y", -flagWidth / 2)
      //     .attr("x", 0)
      //     .attr("href", `img/flags/${item.data.id}.svg`);
      // }
      if (this.compareValue !== null) {
        const lineLength = 30;
        const median = this.svg
          .append("line")
          .attr("class", "median")
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        if (this.horizontal) {
          const y =
            this.margin.top +
            (this.height - this.margin.top - this.margin.bottom) / 2;
          median
            .attr("x1", this.x(this.compareValue))
            .attr("x2", this.x(this.compareValue))
            .attr("y1", y - lineLength / 2)
            .attr("y2", y + lineLength / 2);
        } else {
          const x =
            this.margin.left +
            (this.width - this.margin.left - this.margin.right) / 2;
          median
            .attr("y1", this.y(this.compareValue))
            .attr("y2", this.y(this.compareValue))
            .attr("x1", x - lineLength / 2)
            .attr("x2", x + lineLength / 2);
        }
      }

      // set size brushable area
      if (this.allowBrush) {
        this.brushArea.call(
          this.brush.extent([
            [this.margin.left, this.margin.top + 0.5],
            [
              this.width - this.margin.right,
              this.height - this.margin.bottom - 1,
            ],
          ]),
        );
      }
    },
    getColor(d) {
      // lets only use opacity
      // if (this.selected === d.data.id) return this.selectedColor;
      return d.data.color || this.useColorScale
        ? this.colorScale(d.data.value)
        : this.color;
    },
    opacity(d) {
      if (!this.selected) return 1;
      if (this.selected === d.data.id) return 1;
      if (this.selected.includes(d.data.id)) return 1;
      return this.opacityForNonHighlighted;
    },
    updateChart() {
      d3.select(this.$refs.svg).attr("viewBox", [
        0,
        0,
        this.width,
        this.height,
      ]);
      // this.svg.remove();
      // this.createChart();
      this.draw();
      if (this.brushIsActive) this.updateBrush();
    },
    // Given an array of x-values and a separation radius, returns an array of y-values.
    // used for beeswarm by mike bostock
    dodge(X, radius) {
      const Y = new Float64Array(X.length);
      const radius2 = radius ** 2;
      const epsilon = 1e-3;
      let head = null,
        tail = null;
      // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
      function intersects(x, y) {
        let a = head;
        while (a) {
          const ai = a.index;
          if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2)
            return true;
          a = a.next;
        }
        return false;
      }
      // Place each circle sequentially.
      for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {
        // Remove circles from the queue that can't intersect the new circle b.
        while (head && X[head.index] < X[bi] - radius2) head = head.next;
        // Choose the minimum non-intersecting tangent.
        if (intersects(X[bi], (Y[bi] = 0))) {
          let a = head;
          Y[bi] = Infinity;
          do {
            const ai = a.index;
            let y1 = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            let y2 = Y[ai] - Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
            if (Math.abs(y1) < Math.abs(Y[bi]) && !intersects(X[bi], y1))
              Y[bi] = y1;
            if (Math.abs(y2) < Math.abs(Y[bi]) && !intersects(X[bi], y2))
              Y[bi] = y2;
            a = a.next;
          } while (a);
        }
        // Add b to the queue.
        const b = { index: bi, next: null };
        if (head === null) head = tail = b;
        else tail = tail.next = b;
      }
      return Y;
    },
    // Returns function to determine position of dots based on forces
    beeswarmForce(data) {
      const x = this.horizontal
        ? (d) => this.x(d.value)
        : (this.margin.left + this.width - this.margin.right) / 2;
      const y = this.horizontal
        ? (this.margin.top + this.height - this.margin.bottom) / 2
        : (d) => this.y(d.value);
      const ticks = 300;
      const entries = data.map((d) => {
        return {
          x0: typeof x === "function" ? x(d) : x,
          y0: typeof y === "function" ? y(d) : y,
          data: d,
        };
      });
      const simulation = d3
        .forceSimulation(entries)
        .force(
          "x",
          d3.forceX((d) => d.x0),
        )
        .force(
          "y",
          d3.forceY((d) => d.y0),
        )
        .force("collide", d3.forceCollide(this.radius));
      for (let i = 0; i < ticks; i++) simulation.tick();
      return entries;
    },
    beeswarmDodge(data, x, y) {
      return data.map((d, i) => {
        return {
          x: typeof x === "function" ? x(d, i) : x,
          y: typeof y === "function" ? y(d, i) : y,
          data: d,
        };
      });
    },
    // animate dots appearing from the bottom to top
    animate(selection) {
      selection
        .transition()
        .duration(this.duration)
        .attr("r", (d) =>
          this.flexibleRadius ? this.r(d.data.value) : this.radius,
        );
      // const dots = selection.nodes();
      // if (this.animateEnter) {
      //   let delay = 0;
      //   if (this.firstPaint) {
      //     delay = 1;
      //     this.firstPaint = false;
      //   }
      //   const tl = gsap.timeline().delay(delay);
      //   if (dots && dots.length) {
      //     tl.from(dots, {
      //       y: this.horizontal ? 0 : -50,
      //       x: this.horizontal ? 50 : 0,
      //       opacity: 0,
      //       stagger: { from: "start", amount: this.duration },
      //     });
      //   }
      // } else {
      //   if (dots && dots.length) gsap.from(dots, { opacity: 0 });
      // }
    },
    updateColors() {
      this.dots
        .selectAll("circle")
        .attr("fill", this.getColor)
        .attr("opacity", this.opacity);
    },
    brushed({ selection }) {
      if (selection === null) {
        // this.dots.selectAll("circle").attr("opacity", 1);
        this.dots.selectAll("circle").attr("fill", this.color);
      } else {
        // store min and max x-value of selected part of svg
        const [x0, x1] = selection;

        this.dots
          .selectAll("circle")
          // .style("opacity", 0.5)
          .attr("fill", this.color)
          .filter((d) => x0 <= d.x && d.x < x1)
          // .style("opacity", 1);
          .attr("fill", this.highlightColor);

        this.brushIsActive = true;
      }
    },
    emitBrushSelection({ selection }) {
      if (selection === null) {
        // this.dots.selectAll("circle").style("opacity", 1);
        this.dots.selectAll("circle").attr("fill", this.color);
        this.$emit("brush", null);
        this.brushIsActive = false;
      } else {
        // store min and max x-value of selected data
        const [x0, x1] = selection.map(this.x.invert);

        this.brushDomain = [x0, x1];

        // filter data points
        const filtered = this.data.filter((d) => d.value > x0 && d.value < x1);

        this.$emit("brush", { data: filtered, meta: { domain: [x0, x1] } });

        // brush area element
        const target = this.brushArea.node().querySelector(".selection");

        d3.select(target)
          .on("mouseover", () => {
            this.$emit("hoverBrush", {
              target,
              data: filtered,
              meta: { domain: [x0, x1] },
            });
          })
          .on("mouseleave", () => this.$emit("hoverBrush", null));

        // clear brush
        if (this.clearBrushOnMouseUp) this.brushArea.call(this.brush.clear);
      }
    },
    showBrushTooltip(e) {
      // get mouse position
      const p = d3.pointer(e, this.brushArea.node());

      // convert to x axis value
      const t = this.x.invert(p[0]);

      // set tooltip
      this.brushTooltip.select("text").text(this.tickFormat(t));
      this.brushTooltip
        .attr("transform", `translate(${p[0] + 5}, ${p[1] - 5})`)
        .attr("visibility", "visible");
    },
    updateBrush() {
      // adjust selection
      const selection = d3.brushSelection(this.brushArea.node());
      this.brushArea.call(this.brush.move, selection);
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
  watch: {
    data() {
      this.setSize();
      this.updateChart();

      // remove highlighting
      // this.dots.selectAll("circle").attr("fill", this.color);
    },
    hoveredRegion() {
      this.draw();
    },
    horizontal() {
      this.resize();
      this.updateChart();
    },
    selected() {
      this.updateColors();
    },
    scaleType() {
      this.updateChart();
    },
    tickFormat() {
      this.updateChart();
    },
  },
};
</script>

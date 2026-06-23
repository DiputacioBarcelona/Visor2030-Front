<template>
  <div ref="container" class="scatter-plot-container">
    <svg ref="svg" class="overflow-visible">
      <!-- <defs>
        <pattern
          v-for="d in processedData"
          :id="`scatter-flag-${d.id}`"
          :x="d.cx - d.r"
          :y="d.cy - d.r"
          patternUnits="userSpaceOnUse"
          :width="d.r * 2"
          :height="d.r * 2"
        >
          <image
            :width="d.r * 2"
            :height="d.r * 2"
            :xlink:href="`${publicPath}img/flags-round/${iso2toiso3[d.iso]}.svg`"
          ></image>
        </pattern>
      </defs> -->
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import { regressionLinear, regressionLog } from "d3-regression";
import { basePath as publicPath } from "@/config";
// import iso2toiso3 from "@/assets/iso2toIso3";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
// import * as IDS from "@/utils/ids";

gsap.registerPlugin(Flip);

export default {
  name: "ScatterPlotWithZoom",
  props: {
    data: {
      type: Array,
      default: () => [
        { name: "Name 1", x: 10, y: 20, value: 1 },
        { name: "Name 2", x: 20, y: 30, value: 1 },
        { name: "Name 3", x: 5, y: 10, value: 1 },
        { name: "Name 4", x: 20, y: 15, value: 1 },
        { name: "Name 5", x: 30, y: 30, value: 1 },
        { name: "Name 6", x: 30, y: 20, value: 1 },
        { name: "Name 7", x: 40, y: 35, value: 1 },
        { name: "Name 8", x: 45, y: 25, value: 1 },
        { name: "Name 9", x: 50, y: 30, value: 1 },
        { name: "Name 10", x: 55, y: 40, value: 1 },
      ],
    },
    margin: {
      type: Object,
      default: () => ({ top: 8, right: 8, bottom: 12, left: 12 }),
    },
    padding: {
      type: Number,
      default: 0,
    },
    dotSize: {
      type: Array,
      default: () => [5, 5], // min, max
    },
    dotOpacity: {
      type: Number,
      default: 0.8,
    },
    color: {
      type: String,
      default: "#6B7280",
    },
    gridColor: {
      type: String,
      default: "#f3f4f6",
    },
    refLineColor: {
      type: String,
      default: "#6B7280",
    },
    strokeDasharray: {
      type: String,
      default: "3,2",
    },
    ease: {
      type: String,
      default: "easeCubic",
    },
    duration: {
      type: Number,
      default: 300,
    },
    xTickFormat: {
      type: Function,
      default: null,
    },
    xTickFormatHover: {
      type: Function,
      default: null,
    },
    yTickFormat: {
      type: Function,
      default: null,
    },
    yTickFormatHover: {
      type: Function,
      default: null,
    },
    // if not passed, the data extent will be used
    xDomain: {
      type: Array,
      default: null,
    },
    // if not passed, the data extent will be used
    yDomain: {
      type: Array,
      default: null,
    },
    showMedianLines: {
      type: Boolean,
      default: true,
    },
    showRegressionLine: {
      type: Boolean,
      default: false,
    },
    showGrid: {
      type: Boolean,
      default: false,
    },
    xScaleType: {
      type: String,
      default: "scaleLinear",
    },
    highlighted: {
      type: [String, Array],
      default: () => [],
    },
    transformValues: {
      type: Object,
      default: () => ({ k: 1, x: 0, y: 0 }), // for programmatically zooming and panning
    },
    isMiniMap: {
      type: Boolean,
      default: false,
    },
    xDomainZoomed: {
      type: Array,
      default: null,
    },
    yDomainZoomed: {
      type: Array,
      default: null,
    },
    allowBrush: {
      type: Boolean,
      default: false,
    },
    allowZoom: {
      type: Boolean,
      default: false,
    },
    sizeByValue: {
      type: Boolean,
      default: false,
    },
    showFlagsOnHover: {
      type: Boolean,
      default: false,
    },
    highlightStrokeColor: {
      type: String,
      default: "#000",
    },
    forceZero: {
      type: Boolean,
      default: false,
    },
    nice: {
      type: Boolean,
      default: false,
    },
    opacityForNonHighlighted: {
      type: Number,
      default: 0.2,
    },
    showCells: {
      type: Boolean,
      default: false,
    },
    crosshair: {
      type: Array,
      default: null,
    },
    dotSizeForNonHighlighted: {
      type: Number,
      default: null,
    },
    xTicks: {
      type: [Number, Array, Function],
      default: null,
    },
    yTicks: {
      type: [Number, Array, Function],
      default: null,
    },
    showBorder: {
      type: Boolean,
      default: false,
    },
    borderColor: {
      type: String,
      default: "#000",
    },
    // for hover effects, labels.. consider only highlighted
    onlyHighlightedPoints: {
      type: Boolean,
      default: false,
    },
    // wheter to trigger hover events on voronoi cells or on circles
    useVoronoiForHover: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      publicPath,
      // iso2toiso3,
      width: 500,
      height: 500,
      transform: d3.zoomIdentity, // the identity transform with k = 1, x = y = 0
    };
  },
  computed: {
    xExtent() {
      return (
        this.xDomain ||
        (this.forceZero
          ? [0, d3.max(this.data, (d) => d.x)]
          : d3.extent(this.data, (d) => d.x))
      );
    },
    yExtent() {
      return (
        this.yDomain ||
        (this.forceZero
          ? [0, d3.max(this.data, (d) => d.y)]
          : d3.extent(this.data, (d) => d.y))
      );
    },
    x() {
      const scale = d3[this.xScaleType]()
        .domain(this.xExtent)
        .range([
          this.margin.left + this.padding,
          this.width - this.margin.right - this.padding,
        ]);

      if (this.nice) scale.nice();

      return scale;
    },
    y() {
      const scale = d3
        .scaleLinear()
        .domain(this.yExtent)
        .range([
          this.height - this.margin.bottom - this.padding,
          this.margin.top + this.padding,
        ]);

      if (this.nice) scale.nice();

      return scale;
    },
    xZoomed() {
      return this.transform.rescaleX(this.x);
    },
    yZoomed() {
      return this.transform.rescaleY(this.y);
    },
    valueExtent() {
      return this.data[0].value ? d3.extent(this.data, (d) => d.value) : null;
    },
    // scale function for circle radius
    r() {
      // circle area proportional to value
      // const minValue = this.valueExtent[0]
      // const minArea = Math.PI * this.dotSize ** 2

      // return (d) => {
      //   // calculate what area should be based on input value
      //   const area = (minArea * d) / minValue
      //   // extract radius from area
      //   return Math.sqrt(area / Math.PI)
      // }

      // use fixed range for radius
      return d3
        .scaleSqrt()
        .domain(
          d3.extent(this.data, (d) => (d.value !== undefined ? d.value : 1)),
        )
        .range(this.dotSize);
    },
    medianY() {
      return d3.median(this.data, (d) => d.y);
      // for this project just set to 100 which is the IE reference
      // return 50;
    },
    medianX() {
      return d3.median(this.data, (d) => d.x);
      // for this project just set to 0 which is the % reference
      // return 50;
    },
    regressionGenerator() {
      const regression =
        this.xScaleType === "scaleLog" ? regressionLog : regressionLinear;

      // returns array with 2 points for regression line
      // and r-squared
      return regression()
        .x((d) => d.x)
        .y((d) => d.y)
        .domain(this.x.domain()); // set min and max x values
    },
    regressionLineGenerator() {
      return d3
        .line()
        .x((d) => this.x(d[0]))
        .y((d) => this.y(d[1]));
    },
    rSquared() {
      return this.regressionGenerator(this.data).rSquared;
    },
    xAxisGenerator() {
      return d3
        .axisBottom(this.x)
        .tickSize(this.height - this.margin.top - this.margin.bottom)
        .tickFormat(this.xTickFormat)
        .ticks(this.xTicks);
    },
    yAxisGenerator() {
      return d3
        .axisLeft(this.y)
        .tickSize(this.width - this.margin.left - this.margin.right)
        .tickFormat(this.yTickFormat)
        .ticks(this.yTicks);
    },
    processedData() {
      // console.log("calculate processed data");
      const data = this.data;

      return data.map((d) => ({
        ...d,
        cx: this.x(d.x),
        cy: this.y(d.y),
        r: this.r(d.value || 1),
      }));
    },
    cellData() {
      const data = this.onlyHighlightedPoints
        ? this.highlightedData
        : this.data;

      return data.map((d) => ({
        ...d,
        cx: this.x(d.x),
        cy: this.y(d.y),
        r: this.r(d.value || 1),
      }));
    },
    voronoi() {
      // only the highlighted ones
      // const data = this.highlightedData;

      //all of them
      const data = this.cellData;

      // https://observablehq.com/@d3/voronoi-labels
      const delaunay = d3.Delaunay.from(data.map((d) => [d.cx, d.cy]));
      const space = 0;
      const voronoi = delaunay.voronoi([
        this.margin.left - space,
        this.margin.top - space,
        this.width - this.margin.right + space,
        this.height - this.margin.bottom + space,
      ]);

      return voronoi;
    },
    cells() {
      // console.log("calculate cells");
      const data = this.cellData;
      const cells = data
        .map((d, i) => [d, this.voronoi.cellPolygon(i)])
        // Estonia is null for some reason
        .filter(([, cell]) => cell);

      // console.log(this.processedData, data);

      return cells;
    },
    highlightedData() {
      return this.data.filter((d) => {
        // if there are highlighted items, use only those, otherwise use all
        if (this.highlighted.length) {
          return this.highlighted.includes(d.id);
        } else {
          return true;
        }
      });
    },
  },
  watch: {
    data() {
      this.updateChartData();
    },
    sizeByValue() {
      this.draw();
    },
    xScaleType() {
      this.draw();
    },
    showMedianLines(newVal) {
      this.xMedianLine.attr("visibility", newVal ? "visible" : "hidden");
      this.yMedianLine.attr("visibility", newVal ? "visible" : "hidden");
    },
    showRegressionLine(newVal) {
      this.regressionLine.attr("visibility", newVal ? "visible" : "hidden");
      // this.regressionLabel.attr('visibility', newVal ? 'visible' : 'hidden')
    },
    showGrid(newVal) {
      if (newVal) {
        this.svg
          .selectAll(".tick")
          .select("line")
          .attr("stroke", this.gridColor);
      } else {
        this.svg
          .selectAll(".tick")
          .select("line")
          .attr("stroke", "transparent");
      }
    },
    highlighted(newVal) {
      if (newVal) {
        // draw ref lines from highlighted circle
        this.drawHoverRefLines(newVal);

        this.raisePoints();
      } else {
        // reset axis ticks to automatically calculated values
        this.xAxisGenerator.tickValues(null).tickFormat(this.xTickFormat);
        this.yAxisGenerator.tickValues(null).tickFormat(this.yTickFormat);
        this.drawAxis();
      }

      this.drawRegressionLine(0, this.duration);

      // paint circles
      this.circles
        .selectAll(`circle`)
        .attr("fill", this.fill)
        .attr("fill-opacity", this.fillOpacity)
        .attr("opacity", this.opacity)
        .attr("r", this.radius);
    },
    // set zoom programmatically through prop
    transformValues: {
      handler(newVal) {
        if (this.isMiniMap) this.transformMiniMapView();
        else if (this.allowZoom) {
          this.svg
            .transition()
            .duration(500)
            .call(
              this.zoom.transform,
              new d3.ZoomTransform(newVal.k, newVal.x, newVal.y),
            );
        }
      },
      deep: true,
    },
    allowBrush(newVal) {
      if (newVal) {
        this.brushArea.call(this.brush);
        this.brushArea.select(".overlay").attr("pointer-events", "all"); // change cursor pointer
        this.disablePanning();
      } else {
        this.brushArea.on(".brush", null); // disable brushing
        this.brushArea.select(".overlay").attr("pointer-events", "none");
        this.svg.call(this.zoom); // endable panning
      }
    },
    allowZoom(newVal) {
      if (newVal) {
        this.svg.call(this.zoom);
      } else {
        this.svg.on(".zoom", null);
      }
    },
    xDomain() {
      this.updateChartData();
    },
    yDomain() {
      this.updateChartData();
    },
    crosshair() {
      this.drawCrosshair();
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
    createChart() {
      this.svg = d3
        .select(this.$refs.svg)
        .attr("viewBox", [0, 0, this.width, this.height]);
      // .on('click', this.resetZoom)

      // use to clip circles outside chart
      this.clipPathCircles = this.svg
        .append("clipPath")
        .attr("id", "clippath-circles")
        .append("rect");

      // use to clip reflines but not labels, so that they are visible outside chart
      this.clipPathLines = this.svg
        .append("clipPath")
        .attr("id", "clippath-lines")
        .append("rect");

      this.xAxis = this.svg.append("g").attr("class", "x-axis");
      this.yAxis = this.svg.append("g").attr("class", "y-axis");

      // initialize brush behavior
      // this.brush = d3
      //   .brush()
      //   // define brushable area
      //   .extent([
      //     [0, 0],
      //     [this.width, this.height],
      //   ])
      //   // avoid listening to key events while brushing
      //   // (so that holding shift doesn't modify the behavior)
      //   .keyModifiers(false)
      //   // set event listener for brush events
      //   .on("start brush end", this.brushed);

      // this.brushArea = this.svg.append("g").attr("class", "brush");

      this.lines = this.svg
        .append("g")
        .attr("class", "lines-container")
        .attr("clip-path", "url(#clippath-lines)")
        .append("g")
        .attr("class", "lines view");

      this.regressionLine = this.lines
        .append("path")
        .attr("class", "regression")
        .attr("visibility", this.showRegressionLine ? "visible" : "hidden")
        .attr("stroke", this.refLineColor)
        .attr("stroke-dasharray", this.strokeDasharray)
        .attr("fill", "transparent")
        .on("mouseenter", () => {
          this.$emit("hoverRegressionLine", {
            data: this.rSquared,
          });
        })
        .on("mouseleave", () => {
          this.$emit("hoverRegressionLine", null);
        });

      this.xMedianLine = this.lines
        .append("line")
        .attr("stroke", this.refLineColor)
        .attr("stroke-dasharray", this.strokeDasharray)
        .attr("x1", this.margin.left)
        .attr("x2", this.width - this.margin.right)
        .attr("y1", this.y(this.medianY) || 0)
        .attr("y2", this.y(this.medianY) || 0)
        .attr("visibility", this.showMedianLines ? "visible" : "hidden");

      this.yMedianLine = this.lines
        .append("line")
        .attr("stroke", this.refLineColor)
        .attr("stroke-dasharray", this.strokeDasharray)
        .attr("x1", this.x(this.medianX) || 0)
        .attr("x2", this.x(this.medianX) || 0)
        .attr("y1", this.height - this.margin.bottom)
        .attr("y2", this.margin.top)
        .attr("visibility", this.showMedianLines ? "visible" : "hidden");

      if (this.isMiniMap) {
        this.miniMapView = this.svg
          .append("rect")
          .attr("stroke", "#9ca3af")
          .attr("fill", "none")
          .attr("class", "minimap-view");
      }

      this.xCrosshair = this.lines
        .append("line")
        .attr("class", "x-crosshair")
        .attr("stroke", this.refLineColor)
        .attr("stroke-dasharray", this.strokeDasharray)
        .attr("pointer-events", "none");

      this.yCrosshair = this.lines
        .append("line")
        .attr("class", "y-crosshair")
        .attr("stroke", this.refLineColor)
        .attr("stroke-dasharray", this.strokeDasharray)
        .attr("pointer-events", "none");

      if (this.showBorder) {
        this.border = this.svg
          .append("rect")
          .attr("class", "border")
          .attr("fill", "none")
          .attr("stroke", this.borderColor);
      }

      this.drawCrosshair();

      // click on the background triggers event click-bg
      this.svg
        .on("click", (event) => {
          const [x, y] = d3.pointer(event);
          const xValue = this.xZoomed.invert(x);
          const yValue = this.yZoomed.invert(y);

          // emit
          this.$emit("click-bg", [xValue, yValue]);
        })
        // click on the background triggers event click-bg
        .on("dblclick", (event) => {
          const [x, y] = d3.pointer(event);
          const xValue = this.xZoomed.invert(x);
          const yValue = this.yZoomed.invert(y);

          // emit
          this.$emit("dblclick-bg", [xValue, yValue]);
        });

      // hover event for crosshair
      this.svg
        .on("mousemove", (event) => {
          const [x, y] = d3.pointer(event);

          // calculate the invert position of the mouse
          const xValue = this.xZoomed.invert(x);
          const yValue = this.yZoomed.invert(y);
          // emit
          this.$emit("hover-bg", [xValue, yValue]);
        })
        .on("mouseleave", () => {
          this.$emit("hover-bg", null);
        });

      // initialize zoom behavior
      // this.zoom = d3
      //   .zoom()
      //   // max zoom
      //   .scaleExtent([1, 16])
      //   // max panning
      //   .translateExtent([
      //     [0, 0],
      //     [this.width, this.height],
      //   ])
      //   .on("zoom", (e) => {
      //     this.zoomed(e);

      //     // store new min and max values of x and y-axis after zoom
      //     const zoomedXDomain = this.xZoomed.domain();
      //     const zoomedYDomain = this.yZoomed.domain();

      //     this.$emit("zoom", {
      //       transform: e.transform,
      //       xDomain: zoomedXDomain,
      //       yDomain: zoomedYDomain,
      //     });
      //   })
      //   .on("end", (e) => {
      //     this.circles.selectAll("circle").attr("r", (d) => {
      //       return this.sizeByValue
      //         ? this.r(d.value) / this.transform.k
      //         : this.dotSize[0] / this.transform.k;
      //     });
      //   });

      this.circles = this.svg
        .append("g")
        .attr("class", "circles-container")
        // .attr("clip-path", "url(#clippath-circles)")
        .append("g")
        .attr("class", "circles view");

      this.cellLines = this.svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("class", "cell-lines");

      this.cellsContainer = this.svg
        .append("g")
        .attr("class", "cell-container")
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("pointer-events", "none");

      this.cellsHoverContainer = this.svg
        .append("g")
        .attr("class", "cell-container")
        .attr("stroke", "none");

      this.labels = this.svg
        .append("g")
        .attr("class", "labels-container") // pointer-events-none
        .style("font-size", "10px");

      // first paint with no delay
      this.draw(0);
    },
    draw(delay = this.duration, duration = this.duration) {
      if (this.allowZoom) this.svg.call(this.zoom);

      if (this.allowBrush) {
        this.brushArea.call(this.brush);

        // if brush is active, disable panning
        this.svg.on("mousedown.zoom", null).on("touchstart.zoom", null);
      }

      const selection = this.circles
        .selectAll("circle")
        .data(this.processedData, (d) => d.name);

      // calculate delays
      const updating = selection;
      // const exiting = selection.exit()
      const updateDelay1 = 0;
      const updateDelay = updateDelay1 + updating.size() ? updateDelay1 : 0;
      const enterDelay = updateDelay + delay;
      const enterDelayAxis = updateDelay;
      // AXIS
      if (!this.isMiniMap) this.drawAxis(enterDelayAxis, duration);
      // REF LINES
      this.drawMedianLines(updateDelay, duration);
      // LINEAR REGRESSION LINE
      this.drawRegressionLine(updateDelay, duration);
      // DOTS
      selection.join(
        (enter) => {
          const selection = enter
            .append("circle")
            .attr("id", (d) => "circle-" + d.id)
            .attr("r", 0)
            .attr("fill-opacity", this.fillOpacity)
            .attr("opacity", this.opacity)
            .attr("fill", this.fill)
            .attr("stroke", this.strokeColor)
            .attr("stroke-width", this.stroke)
            .attr("cx", (d) => this.x(d.x))
            .attr("cy", (d) => this.y(d.y))
            .attr("class", "cursor-pointer")

            .call((enter) =>
              enter
                .transition()
                .duration(duration)
                .ease(d3[this.ease])
                .delay(enterDelay)
                .attr("r", this.radius),
            );

          if (!this.useVoronoiForHover) {
            selection
              .on("mouseenter", (event, data) => {
                if (!this.isMiniMap)
                  this.$emit("hover", { target: event.target, data });
              })
              .on("mouseleave", () => {
                if (!this.isMiniMap) this.$emit("hover", null);
              })
              .on("click", (event, data) => {
                if (!this.isMiniMap)
                  this.$emit("select", { target: event.target, data });
              });
          }

          return selection;
        },
        (update) =>
          update.call((update) => {
            update
              .attr("fill-opacity", this.fillOpacity)
              .attr("opacity", this.opacity)
              .attr("stroke", this.strokeColor)
              .attr("stroke-width", this.stroke);

            update
              .transition()
              .duration(duration)
              .ease(d3[this.ease])
              .delay(updateDelay)
              .attr("cx", (d) => this.x(d.x))
              .attr("cy", (d) => this.y(d.y))
              .attr("fill", this.fill)
              .attr("r", this.radius);
          }),
        (exit) =>
          exit
            .transition()
            .duration(duration)
            .ease(d3[this.ease])
            .attr("r", 0)
            .remove(),
      );

      // LABELS
      this.drawLabels(delay, duration);

      this.drawClipPath();

      if (this.isMiniMap) {
        this.drawMiniMapView();
      }

      this.drawBorder();

      this.raisePoints();

      if (this.useVoronoiForHover) {
        this.voronoiHoverBehavior();
      }
    },
    voronoiHoverBehavior() {
      this.cellsHoverContainer
        .selectAll("path")
        .data(this.cells, (d) => d.id)
        .join("path")
        .attr("class", "cell")
        .attr("d", ([, cell]) => "M" + cell.join("L") + "Z")
        .attr("fill", "transparent")
        // .attr("stroke", "blue")
        .on("mouseenter", (event, [d, cell]) => {
          // console.log("Hovered:", d);
          const target = this.circles.select("circle#circle-" + d.id)
            ._groups[0][0];

          this.$emit("hover", { target, data: d });
        })
        .on("mouseleave", (event, [d, cell]) => {
          // console.log("Left:", d);
          this.$emit("hover", null);
        })
        .on("click", (event, [d, cell]) => {
          // console.log("Hovered:", d);
          const target = this.circles.select("circle#circle-" + d.id)
            ._groups[0][0];

          this.$emit("select", { target, data: d });
        });
    },
    radius(d) {
      // if there are highlighted items but this is not one of them and dotSizeForNonHighlighted is set, use that size
      if (
        this.highlighted.length &&
        !this.highlighted.includes(d.id) &&
        !d.highlighted &&
        this.dotSizeForNonHighlighted !== null
      ) {
        return this.dotSizeForNonHighlighted;
      }

      // otherwise size normally
      return this.sizeByValue ? this.r(d.value) : this.dotSize[0];
    },
    fill(d) {
      // console.log(d);
      if (
        (this.showFlagsOnHover && this.highlighted.includes(d.id)) ||
        d.showFlag
      ) {
        return `url(#scatter-flag-${d.id})`;
      }
      return d.color ? d.color : this.color;
    },
    fillOpacity(d) {
      // console.log(d.id, d.highlighted);
      if (this.highlighted.includes(d.id)) return 1;
      if (d.highlighted) return 1;
      return this.dotOpacity;
    },
    opacity(d) {
      // console.log(d.id, d.highlighted);
      if (this.highlighted.includes(d.id)) return 1;
      if (d.highlighted) return 1;
      if (this.highlighted.length) return this.opacityForNonHighlighted;
      return 1;
    },
    stroke(d) {
      if (d.strokeWidth) return d.strokeWidth;
      return 1;
      // if (d.highlighted) return 2;
      // return 0;
    },
    strokeColor(d) {
      if (d.highlighted) return this.highlightStrokeColor;
      return d.color;
    },
    zoomed(event) {
      const { transform } = event;
      this.transform = transform;

      // set transform on circles and lines view (g) elements
      this.svg.selectAll(".view").attr("transform", transform);

      // adjust circle r to scale with zooming
      this.circles.selectAll("circle").attr("r", (d) => {
        return this.sizeByValue
          ? this.r(d.value) / this.transform.k
          : this.dotSize[0] / this.transform.k;
      });

      // rescale line width and dashes
      this.lines
        .selectAll("line")
        .attr("stroke-width", 1 / transform.k)
        .attr(
          "stroke-dasharray",
          `${
            +this.strokeDasharray.split(",")[0] / transform.k
          },${+this.strokeDasharray.split(",")[1] / transform.k}`,
        );

      this.lines
        .selectAll("path")
        .attr("stroke-width", 1 / transform.k)
        .attr(
          "stroke-dasharray",
          `${
            +this.strokeDasharray.split(",")[0] / transform.k
          },${+this.strokeDasharray.split(",")[1] / transform.k}`,
        );

      // rescale axes
      // https://observablehq.com/@d3/pan-zoom-axes
      this.xAxis.call(this.xAxisGenerator.scale(transform.rescaleX(this.x)));
      this.yAxis.call(this.yAxisGenerator.scale(transform.rescaleY(this.y)));
      this.setAxisStyles();
    },
    resetZoom() {
      this.svg
        .transition()
        .duration(750)
        .call(this.zoom.transform, d3.zoomIdentity);
    },
    drawRegressionLine(delay = 0, duration = 0) {
      this.regressionLine
        .datum(this.regressionGenerator(this.highlightedData))
        .transition()
        .duration(duration)
        .delay(delay)
        .attr("d", this.regressionLineGenerator);

      // this.regressionLabel
      //   .attr('x', this.width)
      //   // position close to line but between 0 and height of chart
      //   .attr('y', Math.min(Math.max(this.y(points[1][1]), 0), this.height))
      //   .text(`R² = ${this.rSquared.toFixed(2)}`)
    },
    drawAxis(delay = 0, duration = 0) {
      this.xAxis
        .attr("transform", `translate(0, ${this.margin.top})`)
        .transition()
        .duration(duration)
        .ease(d3[this.ease])
        .delay(delay)
        .call(this.xAxisGenerator);

      this.yAxis
        .attr("transform", `translate(${this.width - this.margin.right}, 0)`)
        .transition()
        .duration(duration)
        .ease(d3[this.ease])
        .delay(delay)
        .call(this.yAxisGenerator);

      this.setAxisStyles();
    },
    drawMedianLines(delay, duration) {
      if (!isNaN(this.y(this.medianY))) {
        this.xMedianLine
          .transition()
          .duration(duration)
          .delay(delay)
          .attr("x1", this.margin.left)
          .attr("x2", this.width - this.margin.right)
          .attr("y1", this.y(this.medianY))
          .attr("y2", this.y(this.medianY));
      }

      if (!isNaN(this.x(this.medianX))) {
        this.yMedianLine
          .transition()
          .duration(duration)
          .delay(delay)
          .attr("x1", this.x(this.medianX))
          .attr("x2", this.x(this.medianX))
          .attr("y1", this.height - this.margin.bottom)
          .attr("y2", this.margin.top);
      }
    },
    drawClipPath() {
      this.clipPathCircles
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height);

      this.clipPathLines
        .attr("x", this.margin.left)
        .attr("y", this.margin.top)
        .attr("width", this.width - this.margin.right - this.margin.left)
        .attr("height", this.height - this.margin.bottom - this.margin.top);
    },
    drawHoverRefLines(id) {
      const d = this.data.find((e) => e.id === id);

      if (d) {
        const xAxisValues = this.xAxisGenerator.scale().ticks();
        const yAxisValues = this.yAxisGenerator.scale().ticks();

        const defaultTickFormat = this.xAxisGenerator.scale().tickFormat();

        // calculate distances from hover value to each tick value
        // use minimum distance to find the closest tick
        const xDistances = xAxisValues.map((e) => Math.abs(e - d.x));
        const yDistances = yAxisValues.map((e) => Math.abs(e - d.y));

        const xMin = Math.min(...xDistances);
        const yMin = Math.min(...yDistances);

        const xIndex = xDistances.indexOf(xMin);
        const yIndex = yDistances.indexOf(yMin);

        // replace closest tick value with hovered value
        xAxisValues[xIndex] = d.x;
        yAxisValues[yIndex] = d.y;

        // reset tick values on axis including hovered value
        this.xAxisGenerator.tickValues(xAxisValues).tickFormat((tick) => {
          // for hovered value use special formatter in some cases (needed for log scale because some values are not shown with default formatter)
          if (tick === d.x && this.xTickFormatHover)
            return this.xTickFormatHover(tick);
          // otherwise use default format function
          else
            return this.xTickFormat
              ? this.xTickFormat(tick)
              : defaultTickFormat(tick);
        });
        this.yAxisGenerator.tickValues(yAxisValues);
        this.drawAxis();

        // use dashes for hover lines
        const xTick = this.xAxis.selectAll(".tick").nodes()[xIndex + 1];
        const yTick = this.yAxis.selectAll(".tick").nodes()[yIndex + 1];
        d3.select(xTick).select("line").attr("stroke-dasharray", "4,2");

        d3.select(yTick).select("line").attr("stroke-dasharray", "4,2");
      }
    },
    drawMiniMapView() {
      this.miniMapView
        .attr("x", this.margin.left)
        .attr("y", this.margin.top)
        .attr("width", this.width - this.margin.left - this.margin.right)
        .attr("height", this.height - this.margin.top - this.margin.bottom);
    },
    drawLabels(delay, duration) {
      // console.log("draw labels", this.cells);

      // make a copy of cells
      const cells = this.cells;

      const separation = 8;

      const orient = {
        top: (text) => text.attr("text-anchor", "middle").attr("dy", "0.1em"),
        // .attr("y", -distance * 1.5)
        right: (text) => text.attr("text-anchor", "start").attr("dy", "0.35em"),
        // .attr("x", distance)
        bottom: (text) =>
          text.attr("text-anchor", "middle").attr("dy", "0.71em"),
        // .attr("y", distance)
        left: (text) => text.attr("text-anchor", "end").attr("dy", "0.35em"),
        // .attr("x", -distance)
      };

      const selection = this.labels
        .selectAll("text")
        .data(cells, ([d]) => d.id);

      // calculate delays
      const updating = selection;
      // const exiting = selection.exit()
      const updateDelay1 = 0;
      const updateDelay = updateDelay1 + updating.size() ? updateDelay1 : 0;
      const enterDelay = updateDelay + delay;

      function each([d, cell]) {
        const { cx: x, cy: y } = d;
        const [cx, cy] = d3.polygonCentroid(cell);
        const angle =
          (Math.round((Math.atan2(cy - y, cx - x) / Math.PI) * 2) + 4) % 4;

        d.orient =
          angle === 0
            ? "right"
            : angle === 3
              ? "top"
              : angle === 1
                ? "bottom"
                : "left";

        d3.select(this).call(
          angle === 0
            ? orient.right
            : angle === 3
              ? orient.top
              : angle === 1
                ? orient.bottom
                : orient.left,
        );
      }

      function getXPosition(d) {
        const distance = d.r + separation;
        return (
          d.cx +
          (d.orient === "left"
            ? -distance
            : d.orient === "right"
              ? distance
              : 0)
        );
      }
      function getYPosition(d) {
        const distance = d.r + separation;
        return (
          d.cy +
          (d.orient === "top"
            ? -distance
            : d.orient === "bottom"
              ? distance
              : 0)
        );
      }

      function splitText(text, maxWordsPerLine) {
        const words = text.split(" ");
        const lines = [];
        for (let i = 0; i < words.length; i += maxWordsPerLine) {
          lines.push(words.slice(i, i + maxWordsPerLine).join(" "));
        }
        return lines;
      }

      // show cells
      if (this.showCells) {
        this.cellLines
          .attr("stroke", "red")
          .selectAll("path")
          .data(cells)
          .join("path")
          .transition()
          .duration(duration)
          .ease(d3[this.ease])
          .attr("d", ([d, cell]) => {
            // console.log(d);

            const point = [d.cx, d.cy];
            return `M${d3.polygonCentroid(cell)}L${point}`;
          });

        this.cellsContainer
          .transition()
          .duration(duration)
          .ease(d3[this.ease])
          .attr("d", this.voronoi.render());
      }

      // LABELS
      selection.join(
        (enter) =>
          enter
            .append("text")
            .each(each)
            // .attr("transform", ([d]) => `translate(${[d.cx, d.cy]})`)
            .attr("x", ([d]) => getXPosition(d))
            .attr("y", ([d]) => getYPosition(d))
            .attr("class", "pointer-events-none")
            .attr(
              "display",
              ([, cell]) =>
                // -d3.polygonArea(cell) > 2000 ? null : "none"
                null,
            )
            // instead of this
            .text(([d], i) => d.label)
            // if the label is longer than 5 words, break it into lines
            // .html(([d]) => {
            //   const words = splitText(d.label, 5);

            //   if (words.length > 1) {
            //     return words
            //       .map((word, i) => {
            //         if (i === 0)
            //           return `<tspan x="${getXPosition(d)}" dy="1.2em">${word}</tspan>`;
            //         return `<tspan x="${getXPosition(d)} dy="1.2em">${word}</tspan>`;
            //       })
            //       .join("");
            //   }
            //   return d.label;
            // })
            .attr("id", ([d], i) => d.id)
            .attr("opacity", 0)

            .call((enter) =>
              enter
                .transition()
                .duration(duration)
                .ease(d3[this.ease])
                .delay(enterDelay)
                .attr("opacity", 1),
            ),
        (update) =>
          update.call((update) =>
            // because labels can change their orient, and this is not animatable
            // it would cause jumps in the labels animation
            // so instead of using .transition(), we will transition these
            // using FLIP technique
            update
              .each(function ([d, cell]) {
                const item = d3.select(this).node();
                const state = Flip.getState(item);
                // remember the current state
                d.state = state;
              })
              .each(each)
              .attr("x", ([d]) => getXPosition(d))
              .attr("y", ([d]) => getYPosition(d))
              .attr(
                "display",
                ([, cell]) =>
                  // -d3.polygonArea(cell) > 2000 ? null : "none"
                  null,
              )
              .text(([d], i) => d.label)
              // .html(([d]) => {
              //   const words = splitText(d.label, 5);
              //   // console.log(words);
              //   if (words.length > 1) {
              //     return words
              //       .map((word, i) => {
              //         if (i === 0)
              //           return `<tspan x="${getXPosition(d)}" dy="1.2em">${word}</tspan>`;
              //         return `<tspan x="${getXPosition(d)} dy="1.2em">${word}</tspan>`;
              //       })
              //       .join("");
              //   }
              //   return d.label;
              // })
              .attr("opacity", 1)
              .each(function ([d, cell]) {
                // apply the FLIP animation from the previous state
                Flip.from(d.state, {
                  duration: duration / 1000,
                  ease: "power3.inOut", // this matches D3's default easing, https://github.com/d3/d3-ease#easeCubicInOut
                  delay: updateDelay / 1000,
                });
              }),
          ),
        (exit) =>
          exit
            .each(each)
            .transition()
            .duration(duration)
            .ease(d3[this.ease])
            .attr("opacity", 0)
            .remove(),
      );

      // draw voronoi cells and lines for debugging
    },
    drawBorder() {
      if (this.showBorder) {
        this.border
          .attr("x", this.margin.left)
          .attr("y", this.margin.top)
          .attr("width", this.width - this.margin.left - this.margin.right)
          .attr("height", this.height - this.margin.top - this.margin.bottom);
      }
    },
    transformMiniMapView() {
      if (this.xDomainZoomed) {
        const x1 = this.x(this.xDomainZoomed[0]);
        const x2 = this.x(this.xDomainZoomed[1]);
        const y1 = this.y(this.yDomainZoomed[1]);

        const rx = this.x.range();
        const ry = this.y.range();

        // calculate scale factor
        // by dividing new range by total range
        const k = (x2 - x1) / (rx[1] - rx[0]);

        this.miniMapView
          .transition()
          .duration(0)
          .attr(
            "transform",
            // second translate is to adjust for margin
            `translate(${x1}, ${y1}) scale(${k}) translate(${-rx[0]}, ${-ry[1]})`,
          )
          .attr("stroke-width", 1 / k);
      }
    },
    brushed(e) {
      const { selection, type } = e;
      let value = [];

      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;

        value = this.circles
          .selectAll("circle")
          .style("opacity", 0.3)
          .filter(
            (d) =>
              x0 <= this.xZoomed(d.x) &&
              this.xZoomed(d.x) < x1 &&
              y0 <= this.yZoomed(d.y) &&
              this.yZoomed(d.y) < y1,
          )
          .style("opacity", this.dotOpacity)
          .data();

        if (type === "end") {
          // select brush area element
          const target = this.brushArea.select(".selection").node();

          this.$emit("brush", { data: value, target });
        }
      } else {
        this.circles.selectAll("circle").style("opacity", this.dotOpacity);
        this.$emit("brush", null);
      }
    },
    // called on screen resize only. No animations.
    updateChart() {
      this.svg.attr("viewBox", [0, 0, this.width, this.height]);
      // console.log("update chart");
      this.draw(0, 0);
    },
    updateChartData() {
      // console.log("updateChartData");
      if (this.allowBrush) this.brushArea.call(this.brush.clear);

      if (this.allowZoom) this.resetZoom();
      this.draw();
    },
    disablePanning() {
      this.svg.on("mousedown.zoom", null).on("touchstart.zoom", null);
    },
    setAxisStyles() {
      this.xAxis.selectAll("text").attr("dy", "0.9em"); // move numbers slightly lower
      this.svg.selectAll(".tick").select("line").attr("stroke", this.gridColor);
    },
    raisePoints() {
      // loop through every highlighted circle and raise it to the front
      // this.highlighted.forEach((id) => {
      //   this.circles.select(`circle#${id}`).raise();
      // });
      // NOT ANYMORE! order all the circles from bigger (use the this.radius function) to smaller
      this.circles.selectAll("circle").sort((a, b) => {
        return d3.descending(this.radius(a), this.radius(b));
      });
    },
    drawCrosshair() {
      // console.log("draw");
      this.xCrosshair
        .attr("visibility", this.crosshair ? "visible" : "hidden")
        .attr("x1", this.margin.left)
        .attr("x2", this.width - this.margin.right)
        .attr("y1", this.y(this.crosshair?.[1]) || 0)
        .attr("y2", this.y(this.crosshair?.[1]) || 0);

      this.yCrosshair
        .attr("visibility", this.crosshair ? "visible" : "hidden")
        .attr("x1", this.x(this.crosshair?.[0]) || 0)
        .attr("x2", this.x(this.crosshair?.[0]) || 0)
        .attr("y1", this.margin.top)
        .attr("y2", this.height - this.margin.bottom);
    },
  },
};
</script>

<style>
.scatter-plot-container .domain {
  display: none;
}
</style>

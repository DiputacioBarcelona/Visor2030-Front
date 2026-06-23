/* eslint-disable no-console */
<template>
  <div ref="container" class="ot-sparkline">
    <svg ref="sparkline" :width="width" :height="height" :id="idLabel"></svg>
  </div>
</template>

<script>
import { ref } from "vue";
import * as d3 from "d3";

export default {
  name: "LineChart",
  props: {
    data: {
      type: Array,
      default: () => [
        [
          { name: "2008", value: 0 },
          { name: "2009", value: 30 },
          { name: "2010", value: 20 },
          { name: "2011", value: 25 },
          { name: "2012", value: 40 },
          { name: "2013", value: 30 },
          { name: "2014", value: 66 },
          { name: "2015", value: 80 },
          { name: "2016", value: 50 },
          { name: "2017", value: 60 },
          { name: "2018", value: 75 },
        ],
      ],
    },
    scale: {
      type: String,
      default: "scaleLinear", // scale type for y axis
    },
    color: {
      type: Array,
      default: () => [], // color for each line
    },
    defaultColor: {
      type: String,
      default: "#9CA3AF", // coolGray 400, default line color
    },
    highlightColor: {
      type: String,
      default: "#374151", // coolGray 700
    },
    highlightStrokeWidth: {
      type: [String, Number],
      default: 2,
    },
    verticalLineColor: {
      type: String,
      default: "#cbd5e1", // bluegray 300
    },
    strokeWidth: {
      type: Number,
      default: 2, // line thickness
    },
    verticalLineStrokeWidth: {
      type: Number,
      default: 1,
    },
    dotRadius: {
      type: Number,
      default: 4,
    },
    curve: {
      type: String,
      default: "curveLinear", // "curveMonotoneX", curve of line
    },
    showLastPoint: {
      type: Boolean,
      default: true,
    },
    showXAxis: {
      type: Boolean,
      default: true,
    },
    xAxisStyle: {
      type: Boolean,
      default: false,
    },
    showYAxis: {
      type: Boolean,
      default: true,
    },
    yAxisStyle: {
      type: Boolean,
      default: false,
    },
    datasetStrokeDasharray: {
      type: Array,
      default: [], //["1", "5,5"], // use dashes for some lines
    },
    hoverNum: {
      // forces the line to be drawn over a point
      type: [Number, null],
      default: null, // index of hovered data point
    },
    margin: {
      type: Object,
      default: () => ({ top: 0, right: 0, bottom: 15, left: 40 }),
    },
    padding: {
      type: Object,
      default: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    },
    range: {
      type: Array,
      default: null,
    },
    referenceDot: {
      type: Number,
      default: null, // index of reference dot on line
    },
    refDotRadius: {
      type: Number,
      default: 4,
    },
    refDotColor: {
      type: String,
      default: "#E5E7EB", // coolGray 200
    },
    zeroLine: {
      type: Boolean,
      default: false, // show horizontal axis line at y value 0
    },
    textColor: {
      type: String,
      default: "#9CA3AF",
    },
    labels: {
      type: Array,
      default: null,
    },
    showVerticalLineAtStart: {
      type: Boolean,
      default: false,
    },
    showOnlyMainDot: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number,
      default: 250,
    },
    forceZero: {
      type: Boolean,
      default: false,
    },
    defaultRaisedIndex: {
      type: Number,
      default: null,
    },
    yAxisUnit: {
      type: String,
      default: "",
    },
    showHoverLine: {
      type: Boolean,
      default: true,
    },
    highlightedIndexes: {
      type: Array,
      default: () => [],
    },
    showYGrid: {
      type: Boolean,
      default: false, // show y axis ticks as grid lines
    },
    numTicks: {
      type: Number,
      default: 3, // number of y axis ticks
    },
    showAllXTicks: {
      type: Boolean,
      default: false,
    },
    showValueHover: {
      type: Boolean,
      default: false,
    },
    xFilter: {
      type: Function,
      default: () => true,
    },
    xTickFormat: {
      type: Function,
      default: (d) => d,
    },
    yTickFormat: {
      type: Function,
      default: (d) => d,
    },
    preventScrollOnTouch: {
      type: Boolean,
      default: false,
    },
    format: {
      type: Function,
      default: (d) => (!isNaN(+d) ? d.toFixed(0) : "---"),
    },
    paintBackgroundIndex: {
      type: Number,
      default: null,
    },
    backgroundRectColor: {
      type: String,
      default: "#f3f4f6",
    },
    idLabel: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      width: 200,
      height: 96,
      hoverIndex: null,
    };
  },
  setup() {
    const container = ref(null);
    const sparkline = ref(null);
    return {
      container,
      sparkline,
    };
  },
  computed: {
    domain() {
      if (this.range) return this.range;

      const allData = [];

      this.data.forEach((dataset) => allData.push(...dataset));

      if (this.forceZero) allData.push({ value: 0 });

      // filter any null values to avoid forcing a zero
      const extent = d3.extent(
        allData.filter((e) => e.value !== null),
        (d) => +d.value,
      );

      // give 10% margin at the bottom
      const currentMinY = extent[0];
      let minY = currentMinY - (extent[1] - currentMinY) * 0.1;
      minY = minY < 0 ? 0 : minY;
      if (extent[0] > 0) extent[0] = minY;
      return extent;
    },
    x() {
      // return d3
      //   .scaleLinear()
      //   .domain([0, this.data.length ? this.data[0].length - 1 : 1])
      //   .range([
      //     this.margin.left + this.padding.left,
      //     this.width - this.margin.right - this.padding.right,
      //   ]);
      const startDate = this.getDate(this.data[0][0]?.name);
      const endDate = this.getDate(this.data[0][this.data[0].length - 1]?.name);
      return d3
        .scaleTime()
        .domain([new Date(startDate), new Date(endDate)])
        .range([
          this.margin.left + this.padding.left,
          this.width - this.margin.right - this.padding.right,
        ]);
    },
    y() {
      return d3[this.scale]()
        .domain(this.domain)
        .nice()
        .range([this.height - this.margin.bottom, this.margin.top]);
    },
    line() {
      return d3
        .line()
        .defined((d) => d.value !== null)
        .curve(d3[this.curve])
        .x((d) => {
          // const index = this.data[0].findIndex((e) => e.name === d.name);
          // d.name is just a year. convert to a full date object
          const date = this.getDate(d.name);
          return this.x(date);
        })
        .y((d) => this.y(d.value));
    },
    lineInitial() {
      // draws a line at all zeros
      return d3
        .line()
        .defined((d) => d.value !== null)
        .curve(d3[this.curve])
        .x((d) => {
          // const index = this.data[0].findIndex((e) => e.name === d.name);
          // return this.x(index);
          // d.name is just a year. convert to a full date object
          const date = this.getDate(d.name);
          return this.x(date);
        })
        .y((d) => this.y(0));
    },
    filteredData() {
      return this.data.map((e) => e.filter((d) => d.value !== null));
    },
    dateStart() {
      return this.data.length && this.data[0][0]
        ? this.formatDate(this.data[0][0].name)
        : "";
    },
    dateEnd() {
      return this.data.length && this.data[0][this.data[0].length - 1]
        ? this.formatDate(this.data[0][this.data[0].length - 1].name)
        : "";
    },
    // numTicks() {
    //   // if (this.width < 500) return this.data[0].length / 2;
    //   // return this.data[0].length;
    //   return 3;
    // },
  },
  watch: {
    hoverIndex() {
      this.emitHover();
    },
    hoverNum() {
      this.moveHoverLine();
    },
    data() {
      this.updateChart();
    },
    color() {
      this.updateColors();
    },
    highlighted() {
      this.highlight();
    },
    format() {
      this.updateChart();
    },
  },
  mounted() {
    this.setSize();
    this.createChart();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.container);
    } else {
      // for IE
      window.addEventListener("resize", this.resize);
    }
  },
  beforeUnmount() {
    if (window.ResizeObserver) {
      this.resizeObserver.unobserve(this.container);
    } else {
      // for IE
      window.removeEventListener("resize", this.resize);
    }
  },
  methods: {
    getDate(year) {
      const date = new Date();
      date.setFullYear(year);
      // set july 1st because is the middle of the year.
      date.setDate(1);
      date.setMonth(0); // 6
      return date;
    },
    emitHover() {
      // const index = this.hoverIndex || this.hoverNum;
      const index = this.hoverIndex;

      if (index === null) {
        this.$emit("hover", null);
      } else {
        this.$emit("hover", {
          // send the LAST dataset
          // data: { ...this.data[this.data.length - 1][index] },
          data: { ...this.data[0][index] },
          i: index,
          target: this.svg.select("#vertical-line")._groups[0][0],
        });
      }
    },
    setSize() {
      const container = this.container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        this.updateChart(false);
      }
    },
    updateChart(animate = true) {
      const t = d3.transition().duration(this.duration);
      if (!animate) t.duration(0);

      this.path = this.path.data(this.filteredData).join(
        (enter) =>
          enter
            .append("path")
            .attr("stroke-width", this.strokeWidth)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("class", "sparkline-path")
            .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
            .attr("stroke-dasharray", (d, i) => this.datasetStrokeDasharray[i])
            .attr("fill", "none")
            .attr("d", this.lineInitial)
            .call((enter) => enter.transition(t).attr("d", this.line)),
        (update) =>
          update.call((update) =>
            update
              .attr(
                "stroke-dasharray",
                (d, i) => this.datasetStrokeDasharray[i],
              )
              .transition(t)
              .attr("d", this.line),
          ),
        (exit) => exit.remove(),
      );

      if (this.showXAxis) {
        if (this.xAxisStyle) {
          // const labels = this.data[0] || [];
          // const useLabels = this.showAllXTicks
          //   ? labels.map((_, i) => i).filter(this.xFilter)
          //   : [0, labels.length - 1];
          // console.log(labels)
          this.xAxis
            .attr(
              "transform",
              "translate(0," + (this.height - this.margin.bottom) + ")",
            )
            .transition(t)
            .call(
              // let ticks = this.x.ticks();

              // const [minDate, maxDate] = this.x.domain();

              // // Add first tick if missing
              // if (+ticks[0] > +minDate) {
              //   ticks.unshift(minDate);
              // }

              // // Add last tick if missing
              // // if (+ticks[ticks.length - 1] < +maxDate) {
              // //   ticks.push(maxDate);
              // // }

              // console.log("ticks", ticks);

              d3
                .axisBottom(this.x)
                // .tickValues(useLabels)
                // .tickFormat((d) => this.xTickFormat(this.data[0][d]?.name) || d)
                // .tickValues(this.data[0].map((d) => this.getDate(d.name)))
                // never show more ticks than the data points
                .tickValues(
                  this.showAllXTicks
                    ? this.data[0]
                        .filter((d) => this.xFilter(d))
                        .map((d) => this.getDate(d.name))
                    : null,
                )
                .tickFormat((d) => {
                  // d is a date. I just want to use the year
                  return d.getFullYear();
                }),
            );
        } else {
          const textMargin = 0;
          this.leftText
            .attr("x", this.margin.left + textMargin)
            .attr("y", this.height - textMargin)
            .text(this.dateStart);
          this.rightText
            .attr("x", this.width - this.margin.right - textMargin)
            .attr("y", this.height - textMargin)
            .text(this.dateEnd);
        }
      }
      // UPDATE Y GRID
      if (this.showYGrid) {
        this.yGrid.transition(t).call(
          d3
            .axisRight(this.y)
            .tickSize(this.width - this.margin.right - this.margin.left)
            .tickFormat("")
            .ticks(this.numTicks),
        );
      }
      // UPDATE Y AXIS
      if (this.showYAxis) {
        if (this.yAxisStyle) {
          this.yAxis
            .transition(t)
            .call(
              d3
                .axisLeft(this.y)
                .tickFormat(this.percentFormat)
                .ticks(this.numTicks),
            );
        } else {
          const textMargin = 10;
          this.topText
            .attr("x", this.margin.left - textMargin)
            .attr("y", this.margin.top)
            .text(this.percentFormat(this.domain[1]));
          this.bottomText
            .attr("x", this.margin.left - textMargin)
            .attr("y", this.height - this.margin.bottom)
            .text(this.percentFormat(this.domain[0]));
        }
      }
      if (this.zeroLine) {
        this.zero
          .attr("x1", this.margin.left)
          // .attr("y1", this.y(0))
          .attr("y1", this.height - this.margin.bottom)
          .attr("x2", this.width - this.margin.right)
          // .attr("y2", this.y(0));
          .attr("y2", this.height - this.margin.bottom);
      }
      if (this.referenceDot !== null) this.translateReferenceDot();

      this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);

      this.drawBackgroundRect();

      this.createDots();
      this.highlight();
      this.createLabels();
      this.moveHoverLine();
    },
    updateColors() {
      this.path.attr("stroke", (d, i) => this.color[i] || this.defaultColor);
      this.dots
        .attr("fill", (d, i) => this.color[i] || this.defaultColor)
        .attr("stroke", (d, i) => this.color[i] || this.defaultColor);
    },
    highlight() {
      this.path
        .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
        .attr("stroke-width", this.strokeWidth);

      // raise the first line in the series
      if (this.defaultRaisedIndex !== null) {
        this.path
          .filter((d, i) => {
            return i === this.defaultRaisedIndex;
          })
          .raise();
      }

      this.path
        .filter((d, i) => {
          return i === this.highlighted;
        })
        .raise()
        .attr("stroke", this.highlightColor)
        .attr("stroke-width", this.highlightStrokeWidth);

      // raise dots
      this.dots
        .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
        .attr("fill", (d, i) => this.color[i] || this.defaultColor);

      // raise the first one
      if (this.defaultRaisedIndex !== null) {
        this.dots
          .filter((d, i) => {
            return i === this.defaultRaisedIndex;
          })
          .raise();
      }

      this.dots
        .filter((d, i) => {
          return i === this.highlighted;
        })
        .raise()
        .attr("stroke", this.highlightColor)
        .attr("fill", this.highlightColor);
    },
    drawBackgroundRect() {
      if (this.paintBackgroundIndex)
        this.backgroundRect
          .attr("x", this.x(0))
          .attr("y", this.margin.top)
          .attr("width", this.x(this.paintBackgroundIndex) - this.x(0))
          .attr("height", this.height - this.margin.bottom - this.margin.top)
          .attr("fill", this.backgroundRectColor);
    },
    createChart() {
      // https://observablehq.com/@d3/multi-line-chart
      if (!this.svg) {
        this.svg = d3
          .select(this.sparkline)
          .attr("viewBox", `0 0 ${this.width} ${this.height}`)
          .style("overflow", "visible");

        this.backgroundRect = this.svg.append("rect");
        this.drawBackgroundRect();

        this.createXAxis();
        this.createYAxis();
        this.createAxisTicks();

        // zero line
        if (this.zeroLine) {
          this.zero = this.svg
            .append("line")
            .attr("x1", this.margin.left)
            // .attr("y1", this.y(0))
            .attr("y1", this.height - this.margin.bottom)
            .attr("x2", this.width - this.margin.right)
            // .attr("y2", this.y(0))
            .attr("y2", this.height - this.margin.bottom)
            .attr("stroke", this.verticalLineColor)
            .attr("stroke-width", this.verticalLineStrokeWidth);
        }

        this.path = this.svg
          .append("g")
          .attr("class", "paths")
          .selectAll("path")
          .data(this.data)
          .join("path")
          .attr("stroke-width", this.strokeWidth)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("class", "sparkline-path")
          .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
          .attr("stroke-dasharray", (d, i) => this.datasetStrokeDasharray[i])
          .attr("fill", "none")
          .attr("d", this.line);

        this.createLabels();

        this.hoverLine = this.svg.append("g");
        this.hoverValue = this.svg.append("g").attr("id", "hover-value");
        this.hoverValue.append("rect").attr("fill", "white");

        this.hoverValue
          .append("text")
          .attr("class", "font-sans font-medium text-sm text-gray-800")
          .attr("text-anchor", "middle");

        this.showHoverValue();

        if (!this.showVerticalLineAtStart)
          this.hoverLine.attr("display", "none");

        this.createDots();
        this.createReferenceDot();

        this.hoverLine
          .append("line")
          .attr("x1", 0)
          .attr("y1", this.margin.top)
          .attr("x2", 0)
          .attr("y2", this.height - this.margin.bottom)
          .attr("stroke", this.verticalLineColor)
          .attr("stroke-width", this.verticalLineStrokeWidth)
          .attr("stroke-dasharray", "3,2")
          .attr("id", "vertical-line");

        this.hoverLine.attr(
          "transform",
          `translate(${this.x(this.hoverNum || 0)},0)`,
        );

        this.highlight();
        this.svg.call(this.hover);
        this.moveHoverLine();
      }
    },
    createLabels() {
      if (this.labels) {
        const textMargin = 10;
        this.labelsText = this.svg
          .append("g")
          .selectAll("text")
          .data(this.data)
          .enter()
          .append("text")
          .attr("x", this.width - this.margin.right + textMargin)
          .attr("y", (d) =>
            this.y(
              d[d.length - 1].value !== null
                ? d[d.length - 1].value
                : d[d.length - 2].value,
            ),
          )
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "middle")
          .style("font-size", "11px")
          .attr("fill", (d, i) => this.color[i] || this.defaultColor)
          .text((d, i) => this.labels[i]);
      }
    },
    createDots() {
      if (this.dots) {
        this.dots.remove();

        this.dots = this.svg
          .select(".dots")
          .selectAll("circle")
          .data(this.data)
          .enter()
          .append("circle")
          .attr("class", (d, i) => `dot dot-${i}`)
          .attr("r", this.dotRadius)
          .attr("fill", (d, i) => this.color[i] || this.defaultColor)
          .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
          .attr("opacity", (d, i) => {
            if (typeof d[d.length - 1].value === "number") {
              if (this.showOnlyMainDot) {
                if (i === this.data.length - 1) return 1;
                return 0;
              }
              return 1;
            }
            return 0;
          });
      } else {
        // new
        this.dots = this.svg
          .append("g")
          .attr("class", "dots")
          .selectAll("circle")
          .data(this.data)
          .enter()
          .append("circle")
          .attr("class", (d, i) => `dot dot-${i}`)
          .attr("r", this.dotRadius)
          .attr("fill", (d, i) => this.color[i] || this.defaultColor)
          .attr("stroke", (d, i) => this.color[i] || this.defaultColor)
          .attr("opacity", (d, i) => {
            if (typeof d[d.length - 1]?.value === "number") {
              if (this.showOnlyMainDot) {
                if (i === this.data.length - 1) return 1;
                return 0;
              }
              return 1;
            }
            return 0;
          });
      }
      this.moveDots();
    },
    moveDots() {
      this.dots.attr("display", null);

      const index =
        this.hoverNum !== null ? this.hoverNum : this.data[0]?.length - 1 || 0;

      // const x = index;
      // when working with dates:
      const x = this.getDate(this.data[0][index]?.name);

      this.dots
        .attr("transform", (d) => {
          return `translate(${this.x(x)},${this.y(d[index]?.value || 0)})`;
        })
        .attr("opacity", (d, i) => {
          // TODO: causes error if d[index] is undefined
          if (d[index] && d[index].value !== null) {
            if (this.showOnlyMainDot) {
              if (i === this.data.length - 1) return 1;
              return 0;
            }
            return 1;
          }
          return 0;
        });
    },
    resetDots() {
      if (this.data.length) {
        // translate to the start!
        this.dots
          .attr("transform", (d) => {
            // const x = d.length - 1;
            // when working with dates:
            // const x = this.getDate(this.data[0][d.length - 1]?.name);

            return `translate(${this.x(x)},${this.y(d[d.length - 1].value)})`;
          })
          .attr("opacity", (d, i) => {
            if (typeof d[d.length - 1].value === "number") {
              if (this.showOnlyMainDot) {
                if (i === this.data.length - 1) return 1;
                return 0;
              }
              return 1;
            }
            return 0;
          });
      }
    },
    createAxisTicks() {
      const size = 5;
      if (this.showYAxis) {
        if (!this.yAxisStyle) {
          // horizontal tick bottom
          this.svg
            .append("line")
            .attr("x1", this.margin.left)
            .attr("x2", this.margin.left - size)
            .attr("y1", this.height - this.margin.bottom)
            .attr("y2", this.height - this.margin.bottom)
            .attr("stroke", this.textColor)
            .attr("stroke-width", 1);
          // horizontal tick top
          this.svg
            .append("line")
            .attr("x1", this.margin.left)
            .attr("x2", this.margin.left - size)
            .attr("y1", this.margin.top)
            .attr("y2", this.margin.top)
            .attr("stroke", this.textColor)
            .attr("stroke-width", 1);
        }
      }
      if (this.showXAxis) {
        if (!this.xAxisStyle) {
          // vertical tick left
          this.svg
            .append("line")
            .attr("x1", this.margin.left)
            .attr("x2", this.margin.left)
            .attr("y1", this.height - this.margin.bottom)
            .attr("y2", this.height - this.margin.bottom + size)
            .attr("stroke", this.textColor)
            .attr("stroke-width", 1);
          // vertical tick right
          this.svg
            .append("line")
            .attr("x1", this.width - this.margin.right)
            .attr("x2", this.width - this.margin.right)
            .attr("y1", this.height - this.margin.bottom)
            .attr("y2", this.height - this.margin.bottom + size)
            .attr("stroke", this.textColor)
            .attr("stroke-width", 1);
        }
      }
    },
    createXAxis() {
      if (this.showXAxis) {
        if (this.xAxisStyle) {
          const labels = this.data[0] || [];
          // console.log("labels", labels);
          const useLabels = this.showAllXTicks
            ? labels.map((_, i) => i).filter(this.xFilter)
            : [0, labels.length - 1];
          this.xAxis = this.svg
            .append("g")
            .attr("class", "ot-x-axis")
            .attr(
              "transform",
              "translate(0," + (this.height - this.margin.bottom) + ")",
            )
            .attr("fill", this.textColor)
            .call(
              d3
                .axisBottom(this.x)
                .tickValues(
                  this.showAllXTicks
                    ? this.data[0]
                        .filter((d) => this.xFilter(d))
                        .map((d) => this.getDate(d.name))
                    : null,
                )
                // .tickValues(
                //   this.data[0].length <= 2
                //     ? this.data[0].map((d) => this.getDate(d.name))
                //     : null,
                // )
                // .tickValues(this.data[0].map((d) => this.getDate(d.name)))
                .tickFormat((d) => {
                  // console.log(d);
                  // d is a date. I just want to use the year
                  return d.getFullYear();
                  return d;
                }),
            );
        } else {
          const textMargin = 0;
          this.leftText = this.svg
            .append("text")
            .attr("x", this.margin.left + textMargin)
            .attr("y", this.height - textMargin)
            .attr("text-anchor", "start")
            .style("font-size", "11px")
            .attr("fill", this.textColor)
            .text(this.dateStart);
          this.rightText = this.svg
            .append("text")
            .attr("x", this.width - this.margin.right - textMargin)
            .attr("y", this.height - textMargin)
            .attr("text-anchor", "end")
            .style("font-size", "11px")
            .attr("fill", this.textColor)
            .text(this.dateEnd);
        }
      }
    },
    createYAxis() {
      if (this.showYGrid) {
        this.yGrid = this.svg
          .append("g")
          .attr("class", "ot-y-grid")
          .attr("transform", `translate(${this.margin.left},0)`)
          .call(
            d3
              .axisRight(this.y)
              .tickSize(this.width - this.margin.right - this.margin.left)
              .tickFormat("")
              .ticks(this.numTicks),
          );
      }
      if (this.showYAxis) {
        if (this.yAxisStyle) {
          this.yAxis = this.svg
            .append("g")
            .attr("class", "ot-y-axis")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("fill", this.textColor)
            .call(
              d3
                .axisLeft(this.y)
                .tickFormat(this.percentFormat)
                // normal d3 format but use "." for thousands and "," for decimal
                .ticks(this.numTicks),
            );
        } else {
          const textMargin = 10;
          this.topText = this.svg
            .append("text")
            .attr("x", this.margin.left - textMargin)
            .attr("y", this.margin.top)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .style("font-size", "11px")
            .attr("fill", this.textColor)
            .text(this.percentFormat(this.domain[1]));
          this.bottomText = this.svg
            .append("text")
            .attr("x", this.margin.left - textMargin)
            .attr("y", this.height - this.margin.bottom)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .style("font-size", "11px")
            .attr("fill", this.textColor)
            .text(this.percentFormat(this.domain[0]));
        }
      }
    },
    createReferenceDot() {
      if (this.referenceDot !== null) {
        this.refDot = this.svg.append("g").attr("class", "refdot");
        this.refDot
          .append("circle")
          .attr("r", this.dotRadius) // refDotRadius
          .attr("fill", this.color[this.data.length - 1]); // refDotColor
        this.translateReferenceDot();
      }
    },
    translateReferenceDot() {
      if (
        this.data.length &&
        typeof this.data[0][this.referenceDot].value === "number"
      ) {
        this.refDot
          .attr(
            "transform",
            `translate(${this.x(this.referenceDot)},${this.y(
              this.data[0][this.referenceDot].value,
            )})`,
          )
          .attr("opacity", 1);
      } else {
        this.refDot.attr("opacity", 0);
      }
    },
    moveHoverLine() {
      if (this.hoverNum === null) {
        if (this.showLastPoint) {
          this.resetDots();
        } else this.dot?.attr("display", "none");
        this.hoverLine.attr("display", "none");
      } else {
        if (this.showHoverLine) this.hoverLine.attr("display", null);
        else this.hoverLine.attr("display", "none");
        this.moveDots();

        // const x = this.hoverNum;
        const x = this.getDate(this.data[0][this.hoverNum]?.name);

        this.hoverLine.attr("transform", `translate(${this.x(x)},0)`);
        this.hoverLine
          .select("line")
          .attr("y2", this.height - this.margin.bottom);
      }
      this.showHoverValue();
      this.emitHover();
    },
    showHoverValue() {
      // HOVER VALUE
      if (this.showValueHover) {
        const value = this.data[0]?.[this.hoverNum]?.value;

        if (typeof value === "number") {
          this.hoverValue
            .attr("display", null)
            .attr(
              "transform",
              `translate(${this.x(this.hoverNum)},${this.y(value) - 12} )`,
            );

          const displayValue = this.format(value) + this.yAxisUnit;

          const width = displayValue.length * 10;

          this.hoverValue
            .select("rect")
            .attr("fill", "white")
            .attr("stroke", "currentColor")
            .attr("class", "ot-hover-number-box")
            .attr("rx", 4)
            .attr("width", width)
            .attr("height", 21)
            .attr("transform", `translate(-${width / 2},-16 )`);

          this.hoverValue.select("text").text(displayValue);
        } else this.hoverValue.attr("display", "none");
      }
    },
    hover() {
      if ("ontouchstart" in document)
        this.svg
          .style("-webkit-tap-highlight-color", "transparent")
          .on("touchmove", moved)
          .on("touchstart", entered)
          .on("touchend", left);
      else
        this.svg
          .on("mousemove", moved)
          .on("mouseenter", entered)
          .on("mouseleave", left);

      const that = this;

      function moved(event) {
        if (this.preventScrollOnTouch) event.preventDefault();

        let mouse;

        if (window.TouchEvent && event instanceof TouchEvent) {
          mouse = d3.pointer(event.touches[0], that.svg.node());
        } else mouse = d3.pointer(event, that.svg.node());

        const x = that.x.invert(mouse[0]);

        // let index = Math.round(x);
        // x is a darte object. I need to find the closest year
        // const year = x.getFullYear();

        // let index = that.data[0].findIndex((e) => e.name === year);

        // x is a date object. I need to find the closest date within this.data[0] (for every .name property, run it through the getDate function)
        const dates = that.data[0].map((d) => that.getDate(d.name));
        // compute the distance between x and each date
        const distances = dates.map((d) => Math.abs(d - x));
        // find the closest index
        const closestIndex = distances.indexOf(Math.min(...distances));
        let index = closestIndex;

        if (index < 0) index = 0;
        // console.log(index);
        if (index >= that.data[0].length) index = that.data[0].length - 1;
        that.hoverIndex = index || 0;
      }

      function entered() {}

      function left() {
        that.hoverIndex = null;
      }
    },
    formatDate(val) {
      return val;
    },
    percentFormat(value) {
      return this.format(value) + this.yAxisUnit;
    },
  },
};
</script>
<style>
.ot-sparkline .ot-x-axis .domain {
  /* stroke: #cbd5e1; */
  display: none;
}
.ot-sparkline .ot-y-axis .domain {
  display: none;
}
.ot-sparkline .ot-y-grid,
.ot-sparkline .ot-y-grid line {
  @apply text-gray-300;
}
.ot-sparkline .ot-y-grid .domain {
  display: none;
}
.ot-sparkline .ot-y-axis .tick text {
  @apply -translate-y-2 translate-x-0.5;
  text-anchor: start;
}
.ot-sparkline .ot-hover-number-box {
  @apply text-gray-300;
}
</style>

<template>
  <div ref="container" class="rose-chart-container">
    <svg
      ref="svg"
      class="rose-chart max-w-full overflow-visible print:w-full"
      :width="width"
      :height="height"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
          <stop class="stop1" offset="0%" stop-color="rgba(42, 157, 143, 1)" />
          <stop
            class="stop2"
            offset="100%"
            stop-color="rgba(255, 219, 100,1)"
          />
          <!-- <stop
            class="stop3"
            offset="100%"
            stop-color="rgba(244, 162, 97, 1)"
          /> -->
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script>
// https://observablehq.com/@d3/donut-chart
import * as d3 from "d3";
export default {
  name: "RoseChart",
  props: {
    data: {
      type: Array,
      default: () => [
        { id: 1, name: "Val 1", value: 70, color: "#bbbbbb" },
        { id: 2, name: "Val 2", value: 79, color: "teal" },
        { id: 3, name: "Val 3", value: 45, color: "salmon" },
        { id: 4, name: "Val 4", value: 25, color: "black" },
      ],
    },
    showLabels: {
      type: Boolean,
      default: true, // show category names
    },
    showValues: {
      type: Boolean,
      default: true, // show category names
    },
    duration: {
      type: Number,
      default: 500, // time of animation in ms
    },
    cornerRadius: {
      type: Number,
      default: 0, // rounding of corners
    },
    padAngle: {
      type: Number,
      default: 0.1, // space between shapes
    },
    padRadius: {
      type: Number,
      default: 0.25, // space between shapes
    },
    labelsOutside: {
      type: Boolean,
      default: true, // show labels outside of shapes
    },
    innerRadius: {
      type: Number,
      default: 0, // space in the center
    },
    strokeWidth: {
      type: Number,
      default: 0, // space between shapes
    },
    format: {
      type: Function,
      default: (d) => (+d).toFixed(0) + "%",
    },
    showRefLines: {
      type: Boolean,
      default: false,
    },
    refLineColor: {
      type: String,
      default: "#6b7280",
    },
    bgColor: {
      type: String,
      default: "transparent",
    },
    hoverColor: {
      type: String,
      default: "transparent",
    },
    valueLabelColor: {
      type: String,
      default: "#6b7280",
    },
    strokeColor: {
      type: String,
      default: "white",
    },
    max: {
      type: Number,
      default: null,
    },
    circularLabels: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: [Number, String],
      default: null,
    },
    lineLabelDistance: {
      type: Number,
      default: 20,
    },
    paddingLineLabel: {
      type: Number,
      default: 40,
    },
    showCursorPointer: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      width: 200,
      height: 200,
      hoverIndex: null,
    };
  },
  computed: {
    // pie generator to calculate start and end angles
    pie() {
      return d3.pie().value(this.computedMax).padAngle(this.padAngle); // make all the portions equal
    },
    // return array with original data + start and end angles for each item
    arcs() {
      return this.pie(this.data);
    },
    // return radius based on available space
    radius() {
      return Math.min(this.width, this.height) / 2;
    },
    // return max of data points
    computedMax() {
      if (this.max) return this.max;
      return d3.max(this.data, (d) => d3.max([d.value, d.refValue])) || 100;
    },
    outerScale() {
      return (
        d3
          // .scaleSqrt()
          .scaleLinear()
          .range([this.innerRadius * this.radius, this.radius])
          .domain([0, this.computedMax])
      );
    },
    // arc generator to produce path data
    arc() {
      return d3
        .arc()
        .innerRadius(this.radius * this.innerRadius)
        .outerRadius((d) => this.outerScale(d.data.value))
        .padRadius(this.padRadius * this.radius)
        .cornerRadius(this.cornerRadius);
    },
    refArc() {
      return d3
        .arc()
        .innerRadius((d) => this.outerScale(d.data.refValue))
        .outerRadius((d) => this.outerScale(d.data.refValue))
        .padRadius(this.padRadius * this.radius)
        .padAngle(this.padAngle)
        .cornerRadius(this.cornerRadius);
    },
    labelRefArc() {
      const separation = 16;
      return d3
        .arc()
        .innerRadius(this.width / 2 + separation)
        .outerRadius(this.width / 2 + separation);
      // .padRadius(this.padRadius * this.radius)
      // .padAngle(this.padAngle)
      // .cornerRadius(this.cornerRadius)
    },
    // arc generator to produce path data for the clickable pizza slices
    arcClickable() {
      return d3
        .arc()
        .innerRadius((d) => this.outerScale(0))
        .outerRadius((d) => this.outerScale(this.computedMax))
        .padRadius(this.padRadius * this.radius)
        .padAngle(0)
        .cornerRadius(this.cornerRadius);
    },
    arcBg() {
      return d3
        .arc()
        .innerRadius((d) => this.outerScale(0))
        .outerRadius((d) => this.outerScale(this.computedMax))
        .padRadius(this.padRadius * this.radius)
        .padAngle(this.padAngle)
        .cornerRadius(this.cornerRadius);
    },
  },
  watch: {
    data() {
      this.updateChart();
    },
    circularLabels() {
      this.updateChart();
    },
    showRefLines() {
      this.refArcsContainer
        .transition()
        .duration(this.duration)
        .attr("opacity", this.showRefLines ? 1 : 0);
    },
    highlighted(newVal, prevVal) {
      if (newVal) {
        // d3.select(`#arc-clickable-${newVal}`).attr("fill", this.hoverColor);
        // d3.select(`#arc-${newVal}`).attr("fill", (d) => d.data.hoverColor);
        // d3.select(`#arc-clickable-${prevVal}`).attr("fill", this.bgColor);
        // d3.select(`#arc-${prevVal}`).attr("fill", (d) => d.data.color);

        // make opacity of all arcs 0.5
        this.arcsContainer.selectAll(".arc").attr("opacity", 0.3);
        // except the highlighted one
        this.arcsContainer.select(`#arc-${newVal}`).attr("opacity", 1).raise();
      } else {
        this.arcsContainer.selectAll(".arc").attr("opacity", 1);

        // d3.select(`#arc-clickable-${prevVal}`).attr("fill", (d) =>
        //  d.data.id === this.highlighted ? this.hoverColor : this.bgColor,
        //);
        // d3.select(`#arc-${prevVal}`).attr("fill", (d) => d.data.color);
      }
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
        const width = container.clientWidth;
        this.width = width;
        this.height = width;
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
    // scale to position labels
    labelArc(padding = this.paddingLineLabel, inner = false) {
      const radius = (d) => {
        let outerRadius;
        // if (inner) {
        //   outerRadius = this.outerScale(d.data.value);
        // } else

        {
          outerRadius = this.labelsOutside
            ? this.outerScale(this.computedMax)
            : this.outerScale(d.data.value);
        }

        return outerRadius + padding;
      };

      return d3.arc().innerRadius(radius).outerRadius(radius);
    },
    draw() {
      // position chart
      this.svg.attr(
        "transform",
        `translate(${this.width / 2} ${this.height / 2})`,
      );

      const that = this; // store component instance

      // format label
      function label(val) {
        // return val.toFixed(that.decimals) + "%";
        return that.format(val);
      }

      // animate drawing of arcs
      function markeArcTween(arc) {
        return function arcTween(a) {
          const oldMax = this._current.value;
          const newMax = a.value;
          const oldVal = this._current.data.value;

          // this scale needs to be linear, not sqrt
          const outerScale = d3
            .scaleLinear()
            .range([0, newMax])
            .domain([0, oldMax]);

          const oldValInNewScale = outerScale(oldVal);

          // we recalculate the value "as it would be" in the new scale, so there are no jumps in the transition
          this._current.data.value = oldValInNewScale;

          var i = d3.interpolate(this._current, a);

          this._current = i(0);

          return function (t) {
            const interpolated = i(t);
            return that[arc](interpolated);
          };
        };
      }

      const arcTween = markeArcTween("arc");
      const refArcTween = markeArcTween("refArc");
      const labelArcTween = markeArcTween("labelRefArc");

      // function arcTween(a) {
      //   const oldMax = this._current.value;
      //   const newMax = a.value;
      //   const oldVal = this._current.data.value;

      //   // this scale needs to be linear, not sqrt
      //   const outerScale = d3
      //     .scaleLinear()
      //     .range([0, newMax])
      //     .domain([0, oldMax]);

      //   const oldValInNewScale = outerScale(oldVal);

      //   // we recalculate the value "as it would be" in the new scale, so there are no jumps in the transition
      //   this._current.data.value = oldValInNewScale;

      //   var i = d3.interpolate(this._current, a);

      //   this._current = i(0);

      //   return function (t) {
      //     const interpolated = i(t);
      //     return that.arc(interpolated);
      //   };
      // }

      // animate positions of labels
      function textPositionTween(d) {
        this._current = this._current || d;
        const oldMax = this._current.value;
        const newMax = d.value;
        const oldVal = this._current.data.value;

        // this scale needs to be linear, not sqrt
        const outerScale = d3
          .scaleLinear()
          .range([0, newMax])
          .domain([0, oldMax]);

        const oldValInNewScale = outerScale(oldVal);

        // we recalculate the value "as it would be" in the new scale, so there are no jumps in the transition
        this._current.data.value = oldValInNewScale;
        var i = d3.interpolate(this._current, d);
        this._current = i(0);

        return function (t) {
          var d2 = i(t);
          var pos = that.labelsOutside
            ? that.labelArc().centroid(d2)
            : that.arc.centroid(d2);
          return `translate(${pos})`;
        };
      }

      function textTween(d) {
        // we access the parentElement because we are tweening the tspan element but the data is in the text element
        var i = d3.interpolate(this.parentElement._current.value, d.data.value);
        this.parentElement._current.value = i(0);
        return function (t) {
          d3.select(this).text(label(i(t)));
        };
      }

      // draw arcs
      this.arcsPath = this.arcsContainer
        .attr("stroke", this.strokeColor)
        .attr("stroke-width", this.strokeWidth)
        .selectAll("path")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("fill", this.fill)
              .attr("opacity", this.opacity)
              .each(function (d) {
                this._current = {
                  ...d,
                  data: { ...d.data, value: 0 }, // set the value in data to 0
                };
              })
              .attr("id", (d) => `arc-${d.data.id}`)
              .attr("d", this.arc)
              .attr("class", "arc pointer-events-none")
              .call((path) =>
                path
                  .transition()
                  .duration(this.duration)
                  .attrTween("d", arcTween),
              ),
          (update) => {
            return update.call((path) =>
              path
                .transition()
                .duration(this.duration)
                .attrTween("d", arcTween)
                .attr("fill", this.fill)
                .attr("opacity", this.opacity),
            );
          },
          (exit) =>
            exit.call((path) =>
              path
                .each((path) => (path.endAngle = path.startAngle))
                .transition()
                .duration(this.duration)
                .attrTween("d", arcTween)
                .remove(),
            ),
        );

      this.labelArcsContainer
        .attr("stroke-width", this.strokeWidth)
        .selectAll("path")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("fill", (d) => null)
              .attr("id", (d) => `label-path-${d.data.id}`)
              .attr("stroke", (d) => this.refLineColor)
              .attr("stroke-width", this.strokeWidth)
              .each(function (d) {
                this._current = {
                  ...d,
                  data: { ...d.data, value: 0 }, // set the value in data to 0
                };
              })
              .attr("d", this.labelRefArc)
              .call((path) =>
                path
                  .transition()
                  .duration(this.duration)
                  .attrTween("d", labelArcTween),
              ),
          (update) => {
            return update.call((path) =>
              path
                .transition()
                .duration(this.duration)
                .attrTween("d", labelArcTween)
                .attr("stroke", (d) => this.refLineColor),
            );
          },
          (exit) =>
            exit.call((path) =>
              path
                .each((path) => (path.endAngle = path.startAngle))
                .transition()
                .duration(this.duration)
                .attrTween("d", labelArcTween)
                .remove(),
            ),
        );

      // this article explains very well how to place labels on the arcs
      // https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/
      // add labels
      const dy = 4;

      this.textsContainer
        .raise()
        .selectAll("text")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) => {
            if (this.circularLabels)
              return (
                enter
                  .append("text")
                  .append("textPath") //append a textPath to the text element
                  .attr("xlink:href", (d) => `#label-path-${d.data.id}`) //place the ID of the path here
                  // .attr("alignment-baseline", "top")
                  .attr("text-anchor", "middle")
                  // if start angle is greater than 180 degrees, then use 75% offset, else use 25%
                  .attr("startOffset", (d) => {
                    const tolerance = Math.PI / 36; // 5 degrees
                    return Math.PI / 2 - tolerance <= d.startAngle &&
                      d.startAngle < (Math.PI * 3) / 2 - tolerance
                      ? "75%"
                      : "25%";
                  })
                  .attr("dy", dy)
                  .attr("fill", (d) => d.data.textColor || null)
                  .each(function (d) {
                    this._current = {
                      ...d,
                      data: { ...d.data, value: 0 }, // set the value in data to 0
                    };
                  })
                  .call((text) =>
                    text
                      .append("tspan")
                      .attr("class", "rose-label")
                      .text((d) => d.data.name)
                      .style("display", this.showLabels ? null : "none")
                      .attr("dy", dy)
                      .attr("font-size", "11px"),
                  )
                  .call((text) =>
                    text
                      .transition()
                      .duration(this.duration)
                      // .delay(2*delay)
                      .attrTween("transform", textPositionTween),
                  )
              );
            // regular labels
            else {
              return enter
                .append("text")
                .attr("class", "group")
                .attr("alignment-baseline", "central")
                .attr("cursor", "pointer")
                .attr("text-anchor", (d) => {
                  if (this.labelsOutside)
                    return this.labelArc().centroid(d)[0] > 0 ? "start" : "end";
                  else return "middle";
                })
                .attr("transform", (d) =>
                  this.labelsOutside
                    ? `translate(${this.labelArc().centroid(d)})`
                    : `translate(${this.arc.centroid(d)})`,
                )
                .attr("fill", (d) => d.data.textColor || null)
                .each(function (d) {
                  this._current = {
                    ...d,
                    data: { ...d.data, value: 0 }, // set the value in data to 0
                  };
                })
                .call((text) =>
                  text
                    .append("tspan")
                    .attr("class", "rose-label")
                    .attr("y", this.showValues ? "-0.4em" : null)
                    .text((d) => d.data.name)
                    .style("display", this.showLabels ? null : "none"),
                )
                .call((text) =>
                  text
                    .append("tspan")
                    .attr("class", "value")
                    .attr("x", 0)
                    .attr("dy", "1.1em")
                    .attr("fill", this.valueLabelColor)
                    .text(label(0))
                    .transition()
                    .duration(this.duration)
                    // .delay(2*delay)
                    // .tween("text", textTween)
                    .text((d) => label(d.data.value))
                    .style("display", this.showValues ? null : "none"),
                )
                .call((text) =>
                  text
                    .transition()
                    .duration(this.duration)
                    // .delay(2*delay)
                    .attrTween("transform", textPositionTween),
                )
                .on("click", (e, d) => {
                  that.$emit("select", {
                    target: document.getElementById(`arc-${d.data.id}`),
                    data: d,
                  });
                })
                .on("mouseenter", function (event, d) {
                  d3.select(`#arc-clickable-${d.data.id}`).attr(
                    "fill",
                    that.hoverColor,
                  );
                  // d3.select(`#arc-${d.data.id}`).attr(
                  //   "fill",
                  //   d.data.hoverColor
                  // );

                  that.$emit("hover", {
                    target: this,
                    data: d,
                  });
                })
                .on("mouseleave", function (event, d) {
                  that.$emit("hover", null);
                  d3.select(`#arc-clickable-${d.data.id}`).attr("fill", (d) =>
                    d.data.id === that.highlighted
                      ? that.hoverColor
                      : that.bgColor,
                  );
                  d3.select(`#arc-${d.data.id}`).attr("fill", (d) =>
                    d.data.id === that.highlighted
                      ? d.data.hoverColor
                      : d.data.color,
                  );
                  // d3.select(`#arc-${d.data.id}`).attr("opacity", (d) =>
                  //   d.data.id === that.highlighted ? 1 : "0.5"
                  // );
                });
            }
          },
          (update) => {
            return update.call((text) => {
              if (this.circularLabels) {
                return text
                  .transition()
                  .duration(this.duration)
                  .call((text) =>
                    text.select(".rose-label").text((d) => d.data.name),
                  )
                  .call((text) =>
                    text.select(".value").text((d) => label(d.data.value)),
                  );
              }
              // regular labels
              else {
                return (
                  text
                    .transition()
                    .duration(this.duration)
                    // .delay(delay)
                    .attrTween("transform", textPositionTween)
                    .attr("text-anchor", (d) => {
                      if (this.labelsOutside)
                        return this.labelArc().centroid(d)[0] > 0
                          ? "start"
                          : "end";
                      else return "middle";
                    })
                    .call((text) =>
                      text.select(".rose-label").text((d) => d.data.name),
                    )
                    .call((text) =>
                      text.select(".value").text((d) => label(d.data.value)),
                    )
                );
              }
            });
          },
          (exit) =>
            exit.call((text) => {
              if (this.circularLabels) {
                return (
                  text
                    .each((text) => {
                      text.endAngle = text.startAngle;
                      text.value = 0;
                    })
                    .transition()
                    .duration(this.duration)
                    .attr("opacity", 0)
                    // .attrTween("transform", textPositionTween)
                    .remove()
                    .select(".value")
                    .tween("text", textTween)
                );
              } else {
                return (
                  text
                    .transition()
                    .duration(this.duration)
                    // .delay(delay)
                    .attrTween("transform", textPositionTween)
                    .attr("text-anchor", (d) => {
                      if (this.labelsOutside)
                        return this.labelArc().centroid(d)[0] > 0
                          ? "start"
                          : "end";
                      else return "middle";
                    })
                    .select(".value")
                    // .tween("text", textTween)
                    .text((d) => label(d.data.value))
                );
              }
            }),
        );

      // REF ARCS
      this.refArcsContainer
        .attr("stroke-width", this.strokeWidth)
        .selectAll("path")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("fill", (d) => null)
              .attr("stroke", (d) => this.refLineColor)
              .attr("stroke-width", this.strokeWidth)
              .each(function (d) {
                this._current = {
                  ...d,
                  data: { ...d.data, value: 0 }, // set the value in data to 0
                };
              })
              .attr("d", this.refArc)
              .call((path) =>
                path
                  .transition()
                  .duration(this.duration)
                  .attrTween("d", refArcTween),
              ),
          (update) => {
            return update.call((path) =>
              path
                .transition()
                .duration(this.duration)
                .attrTween("d", refArcTween)
                .attr("stroke", (d) => this.refLineColor),
            );
          },
          (exit) =>
            exit.call((path) =>
              path
                .each((path) => (path.endAngle = path.startAngle))
                .transition()
                .duration(this.duration)
                .attrTween("d", refArcTween)
                .remove(),
            ),
        );

      this.drawLines();

      this.drawClickableArcs();

      this.drawBgArcs();
    },
    fill(d) {
      if (d.data.color === "gradient") {
        return "url(#gradient)";
      } else {
        return d.data.color;
        // return d.data.id === this.highlighted
        //   ? d.data.hoverColor
        //   : d.data.color;
      }
    },
    opacity(d) {
      if (!this.highlighted) return 1;
      return d.data.id === this.highlighted ? 1 : 0.3;
    },
    drawClickableArcs() {
      const that = this;
      const cursorClass = that.showCursorPointer ? "cursor-pointer" : "";

      const opacity = 0.3;

      this.arcsClickableContainer
        .selectAll("path")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("path")
              .each(function (d) {
                this._current = {
                  ...d,
                  data: { ...d.data, value: 0 }, // set the value in data to 0
                };
              })
              .attr("d", this.arcClickable)
              .attr("id", (d) => `arc-clickable-${d.data.id}`)
              .attr("class", `arc-clickable ${cursorClass}`)

              .on("mouseenter", function (event, d) {
                // d3.select(this).attr("fill", that.hoverColor);
                // d3.select(`#arc-${d.data.id}`).attr("fill", d.data.hoverColor);

                // opacity of all others to 30%
                that.svg.selectAll(".arc").attr("opacity", opacity);
                // set opacity of this one to 1
                that.svg.select(`#arc-${d.data.id}`).attr("opacity", 1);

                that.$emit("hover", {
                  target: document.getElementById(`arc-${d.data.id}`),
                  data: d,
                });
              })
              .on("mouseleave", function (event, d) {
                that.$emit("hover", null);

                // opacity of all to 100%
                // that.svg.selectAll(".arc").attr("opacity", 1);

                // d3.select(this).attr("fill", (d) =>
                //   d.data.id === that.highlighted
                //     ? that.hoverColor
                //     : that.bgColor
                // );
                // d3.select(`#arc-${d.data.id}`).attr("fill", (d) =>
                //   d.data.id === that.highlighted
                //     ? d.data.hoverColor
                //     : d.data.color
                // );

                // d3.select(this).attr("fill", (d) =>
                //   d.data.id === that.highlighted
                //     ? that.hoverColor
                //     : that.bgColor
                // );

                // console.log("here");

                that.svg.selectAll(".arc").attr("opacity", that.opacity);

                // this.svg
                //   .select(`#arc-${d.data.id}`)
                //   .attr("opacity", (d) =>
                //     d.data.id === that.highlighted ? 1 : opacity
                //   );
              })
              .on("click", (e, d) => {
                that.$emit("select", {
                  target: document.getElementById(`arc-${d.data.id}`),
                  data: d,
                });
              }),
          (update) => {
            return update.call((path) =>
              path
                .attr("d", this.arcClickable)
                .transition()
                .duration(this.duration),
            );
          },
          (exit) =>
            exit.call((path) =>
              path
                .each((path) => (path.endAngle = path.startAngle))
                .attr("d", this.arcClickable)
                .remove(),
            ),
        );
    },
    drawBgArcs() {
      this.arcsBgContainer
        .selectAll("path")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("path")
              .each(function (d) {
                this._current = {
                  ...d,
                  data: { ...d.data, value: 0 }, // set the value in data to 0
                };
              })
              .attr("d", this.arcBg)
              .attr("id", (d) => `arc-bg-${d.data.id}`)
              .attr("class", `arc-bg`)
              .attr("fill", (d) =>
                d.data.id === this.highlighted ? this.hoverColor : this.bgColor,
              ),
          (update) => {
            return update.call((path) =>
              path
                .attr("d", this.arcBg)
                .transition()
                .duration(this.duration)
                .attr("fill", (d) =>
                  d.data.id === this.highlighted
                    ? this.hoverColor
                    : this.bgColor,
                ),
            );
          },
          (exit) =>
            exit.call((path) =>
              path
                .each((path) => (path.endAngle = path.startAngle))
                .attr("d", this.arcBg)
                .remove(),
            ),
        );
    },
    drawLines() {
      const distance = this.lineLabelDistance;

      this.linesContainer
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("opacity", this.circularLabels ? 0 : 1)
        .selectAll("line")
        .data(this.arcs, (d) => d.data.id)
        .join(
          (enter) =>
            enter
              .append("line")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", 0)
              .style(
                "display",
                this.showLabels || this.showValues ? null : "none",
              )
              .call((line) =>
                line
                  .transition()
                  .duration(this.duration)
                  .attr("x1", (d) => this.labelArc(0, true).centroid(d)[0])
                  .attr("y1", (d) => this.labelArc(0, true).centroid(d)[1])
                  .attr("x2", (d) => this.labelArc(distance).centroid(d)[0])
                  .attr("y2", (d) => this.labelArc(distance).centroid(d)[1]),
              ),
          (update) => {
            return update
              .style(
                "display",
                this.showLabels || this.showValues ? null : "none",
              )
              .call((line) =>
                line

                  .transition()
                  .duration(this.duration)
                  .attr("x1", (d) => this.labelArc(0, true).centroid(d)[0])
                  .attr("y1", (d) => this.labelArc(0, true).centroid(d)[1])
                  .attr("x2", (d) => this.labelArc(distance).centroid(d)[0])
                  .attr("y2", (d) => this.labelArc(distance).centroid(d)[1]),
              );
          },
          (exit) =>
            exit.call((line) =>
              line
                .transition()
                .duration(this.duration)
                .attr("x2", 0)
                .attr("y2", 0)
                .attr("opacity", 0)
                .remove(),
            ),
        );
    },
    updateChart() {
      this.draw();
    },
    createChart() {
      if (!this.svg) {
        this.svg = d3.select(this.$refs.svg).append("g");

        this.arcsBgContainer = this.svg
          .append("g")
          .attr("class", "events-none");

        this.linesContainer = this.svg
          .append("g")
          .attr("class", "lines")
          .attr("opacity", this.circularLabels ? 0 : 1);
        this.arcsContainer = this.svg.append("g");
        this.refArcsContainer = this.svg
          .append("g")
          .attr("class", "ref-arcs")
          .attr("opacity", this.showRefLines ? 1 : 0);

        this.arcsClickableContainer = this.svg
          .append("g")
          // .attr("class", "cursor-pointer")
          .attr("fill", "transparent")
          .attr("stroke-width", 0);

        this.labelArcsContainer = this.svg
          .append("g")
          .attr("class", "label-arcs hidden")
          .attr("opacity", 0);

        this.textsContainer = this.svg
          .append("g")
          .attr("class", "labels fill-current");

        this.draw();
      }
    },
  },
};
</script>

<style>
.rose-chart {
  overflow: visible !important;
}

.rose-label {
  @apply group-hover:underline;
}
</style>

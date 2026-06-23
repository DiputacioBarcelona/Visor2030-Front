<template>
  <div ref="container" class="treemap-container">
    <svg
      :id="id"
      ref="treemap"
      role="img"
      :aria-labelledby="id"
      :aria-label="title"
      :width="width"
      :height="height"
      class="max-w-full"
      preserveAspectRatio="xMidYMid meet"
    ></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import { number } from "@/utils/filters";
import { getCurrentInstance } from "vue";

export default {
  name: "TreeMap",
  props: {
    data: {
      type: Object,
      default: () => ({
        name: "root",
        children: [
          {
            data: {
              id: "data1",
              name: "data1",
              value: 57,
              color: "#d97706",
            },
            id: "data1",
          },
          {
            data: {
              id: "data2",
              name: "data2",
              value: 33,
              color: "#64748b",
            },
            id: "data2",
          },
          {
            data: {
              id: "data3",
              name: "data3",
              value: 8,
              color: "#f43f5e",
            },
            id: "data3",
          },
          {
            data: { id: "data4", name: "data4", value: 20, color: "#737373" },
            id: "data4",
          },
        ],
      }),
    },
    // index: {
    //   type: Number,
    //   default: 0,
    // },
    unit: {
      type: String,
      default: "%",
    },
    title: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    hasRoundBorders: {
      type: Boolean,
      default: false,
    },
    showPercentage: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number,
      default: 300,
    },
    opacity: {
      type: Number,
      default: 1,
    },
    padding: {
      type: [Number, String],
      default: 2,
    },
    useGradients: {
      type: Boolean,
      default: false,
    },
    startGradientOpacity: {
      type: Number,
      default: 0.1,
    },
    endGradientOpacity: {
      type: Number,
      default: 0.05,
    },
  },
  emits: ["hover", "select"],
  data() {
    return {
      width: 200,
      height: 96,
    };
  },
  setup() {
    const instance = getCurrentInstance();
    const uid = instance?.uid;
    const id = instance?.props.id || `treemap-${uid}`;
    return {
      id,
    };
  },
  computed: {
    hierarchicalData() {
      return this.data;
    },
    root() {
      const treemap = (data) =>
        d3
          .treemap()
          .tile(d3.treemapResquarify)
          .size([this.width, this.height])
          .padding(this.padding)
          .round(this.hasRoundBorders)(
          d3
            .hierarchy(data)
            // .sum((d) => {
            //   console.log(d.data?.value || 0);
            //   return d.data?.value || 0;
            // })
            // .sort((a, b) => b.value - a.value)
            .sum((d) =>
              d.children ? 0 : isNaN(d.data?.value) ? 1 : d.data?.value,
            )
            .sort((a, b) => b.height - a.height || b.value - a.value),
        );
      return treemap(this.hierarchicalData);
    },
  },
  watch: {
    data() {
      this.updateChart();
    },
    index() {
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
      this.width = container.clientWidth;
      this.height = container.clientHeight;
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        this.updateChart();
      }
    },
    fill(d) {
      // while (d.depth > 1) d = d.parent;
      // console.log(d.data);

      return this.useGradients
        ? `url(#gradient-${d.data.id})`
        : d.data.data.color;
    },
    stroke(d) {
      return d.data.data.color;
    },
    draw() {
      const format = (d) => number(d, 1, { abbr: true });

      const duration = this.duration;
      const enterDelay = 0;

      // console.log(this.root.leaves());
      const leaves = this.root.leaves();

      this.rectContainer
        .selectAll("g")
        .data(leaves, (d) => d.data.id)
        .join(
          (enter) => {
            const g = enter
              .append("g")
              .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
              .attr("id", (d) => `g-${d.data.id}`);

            // gradients
            const defs = g.append("defs");
            const gradient = defs
              .append("linearGradient")
              .attr("id", (d) => `gradient-${d.data.id}`)
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "100%")
              .attr("y2", "0%");

            gradient
              .append("stop")
              .attr("offset", "0%")
              .attr("stop-opacity", this.startGradientOpacity)
              .attr("stop-color", (d) => d.data.data.color);
            gradient
              .append("stop")
              .attr("offset", "100%")
              .attr("stop-opacity", this.endGradientOpacity)
              .attr("stop-color", (d) => d.data.data.color);

            // rectangles
            g.append("rect")
              .attr("id", (d) => this.id + "-rect-" + d.data.id)
              .attr("rx", this.hasRoundBorders ? "0.375rem" : "0rem")
              .attr("fill", this.fill)
              .attr("opacity", this.opacity)
              .attr("width", 0)
              .attr("height", 0)
              .on("mouseenter", (event, d) => {
                this.$emit("hover", {
                  target: event.target,
                  data: d.data,
                });
              })
              .on("mouseleave", () => this.$emit("hover", null))
              .on("click", (e, d) =>
                this.$emit("select", {
                  target: e.target,
                  data: d.data,
                }),
              )
              .call((enter) =>
                enter
                  .transition()
                  .duration(duration)
                  .delay(enterDelay)
                  // .ease(d3[this.ease])
                  .attr("width", (d) => d.x1 - d.x0)
                  .attr("height", (d) => d.y1 - d.y0),
              );

            // top line
            g.append("line")
              .attr("id", (d) => `line-${d.data.id}`)
              // .attr("rx", this.hasRoundBorders ? "0.375rem" : "0rem")
              .attr("stroke", this.stroke)
              .attr("stroke-width", 3)
              .attr("x1", 0)
              .attr("x2", 0)
              .call((enter) =>
                enter
                  .transition()
                  .duration(duration)
                  .delay(enterDelay)
                  // .ease(d3[this.ease])
                  .attr("x2", (d) => d.x1 - d.x0),
              );

            // clip path for text
            g.append("clipPath")
              .attr("id", (d) => this.id + "-clip-" + d.data.id)
              .append("use")
              .attr("xlink:href", (d) => `#${this.id}-rect-${d.data.id}`);

            // labels
            g.append("text")
              .attr("clip-path", (d) => `url(#${this.id}-clip-${d.data.id})`)
              .attr("class", "pointer-events-none")
              .attr("fill", (d) => d.data.data.textColor || "white")
              .selectAll("tspan")
              .data((d) => [
                d.data.data.name,
                this.showPercentage
                  ? format(d.data.data.value) + this.unit
                  : "",
                d.data?.meta?.subtext,
              ])
              .enter()
              .append("tspan")
              .style("font-size", (d, i) => (i === 0 ? "12px" : "14px"))
              .style("font-weight", (d, i) => (i === 0 ? "normal" : "600"))
              .attr("x", 10)
              .attr(
                "y",
                (d, i, nodes) =>
                  // (i === nodes.length - 1) * 3 + 27 + (i - 0.5) * 16
                  30 + (i - 0.5) * 20,
              )
              .attr("fill-opacity", (d, i, nodes) =>
                i === nodes.length - 1 ? 0.7 : null,
              )
              .text((d) => d);
          },
          (update) => {
            update
              .transition()
              .duration(duration)
              .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

            update
              .select("rect")
              .transition()
              .duration(duration)
              .attr("fill", this.fill)
              .attr("width", (d) => d.x1 - d.x0)
              .attr("height", (d) => d.y1 - d.y0);

            update
              .select("line")
              .transition()
              .duration(duration)
              .attr("stroke", this.stroke)
              .attr("x2", (d) => d.x1 - d.x0);

            update
              .selectAll("tspan")
              .data((d) => [
                d.data.data.name,
                this.showPercentage
                  ? format(d.data.data.value) + this.unit
                  : "",
                d.data?.meta?.subtext,
              ])
              .text((d) => d);
          },
          (exit) => {
            // exit.remove()

            // remove the rect and when done remove the g
            exit
              .select("rect")
              .transition()
              .duration(duration)
              .attr("width", 0)
              .attr("height", 0)
              .remove()
              .end()
              .then(() => {
                exit.remove();
              });

            exit
              .select("line")
              .transition()
              .duration(duration)
              .attr("x2", 0)
              .remove()
              .end()
              .then(() => {
                exit.remove();
              });
          },
        );

      // this.rectContainer
      //   .selectAll("rect")
      //   .data(leaves, (d) => d.data.id)
      //   .join(
      //     (enter) =>
      //       enter
      //         .append("rect")
      //         .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //         .attr("id", (d) => `rect-${d.data.id}`)
      //         .attr("rx", this.hasRoundBorders ? "0.375rem" : "0rem")
      //         .attr("fill", this.fill)
      //         .attr("width", 0)
      //         .attr("height", 0)
      //         .on("mouseenter", (event, d) => {
      //           this.$emit("hover", {
      //             target: event.target,
      //             data: d.data,
      //           });
      //         })
      //         .on("mouseleave", () => this.$emit("hover", null))
      //         .on("click", (e, d) =>
      //           this.$emit("select", {
      //             target: e.target,
      //             data: d.data,
      //           })
      //         )
      //         .call((enter) =>
      //           enter
      //             .transition()
      //             .duration(duration)
      //             .delay(enterDelay)
      //             // .ease(d3[this.ease])
      //             .attr("width", (d) => d.x1 - d.x0)
      //             .attr("height", (d) => d.y1 - d.y0)
      //         ),
      //     (update) =>
      //       update
      //         .transition()
      //         .duration(duration)
      //         .attr("fill", this.fill)
      //         .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //         .attr("width", (d) => d.x1 - d.x0)
      //         .attr("height", (d) => d.y1 - d.y0),
      //     (exit) =>
      //       exit
      //         .transition()
      //         .duration(duration)
      //         // .ease(d3[this.ease])
      //         .attr("width", 0)
      //         .attr("height", 0)
      //         .remove()
      //   );

      // this.clipPathContainer
      //   .selectAll("clipPath")
      //   .data(leaves, (d) => d.data.id)
      //   .join(
      //     (enter) =>
      //       enter
      //         .append("clipPath")
      //         // .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //         .attr("id", (d) => "clip-" + d.data.id)
      //         .append("use")
      //         .attr("xlink:href", (d) => "#rect-" + d.data.id),
      //     (update) =>
      //       // update.attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //       update,
      //     (exit) => exit.remove()
      //   );

      // this.textContainer
      //   .selectAll("text")
      //   .data(leaves, (d) => d.data.id)
      //   .join(
      //     (enter) =>
      //       enter
      //         .append("text")
      //         .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //         .attr("clip-path", (d) => "url(#clip-" + d.data.id + ")")
      //         .attr("class", "pointer-events-none")
      //         .attr("fill", (d) => d.data.textColor || "white")
      //         .selectAll("tspan")
      //         .data((d) => [
      //           d.data.data.name,
      //           this.showPercentage
      //             ? format(d.data.data.value) + this.unit
      //             : "",
      //           d.data?.meta?.subtext,
      //         ])
      //         .enter()
      //         .append("tspan")
      //         .style("font-size", (d, i) => (i === 0 ? "10px" : "12px"))
      //         .attr("x", 10)
      //         .attr(
      //           "y",
      //           (d, i, nodes) =>
      //             (i === nodes.length - 1) * 3 + 27 + (i - 0.5) * 16
      //         )
      //         .attr("fill-opacity", (d, i, nodes) =>
      //           i === nodes.length - 1 ? 0.7 : null
      //         )
      //         .text((d) => d),
      //     (update) => {
      //       update
      //         .transition()
      //         .duration(duration)
      //         .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      //         .attr("clip-path", (d) => "url(#clip-" + d.data.id + ")");

      //       update
      //         .selectAll("tspan")
      //         .data((d) => [
      //           d.data.data.name,
      //           this.showPercentage
      //             ? format(d.data.data.value) + this.unit
      //             : "",
      //           d.data?.meta?.subtext,
      //         ])
      //         .text((d) => d);
      //     },
      //     (exit) => exit.remove()
      //   );
    },
    updateChart() {
      this.svg.attr("viewBox", [0, 0, this.width, this.height]);
      this.draw();
    },
    createChart() {
      this.svg = d3
        .select(this.$refs.treemap)
        .attr("viewBox", [0, 0, this.width, this.height])
        .style("overflow", "visible");

      this.rectContainer = this.svg.append("g");
      this.clipPathContainer = this.svg.append("g");
      this.textContainer = this.svg.append("g");

      this.draw();
    },
  },
};
</script>

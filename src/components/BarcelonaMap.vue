<template>
  <div ref="container" class="flex justify-center">
    <svg ref="map" :width="width" :height="height" class=""></svg>
  </div>
</template>

<script>
import municipis from "@/assets/municipis.json";
import comarques from "@/utils/comarques.js";
import * as d3 from "d3";
import * as topojson from "topojson-client";
// import municipisList from "@/utils/municipis.js";

export default {
  name: "BarcelonaMap",
  emits: ["select", "hover", "zoom", "comarcaClick", "zoomComarca"],
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    color: {
      type: [Object, Function],
      default: () => ({ min: "#E0F2FE", max: "#0C4A6E" }),
    },
    id: {
      type: String,
      default: "",
    },
    strokeColor: {
      type: String,
      default: "white",
    },
    hovered: {
      type: String,
      default: null,
    },
    selected: {
      type: [String, Number],
      default: null,
    },
    noDataColor: {
      type: String,
      default: "#DDDEDD",
    },
    highlightColor: {
      type: String,
      default: "black",
    },
    adjustSize: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: 750,
    },
    zoomedComarca: {
      type: Boolean,
      default: false,
    },
    scope: {
      type: String,
      default: "municipi",
    },
    zoomScale: {
      type: Number,
      default: 1,
    },
    maxZoom: {
      type: Number,
      default: 16,
    },
    munData: {
      type: Array,
      default: () => [],
    },
    accessor: {
      type: Function,
      default: (d) => {
        // console.log(d);
        return d.properties?.MUNICIPI;
      },
    },
    highlighted: {
      type: [Number, String],
      default: null,
    },
    highlightColor: {
      type: String,
      default: "black",
    },
    strokeColorNoData: {
      type: String,
      default: "#fff",
    },
    extent: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      width: 100,
      height: 100,
      loading: false,
      error: false,
      tooltip: {
        show: false,
        name: "",
        data: {},
      },
    };
  },
  computed: {
    max() {
      return (
        this.extent?.[1] || d3.max(Object.values(this.data), (d) => d.value)
      );
    },
    computedExtent() {
      return this.extent || d3.extent(Object.values(this.data), (d) => d.value);
    },
    colorScale() {
      if (typeof this.color === "function") {
        return this.color;
      }
      const interpolator = d3.interpolateRgb(this.color.min, this.color.max);
      const scale = d3.scaleLinear().domain(this.computedExtent);
      return d3
        .scaleSequential((d) => interpolator(scale(d)))
        .unknown(this.noDataColor);
    },
  },
  methods: {
    draw() {
      // convert topoJson to geoJson
      this.featureCollection = topojson.feature(
        municipis,
        municipis.objects.municipis,
      );

      const projection = d3
        .geoIdentity()
        .reflectY(true) // flip y axis
        .scale(1)
        .translate([0, 0]);

      this.path = d3.geoPath().projection(projection);

      this.active = d3.select(null);

      // automatic center and scale (see http://bl.ocks.org/mbostock/4707858)
      projection.scale(1).translate([0, 0]);

      // calculate the bounds of the map
      const b = this.path.bounds(this.featureCollection);

      if (!this.adjustSize) {
        // DO NOT DO THIS if you want to be limited by the height/width of the container
        // DO THIS only if you want the WIDTH of the container to determine the final size of the map
        //calculate aspect ratio
        const aspectRatio = (b[1][0] - b[0][0]) / (b[1][1] - b[0][1]);
        //set height based on aspect ratio
        this.height = this.width / aspectRatio;
        // END of the scary "DO NOT DO THIS"
      }

      // set the viewBox
      this.svg = d3
        .select(this.$refs.map)
        .attr("viewBox", `0 0 ${this.width} ${this.height}`);

      // some math to calculate the scale in function of the bounds and the width/height
      const s =
        1 /
        Math.max(
          (b[1][0] - b[0][0]) / this.width,
          (b[1][1] - b[0][1]) / this.height,
        );
      // more math for centering the map...
      const t = [
        (this.width - s * (b[1][0] + b[0][0])) / 2,
        (this.height - s * (b[1][1] + b[0][1])) / 2,
      ];
      // and finally scale and translate the projection
      projection.scale(s).translate(t);

      const that = this;

      // municipality borders
      this.municipis
        .selectAll("path")
        .data(this.featureCollection.features)
        .join("path")
        .attr("id", (d) => `region-${d.properties?.MUNICIPI}`)
        .attr("class", "municipi")
        .attr("d", this.path)
        .attr("stroke", this.strokeColor)
        .attr("stroke-width", 1)
        .attr("fill", this.fill)
        .attr("cursor", (d) => {
          if (this.data[this.accessor(d)]) return "pointer";
          return "default";
        })
        .on("mouseover", function (event, d) {
          d3.select(this).attr("stroke", "black").raise();

          const value = that.data[that.accessor(d)];

          const data = { id: that.accessor(d), ...value, region: d.properties };
          that.$emit("hover", { target: event.target, data });
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke", "white").lower();
          that.highlight();
          that.$emit("hover", null);
        })
        .on("click", (event, d) => {
          const value = this.data[that.accessor(d)];
          const data = { id: that.accessor(d), ...value, region: d.properties };
          this.$emit("select", { target: event.target, data });
        })
        .attr("visibility", (d) => {
          if (this.scope === "comarca") return "hidden";
          return "visible";
        });

      const idComarques = new Set(
        municipis.objects.municipis.geometries.map((d) => d.properties.COMARCA),
      );

      const comarcaFeatures = [...idComarques].map((id) => {
        const geometry = topojson.merge(
          municipis,
          municipis.objects.municipis.geometries.filter(function (d) {
            return d.properties.COMARCA == id;
          }),
        );

        geometry.id = id;

        return geometry;
      });

      this.comarques
        .selectAll("path")
        .data(comarcaFeatures)
        .join("path")
        .attr("id", (d) => {
          // d.id = id;
          return "region-" + d.id;
        })
        .attr("class", `comarca`)
        .attr("d", this.path)
        .attr("fill", this.fill)
        .attr("stroke", this.comarcaStroke)
        .attr("stroke-width", "2")
        .attr("stroke-linejoin", "round")
        .attr("cursor", "pointer")
        .on("mouseover", function (e, d) {
          d3.select(this).attr("stroke", "black").raise();

          const value = that.data[that.accessor(d)];

          const data = {
            id: that.accessor(d),
            ...value,
            region: d.properties,
          };
          that.$emit("hover", { target: e.target, data });
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke", "white").lower();
          that.highlight();
          that.$emit("hover", null);
        })
        .on("click", (event, d) => {
          const value = this.data[that.accessor(d)];
          const data = {
            id: that.accessor(d),
            ...value,
            region: d.properties,
          };
          this.$emit("select", { target: event.target, data });
        })
        .attr("visibility", (d) => {
          if (this.scope === "comarca") return "visible";
          return "hidden";
        });

      // ZOOM

      const zoomed = ({ transform }) => {
        this.$emit("zoom", transform);
        this.municipis.attr("transform", transform);
        // this.municipis.attr("stroke-width", 1 / transform.k);
      };

      this.zoomFunction = d3
        .zoom()
        .scaleExtent([1, this.maxZoom])
        .on("zoom", zoomed);

      this.highlight();
    },
    fill(d) {
      return (
        this.colorScale(this.data[this.accessor(d)]?.value) || this.noDataColor
      );
    },
    zoomComarca(d /*, type = "comarca"*/) {
      let comarca = d;

      this.activeComarcaId = d.id;

      this.$emit("comarcaClick", d.id);
      this.tooltip.show = false;
      // }
      // if (this.active === d.id) return this.reset();
      this.active = d.id;
      var bounds = this.path.bounds(comarca),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.9 / Math.max(dx / this.width, dy / this.height),
        translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

      //zoom municipis i comarques
      this.municipis
        .transition()
        .duration(this.duration)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      this.comarques
        .transition()
        .duration(this.duration)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      this.municipis
        .selectAll("path")
        .transition()
        .duration(this.duration)
        .style("stroke-width", (d) => {
          return (this.highlighted === this.accessor(d) ? 1 : 1) / scale + "px";
        });

      this.comarques
        .selectAll("path")
        .transition()
        .duration(this.duration)
        .style("stroke-width", 2 / scale + "px");

      this.$emit("zoomComarca", true);
    },
    createMap() {
      // remove all shapes in case we are painting a new map
      d3.select(this.$refs.map).selectAll("g").remove();
      this.municipis = d3
        .select(this.$refs.map)
        .append("g")
        .attr("class", "map-container");

      this.comarques = d3
        .select(this.$refs.map)
        .append("g")
        .attr("class", "comarca-container");

      this.draw();
      if (this.selected) this.zoomToComarca(this.selected);
    },
    highlight() {
      this.municipis.selectAll("path").attr("stroke", this.getStrokeColor);

      // this.municipis
      //   .select(`#region-${this.highlighted}`)
      //   .attr("stroke-width", "2");
      this.municipis.select(`#region-${this.highlighted}`).raise();

      this.comarques
        .selectAll("path")
        .attr("stroke", this.comarcaStroke)
        .attr("fill", "none")
        // .attr("stroke-width", "2")
        .attr("visibility", (d) => {
          if (this.scope === "comarca") return "visible";
          if (this.selected === d.id) return "visible";
          return "hidden";
        });
    },
    getStrokeColor(d) {
      return this.getStroke(d);
    },
    getStroke(d) {
      if (this.highlighted === this.accessor(d)) return this.highlightColor;
      if (!this.data[this.accessor(d)]) return this.strokeColorNoData;
      return this.strokeColor;
    },
    comarcaStroke(d) {
      // console.log(
      //   this.selected,
      //   d.id,
      //   this.selected === d.id,
      //   this.highlightColor,
      // );
      if (this.selected === d.id) return this.highlightColor;
      return this.strokeColor;
    },
    setSize() {
      const container = this.$refs.container;
      if (container && !this.error) {
        this.width = container.clientWidth;
        this.height = container.clientHeight;
      }
    },
    resize() {
      const currentWidth = this.width;
      const currentHeight = this.height;
      this.setSize();
      if (currentWidth !== this.width || currentHeight !== this.height) {
        if (this.svg) this.updateMap();
      }
    },
    updateMap() {
      if (!this.error) {
        // this.municipis.attr("transform", "translate(0) scale(1)");
        this.draw();
        this.update();
        if (this.selected) this.zoomToComarca(this.selected);
        // this.updateColors();
      }
    },
    reset() {
      this.active = null;
      this.municipis.transition().duration(this.duration).attr("transform", "");

      this.municipis
        .selectAll("path")
        .transition()
        .duration(this.duration)
        .style("stroke-width", "1px");

      this.tooltip.show = false;
      this.$emit("zoomComarca", false);

      this.update();
    },
    update() {
      this.municipis
        .selectAll("path")
        .attr("fill", this.fill)
        .attr("cursor", (d) => {
          if (this.data[this.accessor(d)]) return "pointer";
          return "default";
        });
    },
    zoomToScale(scale) {
      if (scale <= 1) {
        this.svg
          .transition()
          .duration(750)
          .call(this.zoomFunction.transform, d3.zoomIdentity);
      } else {
        this.svg
          .transition()
          .duration(750)
          .call(this.zoomFunction.scaleTo, scale);
      }
    },
    zoomToComarca(comarcaId) {
      // find shape of comarca
      const d = topojson.merge(
        municipis,
        municipis.objects.municipis.geometries.filter(function (d) {
          return d.properties.COMARCA == comarcaId;
        }),
      );

      d.id = comarcaId;

      this.zoomComarca(d);
    },
  },
  mounted() {
    this.setSize();
    this.createMap();
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
    if (ResizeObserver) {
      this.resizeObserver.unobserve(this.$refs.container);
    } else {
      // for IE
      window.removeEventListener("resize", this.resize);
    }
  },
  watch: {
    data() {
      // this.update();
      this.draw();
    },
    scope() {
      // if (this.scope === "comarca") this.reset();
      this.draw();
    },
    zoomedComarca() {
      if (!this.zoomedComarca) this.reset();
      this.$emit("zoomComarca", this.zoomedComarca);
    },
    selected(newVal) {
      this.highlight();
      this.zoomToComarca(newVal);
    },
    highlighted() {
      this.highlight();
    },
    zoomScale(newVal, oldVal) {
      const currentTransform = d3.zoomTransform(this.svg.node());
      if (newVal > oldVal) {
        this.zoomToScale(parseInt(currentTransform.k) * 2);
      } else {
        this.zoomToScale(parseInt(currentTransform.k) / 2);
      }
    },
  },
};
</script>
<style scoped></style>

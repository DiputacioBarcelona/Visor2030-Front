<template>
  <div class="relative">
    <span
      :class="['switch-selected-' + currentItem, sliderClass]"
      :style="{
        transform: `translate(${left}px, ${top}px)`,
        width: `${width}px`,
        height: `${height}px`,
      }"
    ></span>

    <div
      class="relative flex"
      :class="[innerContainerClass]"
      ref="items-container"
      role="tablist"
      aria-orientation="horizontal"
    >
      <template v-for="(item, i) in options" :key="i">
        <RouterLink
          :ref="item.id"
          :class="[
            'switch-item-' + i,
            {
              [itemActiveClass]: item.id === active,
              [itemInactiveClass]: item.id !== active,
            },
            itemClass,
          ]"
          :to="item.to"
          :exact="item.exact"
          :aria-label="item.title"
          :aria-current="item.id === active"
          :aria-selected="item.id === active"
          role="tab"
          @click="scrollIntoView"
          @mouseover="hover(item, $event)"
          @mouseleave="$emit('hover', null)"
        >
          <component
            v-if="item.icon"
            :is="item.icon"
            class="pointer-events-none h-5 w-5"
          />
          <span v-if="item.name" class="pointer-events-none"
            ><OTText v-if="useOTText" :value="item.name" /><template v-else>{{
              item.name
            }}</template></span
          >
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [String, Number],
      default: "",
    },
    exact: {
      type: Boolean,
      default: false,
    },
    itemClass: {
      type: String,
      default:
        "text-gray-500 rounded-full hover:text-gray-600 transition font-medium py-2 px-4 bg-transparent focus:outline-none",
    },
    itemActiveClass: {
      type: String,
      default: "text-gray-600",
    },
    itemInactiveClass: {
      type: String,
      default: "",
    },
    roundedStyle: {
      type: String,
      default: "rounded-full",
    },
    sliderClass: {
      type: String,
      default:
        "absolute inset-y-0 my-1 w-full bg-white shadow-md rounded-full ease-out transition-all duration-500 switch-selector",
    },
    innerContainerClass: {
      type: String,
      default: "",
    },
    active: {
      type: String,
      default: "",
    },
    useOTText: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["hover"],
  data() {
    return {
      width: 0,
      left: 0,
      height: null,
      top: 0,
    };
  },

  computed: {
    currentItem() {
      return this.options.findIndex((e) => e.to.name === this.$route.name);
    },
  },
  watch: {
    $route() {
      this.setPosition();
    },
  },
  mounted() {
    this.setPosition();

    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.setPosition();
      });

      this.resizeObserver.observe(this.$refs["items-container"]);
    } else {
      // for IE
      window.addEventListener("resize", this.setPosition);
    }
  },
  beforeUnmount() {
    this.removeResizeObserver();
  },
  methods: {
    removeResizeObserver() {
      if (window.ResizeObserver) {
        this.resizeObserver.unobserve(this.$refs["items-container"]);
      } else {
        // for IE
        window.removeEventListener("resize", this.setPosition);
      }
    },
    hover(data, { target }) {
      this.$emit("hover", {
        target,
        data,
      });
    },
    setPosition() {
      this.$nextTick(function () {
        // DOM is now updated
        let el;

        el = this.$refs[this.active]?.[0]?.$el;

        if (el) {
          this.width = el.getBoundingClientRect().width;
          this.left = el.offsetLeft;
        } else {
          this.width = 0;
          this.left = 0;
        }
      });
    },
    scrollIntoView() {
      // const el = this.$refs[this.active]?.[0]?.$el;
      // if (el) el.scrollIntoView();
    },
    // setPosition() {
    //   this.$nextTick(function() {
    //     // DOM is now updated
    //     let el;

    //     // find the first one of the matched routes that we have in our options
    //     if (this.exact) {
    //       // strip the last / if present
    //       const path =
    //         this.$route.fullPath[this.$route.fullPath.length - 1] === "/" &&
    //         this.$route.fullPath !== "/"
    //           ? this.$route.fullPath.slice(0, -1)
    //           : this.$route.fullPath;

    //       el = this.$refs[path]?.[0]?.$el;
    //     }
    //     // special case - only for the home - "/"
    //     // else if (this.$route.path === "/") {
    //     //   el = this.$refs["/"]?.[0]?.$el;
    //     // }
    //     else {
    //       const matched = this.$route.matched.find((e) => {
    //         return this.options.some((op) => e.name === op.to.name);
    //       });
    //       // console.log({ matched });
    //       const path = matched?.name;

    //       el = this.$refs[path]?.[0]?.$el;
    //     }

    //     if (el) {
    //       this.width = el.getBoundingClientRect().width;
    //       this.left = el.offsetLeft;
    //     } else {
    //       this.width = 0;
    //       this.left = 0;
    //     }
    //   });
    // },
  },
};
</script>

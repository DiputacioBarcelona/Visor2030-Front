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
      ref="itemsContainer"
    >
      <button
        v-for="(item, i) in internalOptions"
        :key="i"
        :ref="
          (el) => {
            items[item.value] = el;
          }
        "
        :class="[
          'switch-item-' + i,
          {
            [itemActiveClass]: item.value == modelValue,
            [itemInactiveClass]: item.value !== modelValue,
          },
          itemClass,
          { '!min-w-0': item.icon },
        ]"
        @click="select(item, $event)"
        @mouseenter="$emit('hover', { data: item, target: $event.target })"
        @mouseleave="$emit('hover', null)"
      >
        <component
          v-if="item.icon"
          :is="item.icon"
          class="pointer-events-none"
        />
        <span v-else class="pointer-events-none">{{ item.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import IconGrouped from "./IconGrouped.vue";
import IconSeparate from "./IconSeparate.vue";

export default {
  components: {
    IconSeparate,
    IconGrouped,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [String, Number],
      default: "",
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
  },
  data() {
    return {
      width: 0,
      left: 0,
      height: null,
      top: 0,
    };
  },
  setup() {
    const itemsContainer = ref(null);
    const items = ref([]);
    return {
      itemsContainer,
      items,
    };
  },
  computed: {
    currentItem() {
      return this.internalOptions.findIndex((e) => e.value === this.modelValue);
    },
    internalOptions() {
      return this.options.map((e) => {
        if (typeof e === "object")
          return {
            ...e,
            value: e.id,
          };
        return {
          value: e,
          name: e,
        };
      });
    },
  },
  watch: {
    modelValue() {
      this.setPosition();
    },
  },
  mounted() {
    this.setPosition();
    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    if (ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.setPosition();
      });
      this.resizeObserver.observe(this.itemsContainer);
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
      if (ResizeObserver) {
        this.resizeObserver.unobserve(this.itemsContainer);
      } else {
        // for IE
        window.removeEventListener("resize", this.setPosition);
      }
    },
    select(item, { target }) {
      if (target) {
        this.width = target.getBoundingClientRect().width;
        this.left = target.offsetLeft;
        this.height = target.getBoundingClientRect().height;
        this.top = target.offsetTop;
      }

      this.$emit("update:modelValue", item.value);
    },
    setPosition() {
      setTimeout(() => {
        this.$nextTick(function () {
          const el = this.items[this.modelValue];

          if (el) {
            this.width = el.getBoundingClientRect().width;
            this.left = el.offsetLeft;
            this.height = el.getBoundingClientRect().height;
            this.top = el.offsetTop;
          } else {
            this.width = 0;
            this.left = 0;
          }
        });
      }, 100);
    },
  },
};
</script>

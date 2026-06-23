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
      class="relative"
      :class="[innerContainerClass]"
      ref="itemsContainer"
      :role="role"
      aria-orientation="horizontal"
      :aria-label="ariaLabel"
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
            'flex items-center gap-x-2': item.icon,
          },
          itemClass,
        ]"
        :aria-label="item.title"
        :aria-current="item.value == modelValue"
        :aria-selected="item.value == modelValue"
        :aria-controls="ariaControls"
        :role="role === 'tablist' ? 'tab' : 'button'"
        @click="select(item, $event)"
        @mouseover="hover(item, $event)"
        @mouseleave="$emit('hover', null)"
      >
        <component
          v-if="item.icon"
          :is="item.icon"
          class="pointer-events-none h-5 w-5"
        />
        <span v-if="item.color" :style="{ color: item.color }" class="mr-2"
          >&#x25CF;</span
        >
        <span v-if="item.name" class="pointer-events-none">{{
          item.name
        }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [String, Number, Boolean],
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
    roundedStyle: {
      type: String,
      default: "rounded-full",
    },
    sliderClass: {
      type: String,
      default:
        "absolute inset-y-0 my-1 w-full bg-secondary shadow-md rounded-full ease-out transition-all duration-500 switch-selector",
    },
    innerContainerClass: {
      type: String,
      default: "",
    },
    ariaLabel: {
      type: String,
      default: "Options group",
    },
    role: {
      type: String,
      default: "group",
    },
    ariaControls: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "hover"],
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
        if (typeof e === "object") return e;
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
      this.width = target.getBoundingClientRect().width;
      this.left = target.offsetLeft;

      this.height = target.getBoundingClientRect().height;
      this.top = target.offsetTop;

      this.$emit("update:modelValue", item.value);
    },
    hover(data, { target }) {
      this.$emit("hover", {
        target,
        data,
      });
    },
    setPosition() {
      this.$nextTick(function () {
        const el = this.items[this.modelValue];

        this.width = el.getBoundingClientRect().width;
        this.left = el.offsetLeft;

        this.height = el.getBoundingClientRect().height;
        this.top = el.offsetTop;
      });
    },
  },
};
</script>

<template>
  <span class="tabular-nums text-primary-110">{{ tweenNumber }}{{ unit }}</span>
</template>

<script>
import { gsap } from "gsap";
import { number } from "@/utils/filters";

export default {
  props: {
    num: {
      type: Number,
      default: 0,
    },
    decimals: {
      type: Number,
      default: 1,
    },
    duration: {
      type: Number,
      default: 0.5,
    },
    unit: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      tweenNumber: number(this.num, this.decimals),
    };
  },
  watch: {
    num(newVal, oldVal) {
      if (newVal === null) this.tweenNumber = number(this.num, this.decimals);
      else {
        const obj = { value: oldVal };
        gsap.to(obj, this.duration, {
          value: newVal,
          ease: "Power2.easeInOut",
          onUpdate: () => {
            this.tweenNumber = number(obj.value, this.decimals);
          },
        });
      }
    },
  },
};
</script>

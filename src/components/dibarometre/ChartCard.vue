<template>
  <div>
    <div>
      <!-- header -->
      <div class="mb-8">
        <slot name="header"></slot>
      </div>
      <!-- body -->
      <div class="max-w-4xl">
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// import InfoIcon from "./InfoIcon.vue";

export default {
  name: "ChartCard",
  components: {
    // InfoIcon,
  },
  props: {
    component: {
      type: String,
      default: null,
    },
    small: {
      type: Boolean,
      default: false,
    },
    showInfoIcon: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.avoid-page-break {
  page-break-inside: avoid;
}
</style>

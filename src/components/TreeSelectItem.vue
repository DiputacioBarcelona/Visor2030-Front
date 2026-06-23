<template>
  <div>
    <button
      v-if="data.children"
      @click="isOpen = !isOpen"
      class="mr-1 flex w-full items-center rounded px-1 py-2 hover:bg-gray-100"
    >
      <ChevronRightIcon
        class="h-5 w-5 transition"
        :class="{ 'rotate-90': isOpen }"
      />
      <span class="ml-2" :class="{ 'font-semibold': indeterminate || checked }">
        <HighlightString :phrase="data.name" :highlight="search" />
      </span>
    </button>

    <button
      v-else-if="!data.children || data.children.length === 0"
      class="mr-1 flex w-full items-center justify-between rounded px-1 py-2 hover:bg-gray-100"
      @click="handleChange"
    >
      <label
        :for="data.id"
        class="ml-2 cursor-pointer"
        :class="{ 'font-semibold': checked }"
      >
        <HighlightString :phrase="data.name" :highlight="search" />
      </label>
      <CheckIcon v-if="checked" class="h-5 w-5" aria-hidden="true" />
    </button>

    <template v-else-if="leafOnly && data.children">
      <span class="ml-2">
        <HighlightString :phrase="data.name" :highlight="search" />
      </span>
    </template>

    <template v-else>
      <input
        class="text-primary focus:ring-primary disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:hover:bg-gray-200"
        :disabled="preventDeselect && checked"
        :id="data.id"
        type="checkbox"
        :checked="checked"
        :indeterminate="indeterminate"
        @change="handleChange"
        @keydown.enter="handleChange"
      />
      <label
        :for="data.id"
        class="ml-2 cursor-pointer"
        :class="{ 'font-semibold': checked }"
      >
        <HighlightString :phrase="data.name" :highlight="search" />
      </label>
    </template>

    <ul v-if="isOpen" class="list-none">
      <TreeSelectItem
        v-for="child in data.children"
        :key="child.id"
        :data="child"
        :value="value"
        :highlighted-id="highlightedId"
        :search="search"
        :leaf-only="leafOnly"
        :depth="depth + 1"
        @input="$emit('input', $event)"
        class="ml-4"
        :prevent-deselect="false"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, toRefs, onMounted, watch } from "vue";
import { ChevronRightIcon, CheckIcon } from "@heroicons/vue/20/solid";
import TreeSelectItem from "../components/TreeSelectItem.vue";
import HighlightString from "../components/HighlightString.vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: "a",
      name: "a",
      children: [
        {
          id: "aa",
          name: "aa",
        },
        {
          id: "ab",
          name: "ab",
        },
      ],
    }),
  },
  value: {
    type: Array,
    default: () => [],
  },
  highlightedId: {
    type: [Number, String],
    default: null,
  },
  search: {
    type: String,
    default: "",
  },
  leafOnly: {
    type: Boolean,
    default: false,
  },
  depth: {
    type: Number,
    default: 0,
  },
  preventDeselect: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["input"]);

const { data, value, search, preventDeselect } = toRefs(props);

const isOpen = ref(false);

// returns true if any of the descendants match the search
function containsSearch(node) {
  if (node.name.toLowerCase().includes(search.value.toLowerCase())) return true;

  if (node.children) {
    for (const child of node.children) {
      if (containsSearch(child)) return true;
    }
  }
}

// const combinedOpen = computed(() => {
//   return isOpen.value || (forceOpen.value && search.value);
// });

// const forceOpen = ref(false);

function setForceOpen() {
  if (search.value === "") isOpen.value = false;
  else {
    let childContains = false;
    // if any of the descendants match the search, open it
    // we need to check all children
    isOpen.value = false;
    for (const child of data.value.children || []) {
      if (containsSearch(child)) {
        isOpen.value = true;
        childContains = true;
        break;
      }
    }

    // console.log(data.value.name, isOpen.value);
  }
}

// if it has descendants that match the search, open it
onMounted(() => {
  setForceOpen();
});
watch(search, () => {
  setForceOpen();
});

// store all leafs of this item
const leafs = computed(() => {
  const leafs = [];

  function traverse(node) {
    if (!node.children || node.children.length === 0) {
      leafs.push(node.id);
    } else {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (data.value.children) traverse(data.value);

  return leafs;
});

// determine checked status
const checked = computed(() => {
  // if id is in value
  if (!data.value.children && value.value.includes(data.value.id)) return true;
  // or all leafs are in value
  if (
    data.value.children &&
    leafs.value.every((e) => value.value.includes(e))
  ) {
    return true;
  }

  return false;
});

// determine indeterminate status
const indeterminate = computed(() => {
  // if already checked or doesn't have children
  if (checked.value || !data.value.children || !data.value.children.length)
    return false;

  // else
  // if some leaf nodes are selected, parent is partially selected
  if (leafs.value.some((e) => value.value.includes(e))) return true;
});

const handleChange = () => {
  emits("input", { data: data.value, checked: checked.value });
};
</script>

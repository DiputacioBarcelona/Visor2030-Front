<template>
  <Popover class="relative h-full dark:text-black" v-slot="{ open }">
    <PopoverButton
      class="w-full"
      :class="{
        [mainClass]: true,
        'text-gray-400': disabled,
        'hover:border-gray-200': disabled,
      }"
      :id="label"
      :disabled="disabled"
      @keydown="handleKeydown"
    >
      <div class="relative flex w-full items-center justify-between">
        <slot
          name="button-content"
          :open="open"
          :displayed-name="displayedName"
          :disabled="disabled"
        >
          <span class="truncate" :aria-live="open ? 'polite' : 'off'">
            {{ displayedName }}
          </span>
          <ChevronDownIcon
            v-if="!disabled"
            class="-mr-1 ml-2 h-5 w-5 flex-shrink-0"
            aria-hidden="true"
            :class="{ [iconClass]: true }"
          />
        </slot>
      </div>
    </PopoverButton>

    <transition
      @after-enter="noSearchAutoFocus"
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <PopoverPanel
        v-slot="{ close }"
        class="absolute z-50 my-1 mt-1 rounded-md border bg-white p-2 text-base font-normal shadow-md"
        :class="{ 'is-open': open, [popoverClass]: true, 'right-0': right }"
        @keydown="(e) => handleKeydown(e, close)"
      >
        <input
          v-if="allowSearch"
          ref="inputRef"
          type="text"
          class="mb-2 block w-full flex-grow rounded border-none border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          v-model="search"
          @keydown.esc="close"
          @keydown.up.prevent="highlightPrev"
          @keydown.down.prevent="highlightNext"
          @keydown.enter.prevent="selectHighlighted(close)"
          @keydown.tab="(e) => handleKeydown(e, close)"
          :placeholder="placeholder"
          autocomplete="off"
          autocorrect="off"
        />

        <template v-if="filteredOptions.length > 0">
          <ul
            class="relative mb-0 w-full list-none space-y-1 overflow-y-auto overflow-x-hidden border-none pl-0 text-sm leading-6 text-gray-700"
            :class="popoverHeight"
          >
            <TreeSelectItem
              v-if="isTree"
              v-for="option in filteredOptions"
              :key="option.id"
              :data="option"
              :value="selectedArray"
              @input="treeSelect"
              :search="search"
              :leaf-only="leafOnly"
              :prevent-deselect="preventDeselect"
            />
            <li
              v-else
              v-for="(option, i) in filteredOptions"
              :key="`option-${option.id}`"
              :ref="(el) => (optionsRef[i] = el)"
              class="relative my-0 flex cursor-pointer items-center gap-x-1 rounded px-2 py-2 focus:outline-none"
              :class="{
                'is-active bg-gray-100': i === highlightedIndex,
                'font-semibold': multiple
                  ? modelValue.includes(option.id)
                  : option.id === modelValue,
                'text-gray-400': option.disabled,
              }"
              tabindex="0"
              @mouseover="!option.disabled && (highlightedIndex = i)"
              @click="select(option, !multiple && close)"
              @keydown="(e) => handleKeydown(e, close)"
            >
              <slot
                name="option-content"
                :option="option"
                :highlighted="i === highlightedIndex"
                :selected="
                  multiple
                    ? modelValue.includes(option.id)
                    : option.id === modelValue
                "
              >
                <div class="flex items-center justify-between leading-tight">
                  <div class="relative mr-6 flex items-center">
                    {{ option.formattedName ?? option.name }}
                  </div>
                  <div
                    class="text-primary-500 absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <CheckIcon
                      v-if="
                        multiple
                          ? modelValue.includes(option.id)
                          : option.id === modelValue
                      "
                      class="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </slot>
            </li>
          </ul>
          <div v-if="showCloseBtn" class="flex justify-end border-t pt-2">
            <button class="ot-btn px-3 text-sm shadow-none" @click="close">
              Close
            </button>
          </div>
        </template>

        <div v-else class="input-dropdown-empty px-4 py-2 text-gray-500">
          {{ noResultsText }} "{{ search }}"
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup>
import { ChevronDownIcon, CheckIcon } from "@heroicons/vue/20/solid";
import { computed, ref, toRefs, watch } from "vue";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Search",
  },
  mainClass: {
    type: String,
    default: "bg-white py-2 px-4 rounded-lg border border-gray-300",
  },
  popoverClass: {
    type: String,
    default: "",
  },
  defaultOptionName: {
    type: String,
    default: "All",
  },
  noResultsText: {
    type: String,
    default: "No results found for",
  },
  label: {
    type: String,
    default: "",
  },
  disabled: Boolean,
  iconClass: {
    type: String,
    default: "",
  },
  right: Boolean,
  showCloseBtn: Boolean,
  allowSearch: {
    type: Boolean,
    default: true,
  },
  optionsText: {
    type: String,
    default: "options",
  },
  preventDeselect: {
    type: Boolean,
    default: false,
  },
  leafOnly: {
    type: Boolean,
    default: false,
  },
  popoverHeight: {
    type: String,
    default: "max-h-[200px]",
  },
});

const model = defineModel();
const { optionsText, allowSearch } = toRefs(props);
const multiple = computed(() => Array.isArray(model.value));
const search = ref("");
const inputRef = ref(null);
const optionsRef = ref([]);
const highlightedIndex = ref(0);
const selected = ref([]);
const selectedArray = computed(() =>
  Array.isArray(selected.value)
    ? selected.value
    : selected.value != null
      ? [selected.value]
      : [],
);

const slugify = (text) => {
  const accentsMap = {
    a: "á|à|ã|â|À|Á|Ã|Â",
    e: "é|è|ê|É|È|Ê",
    i: "í|ì|î|Í|Ì|Î",
    o: "ó|ò|ô|õ|Ó|Ò|Ô|Õ",
    u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
    c: "ç|Ç",
    n: "ñ|Ñ",
  };
  return Object.keys(accentsMap).reduce(
    (acc, cur) => acc.replace(new RegExp(accentsMap[cur], "g"), cur),
    text.toLowerCase(),
  );
};

const isTree = computed(() => props.options.some((e) => e.children));

const filterText = (search, options) => {
  if (!search.trim()) return options;
  const regex = new RegExp(slugify(search), "i");
  if (!isTree.value) {
    return options.filter(
      (option) => slugify(option.name).search(regex) !== -1,
    );
  }
  const filterTree = (nodes) => {
    return nodes
      .map((node) => {
        const matches = slugify(node.name).search(regex) !== -1;
        const filteredChildren = node.children ? filterTree(node.children) : [];
        if (matches || filteredChildren.length) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  };
  return filterTree(options);
};

const filteredOptions = computed(() => filterText(search.value, props.options));

const displayedName = computed(() => {
  if (multiple.value && model.value.length > 1) {
    return `${model.value.length} ${optionsText.value}`;
  } else if (multiple.value && model.value.length === 1) {
    const selectedId = model.value[0];
    const option =
      props.options.find((e) => e.id === selectedId) ??
      props.options
        .flatMap((e) => e.children ?? [])
        .find((c) => c.id === selectedId);
    return option?.name;
  } else if (!multiple.value && ![null, undefined].includes(model.value)) {
    const option =
      props.options.find((e) => e.id === model.value) ??
      props.options
        .flatMap((e) => e.children ?? [])
        .find((c) => c.id === model.value);
    return option?.name;
  } else {
    return props.defaultOptionName;
  }
});

watch(
  () => filteredOptions.value,
  () => {
    optionsRef.value = [];
  },
);

// Auto focus first option when search is not shownn
const noSearchAutoFocus = () => {
  if (!allowSearch.value && optionsRef.value.length > 0) {
    optionsRef.value[0]?.focus();
  }
};

const handleKeydown = (event, closeFn) => {
  const isPopoverOpen = typeof closeFn === "function";

  if (event.key === "Tab") {
    if (isPopoverOpen) {
      event.preventDefault();
      if (allowSearch.value && inputRef.value) {
        inputRef.value.focus();
      } else {
        highlightNext();
      }
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (allowSearch.value && inputRef.value) {
      inputRef.value.focus();
    } else {
      highlightNext();
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    highlightPrev();
  } else if (event.key === "Enter") {
    if (isPopoverOpen) {
      event.preventDefault();
      // When the select is multiple we don't immediately close so
      //more options can be selected
      if (multiple.value) {
        selectHighlighted();
      } else {
        selectHighlighted(closeFn);
      }
    }
  } else if (event.key === "Escape") {
    closeFn?.();
  } else if (event.key === " " && event.target.tagName === "BUTTON") {
    event.preventDefault();
    event.target.click();
  }
};

const select = (option, close) => {
  if (multiple.value) {
    const currentValue = [...model.value];
    if (currentValue.includes(option.id)) {
      currentValue.splice(currentValue.indexOf(option.id), 1);
    } else {
      currentValue.push(option.id);
    }
    model.value = currentValue;
  } else {
    if (model.value === option.id && !props.preventDeselect) {
      model.value = null;
    } else {
      model.value = option.id;
    }
    close?.();
  }
};

const highlight = (index) => {
  highlightedIndex.value =
    index < 0
      ? filteredOptions.value.length - 1
      : index % filteredOptions.value.length;
  scrollToHighlighted();
};

const scrollToHighlighted = () => {
  const option = optionsRef.value[highlightedIndex.value];
  if (option) {
    option.scrollIntoView({ block: "nearest" });
  }
};

const highlightPrev = () => {
  const prevIndex = findEnabledIndex(-1);
  highlight(prevIndex);
};

const highlightNext = () => {
  const nextIndex = findEnabledIndex(1);
  highlight(nextIndex);
};

const findEnabledIndex = (step) => {
  let i = highlightedIndex.value + step;
  const length = filteredOptions.value.length;
  while (i >= 0 && i < length) {
    if (!filteredOptions.value[i]?.disabled) return i;
    i += step;
  }
  return step > 0 ? 0 : length - 1;
};

const selectHighlighted = (close) => {
  select(filteredOptions.value[highlightedIndex.value], close);
};

const treeSelect = ({ data, checked }) => {
  const leafs = getLeafs(data);

  if (!multiple.value) {
    // Single selection: toggle the leaf, replacing any previous selection
    const leaf = leafs[0] ?? null;
    const newValue = checked ? null : leaf;
    selected.value = newValue;
    model.value = newValue;
    return;
  }

  const parent = props.options.find((o) =>
    o.children?.some((c) => c.id === leafs[0]),
  );
  const siblingsIds = parent?.children?.map((c) => c.id) ?? [];

  // When the leaf was already checked, it removes the id from the selected array
  // and when it was not checked, removes any sibling that was already selected,
  // so the sibling selection is single option instead of multiple
  const newSelection = checked
    ? selected.value.filter((id) => !leafs.includes(id))
    : [...selected.value.filter((id) => !siblingsIds.includes(id)), ...leafs];

  const uniqueSelection = [...new Set(newSelection)];
  selected.value = uniqueSelection;
  model.value = uniqueSelection;
};

const getLeafs = (data) => {
  const leafs = [];
  const traverse = (node) => {
    if (node.children?.length) {
      node.children.forEach(traverse);
    } else {
      leafs.push(node.id);
    }
  };
  traverse(data);
  return leafs;
};

const resetSelection = () => {
  // set selected equal to value from parent
  // every time the dropdown is opened
  selected.value = multiple.value ? [...model.value] : model.value;
};

watch(model, () => {
  resetSelection();
});

onMounted(() => {
  resetSelection();
});
</script>

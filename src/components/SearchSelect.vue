<template>
  <div>
    <Popover v-slot="{ open }" class="relative h-full">
      <PopoverButton
        :id="label"
        :class="{
          [mainClass]: true,
          'text-gray-400': disabled,
          'hover:border-gray-200': disabled,
        }"
        :disabled="disabled"
        class="group w-full"
        @click="focus(open)"
        @keydown.enter.prevent="focus(open)"
      >
        <div class="relative flex flex-grow items-center justify-between">
          <div
            :class="{
              [optionNameClass]: true,
            }"
            class="flex items-center truncate pr-4 text-left md:flex-grow"
          >
            <p>{{ hasTranslation ? $t(optionName) : optionName }}</p>
          </div>

          <ChevronDownIcon class="h-5 w-5 font-medium" />
        </div>
      </PopoverButton>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <PopoverPanel
          v-slot="{ close }"
          :class="{
            'is-open': open,
            [popoverClass]: true,
            'right-0': right,
            [width]: true,
          }"
          class="absolute z-30 my-1 mt-1 rounded-md border bg-white p-2 text-base font-normal shadow-md"
        >
          <div v-if="showSearchBar" class="flex items-center">
            <input
              ref="input"
              v-model="search"
              :placeholder="placeholder"
              autocomplete="off"
              autocorrect="off"
              class="mb-2 block w-full flex-grow rounded border-none bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              type="text"
              @keydown.esc="close"
              @keydown.up="highlightPrev"
              @keydown.down="highlightNext"
              @keydown.enter.prevent="selectHighlighted(close)"
              @keydown.tab.prevent
            />
          </div>

          <ul
            v-show="filteredOptions.length > 0"
            class="relative mb-0 max-h-[212px] w-full list-none space-y-1 overflow-y-auto overflow-x-hidden border-none pl-0 text-sm leading-6 text-gray-700"
          >
            <li
              v-for="(option, i) in filteredOptions"
              :key="option.id"
              ref="options"
              :class="{
                'is-active bg-gray-100': i === highlightedIndex,
                'font-semibold': option.id === value,
                'text-gray-400': option.disabled,
              }"
              :style="{ 'margin-left': `${option.level * 0.75}rem` }"
              class="relative my-0 cursor-pointer rounded px-2 py-2"
              @click="select(option, close)"
              @mouseover="!option.disabled && (highlightedIndex = i)"
            >
              <div class="flex items-center justify-between leading-tight">
                <div class="mr-6 flex items-center">
                  <span class="flex-grow">{{
                    hasTranslation
                      ? $t(option.formattedName ?? option.name)
                      : option.formattedName ?? option.name
                  }}</span>
                </div>
                <div
                  class="text-primary-500 absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <!-- <IconCheck v-if="value === option.id" class="" /> -->
                  <svg
                    v-if="value === option.id"
                    class="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fill-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <small
                v-if="option.subtitle"
                :class="{
                  'text-primary-500': i === highlightedIndex,
                  'text-gray-500': i !== highlightedIndex,
                }"
                class="leading-snug"
                >{{ option.subtitle }}</small
              >
            </li>
          </ul>
          <div
            v-show="filteredOptions.length === 0"
            class="input-dropdown-empty px-4 py-2 text-gray-500"
          >
            {{ noResultsText }} "{{ search }}"
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script>
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";

const accentsMap = {
  a: "á|à|ã|â|À|Á|Ã|Â",
  e: "é|è|ê|É|È|Ê",
  i: "í|ì|î|Í|Ì|Î",
  o: "ó|ò|ô|õ|Ó|Ò|Ô|Õ",
  u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
  c: "ç|Ç",
  n: "ñ|Ñ",
};
const slugify = (text) =>
  Object.keys(accentsMap).reduce(
    (acc, cur) => acc.replace(new RegExp(accentsMap[cur], "g"), cur),
    text.toLowerCase(),
  );
export default {
  components: {
    Popover,
    PopoverButton,
    PopoverPanel,
    ChevronDownIcon,
  },
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    options: {
      type: [Array],
      default: () => [
        { id: "1", name: "Option 1" },
        { id: "2", name: "Option 2" },
        { id: "3", name: "Option 3" },
      ],
    },
    filterFunction: {
      type: Function,
      default: (search, options) => {
        return options.filter((option) => {
          const regex = new RegExp(`${slugify(search)}`);
          return slugify(option.name).search(regex) !== -1;
        });
      },
    },
    placeholder: {
      type: [String],
      default: "Search",
    },
    mainClass: {
      type: [String],
      default: "bg-white px-4 rounded-lg border border-gray-200",
    },
    popoverClass: {
      type: [String],
      default: "",
    },
    optionNameClass: {
      type: [String],
      default: "",
    },
    defaultOptionName: {
      type: String,
      default: "All",
    },
    canClear: {
      type: Boolean,
      default: false,
    },
    noResultsText: {
      type: String,
      default: "No results found for ",
    },
    label: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // wether to emit the ID or the whole object on click
    emitId: {
      type: Boolean,
      default: true,
    },
    right: {
      type: Boolean,
      default: false,
    },
    alwaysUseDefaultName: {
      type: Boolean,
      default: false,
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    showSearchBar: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: "w-36",
    },
    hasTranslation: {
      type: Boolean,
      default: false,
    },
    isTransparent: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["input"],
  data() {
    return {
      // isOpen: false,
      search: "",
      highlightedIndex: 0,
    };
  },
  computed: {
    // filter displayed options based on search input
    filteredOptions() {
      return this.filterFunction(this.search, this.options);
    },
    // displayed option name
    optionName() {
      if (this.alwaysUseDefaultName) return this.defaultOptionName;
      return (
        this.options.find((e) => e.id === this.value)?.name ||
        this.defaultOptionName
      );
    },
  },
  methods: {
    async focus(open) {
      // when opening, open will actually be false
      if (!open) {
        await this.$nextTick(() => {});
        this.$refs.input?.focus();
        this.scrollToHighlighted();
      }
    },
    // send input event when option is selected
    select(option, close) {
      this.$emit("input", this.emitId ? option.id : option);
      this.search = "";
      this.highlightedIndex = 0;
      close();
    },
    // select with keyboard
    selectHighlighted(close) {
      this.select(this.filteredOptions[this.highlightedIndex], close);
    },
    scrollToHighlighted() {
      this.$refs.options[this.highlightedIndex].scrollIntoView({
        block: "nearest",
      });
    },
    // highlight options for keyboard navigation
    highlight(index) {
      this.highlightedIndex = index;
      if (this.highlightedIndex < 0) {
        this.highlightedIndex = this.filteredOptions.length - 1;
      }
      if (this.highlightedIndex > this.filteredOptions.length - 1) {
        this.highlightedIndex = 0;
      }
      this.scrollToHighlighted();
    },
    highlightPrev() {
      // find the previous index that is not disabled
      // const prev = this.filteredOptions.findIndex(
      //   (e, i) => i < this.highlightedIndex && !e.disabled
      // );
      // to bad we don't have a findLastIndex before index
      let prev = null;
      for (let i = this.highlightedIndex - 1; i >= 0; i--) {
        if (!this.filteredOptions[i].disabled) {
          prev = i;
          break;
        }
      }
      // if it's not before, maybe it's after
      if (prev === null) {
        for (
          let i = this.filteredOptions.length - 1;
          i >= this.highlightedIndex;
          i--
        ) {
          if (!this.filteredOptions[i].disabled) {
            prev = i;
            break;
          }
        }
      }
      this.highlight(prev);
    },
    highlightNext() {
      // find the next index that is not disabled
      let next = this.filteredOptions.findIndex(
        (e, i) => i > this.highlightedIndex && !e.disabled,
      );
      if (next === -1) {
        for (let i = 0; i < this.highlightedIndex; i++) {
          if (!this.filteredOptions[i].disabled) {
            next = i;
            break;
          }
        }
      }
      this.highlight(next);
    },
    clear() {
      this.select("");
    },
  },
};
</script>
<style></style>

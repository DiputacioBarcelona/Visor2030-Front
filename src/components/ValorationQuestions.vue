<template>
  <div>
    <div v-if="loading" class="relative h-20">
      <LoadingSpinner
        :loading="loading"
        class="inset-0"
        bg-color-class="bg-white"
        :border-class="`h-6 w-6 border-2 border-main-80`"
      />
    </div>
    <div v-else-if="includedQuestions.length && hasSurveyData">
      <div class="mt-3 flex gap-x-4 text-sm font-semibold">
        <div><OTText value="SDG" /></div>
        <div><OTText value="QUESTIONS" /></div>
      </div>
      <div
        v-for="(question, i) in surveyQuestionsWithData"
        :key="question.id"
        class="flex break-inside-avoid items-baseline gap-x-6 md:items-start"
      >
        <div
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-none p-0 text-xxs sm:h-5 sm:w-5 sm:text-xs lg:h-6 lg:w-6"
          :class="[
            i === 0 ? 'md:mt-[18px]' : 'md:mt-[30px]',
            {
              [`bg-sdg-${question.ods}`]: true,
              [`text-gray-900`]: darkSDGs.includes(question.ods),
              [`text-white`]: !darkSDGs.includes(question.ods),
            },
          ]"
        >
          {{ question.ods }}
        </div>
        <DisclosureBtn
          :title="question.text"
          class="flex-grow"
          :class="{ 'pb-6 pt-3': i === 0 }"
          panel-class="pt-1 pb-2"
          default-open
        >
          <div>
            <BarChartHeatMapCard
              class="min-h-[195px] max-w-3xl print:min-h-0"
              v-if="
                question[IDS.SURVEY.CHART] === 'heatmap' ||
                question[IDS.SURVEY.CHART] === 'barchart2level'
              "
              :data="question.data"
              :small-mun="smallMun"
              :show-previous-survey="false"
              :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
              :tram-id="tramId"
              :element-name="entity.name"
              :label-left="mdAndLarger"
              :show-segmentation="false"
            />
            <StackedBarChartCard
              v-if="question[IDS.SURVEY.CHART] === 'stacked bar'"
              :data="question.data"
              :selected-element-name="entity.name"
              :small-mun="smallMun"
              :tram-id="tramId"
              :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
              :show-previous-survey="false"
              :question-in-previous-survey="
                !!(
                  question[IDS.SURVEY[`VERSION_${surveyVersion - 1}`]] &&
                  question.data.some((e) => e.numero_respostes_total_previous)
                )
              "
              :show-segmentation="false"
              :previous-year="null"
            />
            <BarChartCard
              v-if="question[IDS.SURVEY.CHART] === 'barchart'"
              :data="question.data"
              :rank="question[IDS.SURVEY.ID] === 'p1_5'"
              :small-mun="smallMun"
              :element-name="entity.name"
              :show-previous-survey="false"
              :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
              :tram-id="tramId"
              :answer-id="question.answerId"
              :label-left="mdAndLarger"
              :show-segmentation="false"
              :use-fixed-height="question.id === 'p5_1'"
            />
          </div>
        </DisclosureBtn>
      </div>
    </div>
  </div>
</template>

<script>
import useFilters from "@/functions/useFilters";
import { basePath } from "@/config";
import api from "@/services/dataDibarometre";
import { useI18n } from "vue-i18n";
import * as IDS from "@/utils/dibarometre/ids";
import { segments } from "@/utils/dibarometre/segments";
import { trams } from "@/utils/dibarometre/trams";
import { darkSDGs } from "@/utils/helpers";

import BarChartHeatMapCard from "@/components/dibarometre/BarChartHeatMapCard.vue";
import StackedBarChartCard from "@/components/dibarometre/StackedBarChartCard.vue";

import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

import { group } from "d3";

import {
  charts,
  allYearOptions,
  getTramId,
  getComarcaId,
  getMunId,
} from "@/utils/dibarometre/helpers";

export default {
  name: "ValorationQuestions",
  components: {
    BarChartHeatMapCard,
    StackedBarChartCard,
  },
  inject: ["entity", "dibarometreData", "dibarometreLoading"],
  data() {
    return {
      loadingContext: false,
      error: false,
      allSurveys: {},
      dictionary: [],
      basePath,
      year: 2023,
      IDS,
      sdgQuestions: [],
      allMunis: [],
      surveyVersion: 2,
      darkSDGs,
    };
  },
  setup() {
    const { id } = useFilters();

    const { t } = useI18n();

    const breakpoints = useBreakpoints(breakpointsTailwind);

    const mdAndLarger = breakpoints.greaterOrEqual("md");

    return {
      id,
      t,
      mdAndLarger,
    };
  },
  computed: {
    data() {
      return this.dibarometreData;
    },
    loading() {
      return this.dibarometreLoading || this.loadingContext;
    },
    munId() {
      return +this.id;
    },
    tramId() {
      return +this.selectedMun[IDS.MUN.TRAM];
    },
    munis() {
      return this.allMunis[this.surveyVersion - 1] || [];
    },
    survey() {
      return this.allSurveys[this.surveyVersion] || [];
    },
    selectedMun() {
      const mun = this.munis.find((e) => e.id === this.munId);

      if (mun) {
        mun.name = mun[IDS.MUN.NAME];
        return mun;
      } else {
        return {
          population_range: [0, 500],
          name: "",
        };
      }
    },
    smallMun() {
      return this.selectedMun[IDS.MUN.TRAM] < 6;
    },
    includedQuestions() {
      return this.sdgQuestions.filter((e) => e.question_id);
    },
    allQuestionIds() {
      return this.includedQuestions.map((e) => e.question_id);
    },
    filteredSurvey() {
      return this.survey.filter((e) =>
        this.allQuestionIds.includes(e[IDS.SURVEY.ID]),
      );
    },
    dataSelectedSurvey() {
      return this.data.filter((e) => e[IDS.VERSION] === this.surveyVersion);
    },
    surveyQuestionsWithData() {
      return this.includedQuestions
        .map((q) => {
          const question =
            this.filteredSurvey.find(
              (e) => e[IDS.SURVEY.ID] === q.question_id,
            ) || {};

          // get data for this question or leave empty (some questions are optional)
          const elements =
            this.filteredDataByQuestion.get(question[IDS.SURVEY.ID]) || [];

          let text = q.question_text;

          return {
            ...question,
            id: `${question[IDS.SURVEY.ID]}${q.answer_id ? `_${q.answer_id}` : ""}`,
            text,
            component: charts[question[IDS.SURVEY.CHART]],
            data: elements
              .filter((e) =>
                question[IDS.SURVEY.ID] === "p3_99" ? e.category : e,
              )
              .sort((a, b) => a[IDS.SURVEY.VALUE] - b[IDS.SURVEY.VALUE]),
            answerId: +q.answer_id, // for some questions we only show one of the answer options
            ods: q.ODS,
          };
        })
        .filter((question) => question.data.length) // remove questions without data
        .sort((a, b) => a.ODS - b.ODS);
    },
    filteredData() {
      if (!this.munis.length || !this.dataSelectedSurvey.length) return [];

      let data = this.smallMun
        ? // for small munis > filter by tram
          this.dataSelectedSurvey.filter(
            (e) => getTramId(e.id) === this.selectedMun[IDS.MUN.TRAM],
          )
        : // for large munis > filter by mun id
          this.dataSelectedSurvey.filter(
            (e) => getMunId(e.id) === this.selectedMun.id,
          );

      // remove elements that are not part of the survey
      data = data.filter((e) => this.allQuestionIds.includes(e[IDS.QUESTION]));

      // remove comarca values (aggregates)
      data = data.filter((e) => !getComarcaId(e.id));

      return data;
    },
    // add missing elements (not sent by api because values are 0)
    filteredDataWithMissingElements() {
      // remove answer options of questions that are not in survey
      const filteredDictionary = this.dictionary.filter((e) =>
        this.allQuestionIds.includes(e[IDS.DICT.ID]),
      );

      // create array to add missing elements to
      const completeData = [...this.filteredData];

      // add elements with 0 answers (otherwise not all answer options get included in the final charts and province values are not correct)
      filteredDictionary.forEach((option) => {
        const question = option[IDS.DICT.ID];
        const answer = +option[IDS.DICT.VALUE];

        // check if element exists
        const found = this.filteredData.find(
          (e) => e[IDS.QUESTION] === question && e[IDS.ANSWER] === answer,
        );
        const verified = this.filteredData.find(
          (e) => e[IDS.QUESTION] === question,
        );

        if (
          // answer option does not exist for this municipi
          !found &&
          // and question does exist for this municipi
          verified
        ) {
          const tram = this.selectedMun[IDS.MUN.TRAM];

          const id = this.smallMun ? `t${tram}` : `m${this.selectedMun.id}`;

          // new element
          completeData.push({
            id: `${question}_${answer}_${id}_${this.surveyVersion}`,
            [IDS.MUN_ID]: id,
            [IDS.TRAM]: tram,
            [IDS.QUESTION]: question,
            [IDS.ANSWER]: answer,
            [IDS.VERSION]: this.surveyVersion,
            numero_respostes_18_24: 0,
            numero_respostes_25_34: 0,
            numero_respostes_35_44: 0,
            numero_respostes_45_54: 0,
            numero_respostes_55_64: 0,
            numero_respostes_dona: 0,
            numero_respostes_home: 0,
            numero_respostes_mes_65: 0,
            numero_respostes_total: 0,
          });
        }
      });

      return completeData;
    },
    // add names to answer options
    filteredDataWithNames() {
      return (
        this.filteredDataWithMissingElements
          .map((e) => {
            // find var in dictionary
            const variable = this.dictionary.find(
              (d) =>
                d[IDS.DICT.ID] === e[IDS.QUESTION] &&
                d[IDS.DICT.VALUE] === e[IDS.ANSWER],
            );

            return {
              ...e,
              name: variable ? variable[IDS.DICT.NAME].trim() : "",
            };
          })
          // client requested to remove these options
          .filter(
            (e) =>
              !(e[IDS.ANSWER] === "p4_7" && !e.name) &&
              !(e[IDS.ANSWER] === "p6_5" && !e.name) &&
              !(e[IDS.ANSWER] === "p6_10" && !e.name) &&
              !(e[IDS.ANSWER] === "p6_11" && !e.name) &&
              !(e[IDS.ANSWER] === "p6_15" && !e.name) &&
              !(e[IDS.ANSWER] === "p9_6" && !e.name),
          )
      );
    },
    filteredDataByQuestion() {
      return group(this.filteredDataWithNames, (d) => d[IDS.QUESTION]);
    },
    hasSurveyData() {
      // no data for Barcelona
      return this.id !== "08019";
    },
  },
  methods: {
    async loadData() {
      try {
        this.loadingContext = true;
        this.error = false;
        const promises = [
          api.getSurvey(),
          api.getDictionary(),
          api.getSdgQuestions(),
          api.getMunis(),
        ];

        const [survey, dictionary, sdgQuestions, allMunis] =
          await Promise.all(promises);

        this.allSurveys = survey;
        this.dictionary = dictionary;
        this.sdgQuestions = sdgQuestions;
        this.allMunis = allMunis;
      } catch (err) {
        this.error = true;
      } finally {
        this.loadingContext = false;
      }
    },
  },
  async mounted() {
    await this.loadData();
  },
};
</script>

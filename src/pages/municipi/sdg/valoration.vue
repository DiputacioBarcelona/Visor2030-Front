<template>
  <div class="">
    <div class="mb-6 mt-8">
      <img
        :src="`${basePath}img/icons/chat-left.svg`"
        alt="Hash icon"
        class="absolute -mt-2 bg-white pr-2"
      />
      <hr class="mb-4 border-dashed border-gray-500 md:mb-8" />

      <div class="flex flex-col gap-y-3 md:flex-row md:justify-between">
        <header>
          <h2 class="ot-title-2 mb-2">
            <OTText value="VALORATION" />
          </h2>
          <div class="ot-line text-sm">
            <OTText
              value="VALORATION_DESCRIPTION"
              :options="{ sdg: t(`SDGS.${sdg}.TITLE`) }"
              markdown
            />
          </div>
          <div class="mt-3 text-sm">
            <OTText
              v-if="!loading && hasSurveyData && !includedQuestions.length"
              value="DIBAROMETRE_NO_QUESTIONS"
            />
            <OTText
              v-else-if="!loading && !hasSurveyData"
              value="DIBAROMETRE_NO_DATA"
              :options="{ municipi: municipality.name }"
            />
          </div>
        </header>
        <OTSelect
          v-if="!loading && includedQuestions.length && hasSurveyData"
          v-model="year"
          :options="yearOptions"
          :allow-search="false"
          class="w-64"
          main-class="bg-grey-mig py-2 md:py-3 px-4 md:px-6 rounded-3xl font-medium text-xs md:text-sm text-text-normal"
          popover-class="w-full"
        />
      </div>
    </div>

    <div v-if="loading" class="relative h-20">
      <LoadingSpinner
        :loading="loading"
        class="inset-0"
        bg-color-class="bg-white"
        :border-class="`h-6 w-6 border-2 border-main-80`"
      />
    </div>
    <div
      v-else-if="
        includedQuestions.length && hasSurveyData && !filteredSurvey.length
      "
      class="text-sm"
    >
      <OTText value="DIBAROMETRE_NO_DATA_YEAR" />
    </div>
    <div v-else-if="includedQuestions.length && hasSurveyData">
      <DisclosureBtn
        v-for="question in surveyQuestionsWithData"
        :key="question.id"
        :title="question.text"
        default-open
      >
        <div>
          <BarChartHeatMapCard
            v-if="
              question[IDS.SURVEY.CHART] === 'heatmap' ||
              question[IDS.SURVEY.CHART] === 'barchart2level'
            "
            :data="question.data"
            :small-mun="smallMun"
            :show-previous-survey="
              showPreviousSurveyForThisQuestion(question, surveyVersion)
            "
            :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
            :tram-id="tramId"
            :comarca-id="comarcaId"
            :previous-year="previousYear"
            :element-name="municipality.name"
            :label-left="mdAndLarger"
          />
          <StackedBarChartCard
            v-if="question[IDS.SURVEY.CHART] === 'stacked bar'"
            :data="question.data"
            :selected-element-name="municipality.name"
            :small-mun="smallMun"
            :tram-id="tramId"
            :comarca-id="comarcaId"
            :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
            :show-previous-survey="
              showPreviousSurveyForThisQuestion(question, surveyVersion)
            "
            :question-in-previous-survey="
              !!(
                question[IDS.SURVEY[`VERSION_${surveyVersion - 1}`]] &&
                question.data.some((e) => e.numero_respostes_total_previous)
              )
            "
            :previous-year="previousYear"
          />
          <BarChartCard
            v-if="question[IDS.SURVEY.CHART] === 'barchart'"
            :data="question.data"
            :rank="question[IDS.SURVEY.ID] === 'p1_5'"
            :small-mun="smallMun"
            :element-name="municipality.name"
            :show-previous-survey="
              showPreviousSurveyForThisQuestion(question, surveyVersion)
            "
            :is-specific="!!question[IDS.SURVEY[`SPECIFIC_${surveyVersion}`]]"
            :tram-id="tramId"
            :comarca-id="comarcaId"
            :previous-year="previousYear"
            :answer-id="question.answerId"
            :label-left="mdAndLarger"
          />
        </div>
      </DisclosureBtn>
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
  name: "valoracio",
  components: {
    BarChartHeatMapCard,
    StackedBarChartCard,
  },
  inject: ["municipality", "dibarometreData", "dibarometreLoading"],
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
    };
  },
  setup() {
    const { id, sdg } = useFilters();

    const { t } = useI18n();

    const breakpoints = useBreakpoints(breakpointsTailwind);

    const mdAndLarger = breakpoints.greaterOrEqual("md");

    const data = inject("entity");

    useHead({
      title: () =>
        `${sdg.value} - ${t(`SDGS.${sdg.value}.TITLE`)} - ${t(`VALORATION`)} - ${data.value.municipality_name}`,
    });

    return {
      id,
      sdg,
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
    comarcaId() {
      return +this.selectedMun[IDS.MUN.COM];
    },
    comarcaName() {
      return this.selectedMun[IDS.MUN.COM_NAME];
    },
    tramId() {
      return +this.selectedMun[IDS.MUN.TRAM];
    },
    previousTram() {
      return this.munisPreviousSurvey
        ? +this.munisPreviousSurvey.find(
            (m) => m[IDS.MUN.ID] === this.selectedMun[IDS.MUN.ID],
          )?.[IDS.MUN.TRAM]
        : null;
    },
    munis() {
      return this.allMunis[this.surveyVersion - 1] || [];
    },
    munisPreviousSurvey() {
      return this.surveyVersion > 1
        ? this.allMunis[this.surveyVersion - 2]
        : [];
    },
    surveyVersion() {
      return (
        allYearOptions.find((option) => option.id === this.year)?.version || 2
      );
    },
    survey() {
      return this.allSurveys[this.surveyVersion] || [];
    },
    previousYear() {
      const index = allYearOptions.findIndex(
        (option) => option.id === this.year,
      );
      return allYearOptions[index - 1]?.id || null;
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
      return this.sdgQuestions.filter(
        (e) => +e.ODS === +this.sdg && e.question_id,
      );
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
    dataPreviousSurvey() {
      return this.data.filter((e) => e[IDS.VERSION] === this.surveyVersion - 1);
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
          };
        })
        .filter((question) => question.data.length) // remove questions without data
        .sort((a, b) => a[IDS.SURVEY.ORDER] - b[IDS.SURVEY.ORDER]);
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
    filteredDataPreviousSurvey() {
      if (!this.previousYear) return null;

      return this.smallMun
        ? // for small munis > filter by tram
          this.dataPreviousSurvey.filter(
            (e) => getTramId(e.id) === this.selectedMun[IDS.MUN.TRAM],
          )
        : // for large munis > filter by mun id
          this.dataPreviousSurvey.filter(
            (e) => getMunId(e.id) === this.selectedMun.id,
          );
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
    // with province, comarca, tram and previous values
    filteredDataWithAggregatesAndPreviousValues() {
      // store all comarca data (to aggregate into province value)
      const allComarcaValues = this.dataSelectedSurvey.filter((e) =>
        getComarcaId(e.id),
      );
      const allComarcaValuesPrevious = this.dataPreviousSurvey.filter((e) =>
        getComarcaId(e.id),
      );
      // group elements by question and answer option
      const groupedComarcaValues = group(
        allComarcaValues,
        (d) => d[IDS.QUESTION],
        (d) => d[IDS.ANSWER],
      );

      const groupedComarcaValuesPrevious = group(
        allComarcaValuesPrevious,
        (d) => d[IDS.QUESTION],
        (d) => d[IDS.ANSWER],
      );

      const comarcaValues = !this.smallMun
        ? this.dataSelectedSurvey.filter(
            (e) => getComarcaId(e.id) === this.comarcaId,
          )
        : [];
      const comarcaValuesPrevious = !this.smallMun
        ? this.dataPreviousSurvey.filter(
            (e) => getComarcaId(e.id) === this.comarcaId,
          )
        : [];

      const tramId = this.selectedMun[IDS.MUN.TRAM];

      const tramValues = !this.smallMun
        ? this.dataSelectedSurvey.filter((e) => getTramId(e.id) === tramId)
        : [];
      const tramValuesPrevious = !this.smallMun
        ? this.dataPreviousSurvey.filter((e) => getTramId(e.id) === tramId)
        : [];

      // add aggregated values to each element
      const processedData = this.filteredDataWithNames.map((e) => {
        const element = {
          ...e,
        };

        // store all elements of the same question+answer option
        const answers =
          groupedComarcaValues?.get(e[IDS.QUESTION])?.get(e[IDS.ANSWER]) || [];
        const answersPrevious =
          groupedComarcaValuesPrevious
            ?.get(e[IDS.QUESTION])
            ?.get(e[IDS.ANSWER]) || [];

        Object.keys(segments).forEach((segment) => {
          // store province value by adding up values for comarcas
          element[segment + "_provincia"] = answers.reduce(
            (acc, cur) => acc + cur[segment],
            0,
          );

          // add comarca and tram value for large municipis
          if (!this.smallMun) {
            const elementTram = tramValues.find(
              (d) =>
                d[IDS.QUESTION] === e[IDS.QUESTION] &&
                d[IDS.ANSWER] === e[IDS.ANSWER],
            );

            element[segment + "_tram"] = elementTram ? elementTram[segment] : 0;

            // find the same element in comarca data
            const elementComarca = comarcaValues.find(
              (d) =>
                d[IDS.QUESTION] === e[IDS.QUESTION] &&
                d[IDS.ANSWER] === e[IDS.ANSWER],
            );

            element[segment + "_comarca"] = elementComarca
              ? elementComarca[segment]
              : 0;
          }

          if (this.previousYear) {
            const elementPrevious = this.filteredDataPreviousSurvey.find(
              (d) => {
                // find same question+answer element in previous survey
                return (
                  d[IDS.QUESTION] === e[IDS.QUESTION] &&
                  d[IDS.ANSWER] === e[IDS.ANSWER]
                );
              },
            );

            element[segment + "_previous"] = elementPrevious
              ? elementPrevious[segment]
              : 0;

            // add previous province value
            if (segment === "numero_respostes_total") {
              element[segment + "_provincia_previous"] = answersPrevious.reduce(
                (acc, cur) => acc + cur[segment],
                0,
              );

              if (!this.smallMun) {
                // previous comarca
                const elementComarcaPrevious = comarcaValuesPrevious.find(
                  (d) =>
                    d[IDS.QUESTION] === e[IDS.QUESTION] &&
                    d[IDS.ANSWER] === e[IDS.ANSWER],
                );

                element[segment + "_comarca_previous"] = elementComarcaPrevious
                  ? elementComarcaPrevious[segment]
                  : 0;

                const elementTramPrevious = tramValuesPrevious.find(
                  (d) =>
                    d[IDS.QUESTION] === e[IDS.QUESTION] &&
                    d[IDS.ANSWER] === e[IDS.ANSWER],
                );

                element[segment + "_tram_previous"] = elementTramPrevious
                  ? elementTramPrevious[segment]
                  : 0;
              }
            }
          }
        });

        return element;
      });

      return processedData;
    },
    filteredDataByQuestion() {
      return group(
        this.filteredDataWithAggregatesAndPreviousValues,
        (d) => d[IDS.QUESTION],
      );
    },
    changedTram() {
      if (this.surveyVersion > 1) {
        const previousTram = this.previousTram;
        const currentTram = this.tramId;

        // if muni went from small (tram < 6) to large (tram => 6)
        // don't allow comparing with previous survey
        if (currentTram >= 6 && previousTram < 6) return true;
        if (currentTram < 6 && previousTram >= 6) return true;
      }

      return false;
    },
    isLastYear() {
      return this.year === allYearOptions[allYearOptions.length - 1].id;
    },
    yearOptions() {
      if (!this.munId || !this.data.length) return allYearOptions;
      else {
        let options = [];

        // check if element exists in data for each version
        for (let i = 0; i < this.data.length; i++) {
          const d = this.data[i];

          // for small muns, use tram id
          const usedId = this.smallMun ? this.tramId : this.munId;
          const getId = this.smallMun
            ? (id) => getTramId(id)
            : (id) => getMunId(id);

          // municipality changed from small to large or viceversa
          if (this.changedTram) {
            const currentTram = this.tramId;
            const previousTram = this.previousTram;

            if (currentTram > previousTram) {
              if (
                getId(d.id) == usedId ||
                // if it previously was a small muni, use tram id
                (d[IDS.VERSION] === this.surveyVersion - 1 &&
                  getTramId(d.id) === previousTram)
              ) {
                const option = allYearOptions.find(
                  (option) => d[IDS.VERSION] === option.version,
                );
                if (
                  option &&
                  !options.find((e) => e.version === d[IDS.VERSION])
                )
                  options.push(option);

                if (options.length === allYearOptions.length) break;
              }
            } else if (currentTram < previousTram) {
              if (
                getId(d.id) == usedId ||
                // if it previously was a large muni, use mun id
                (d[IDS.VERSION] === this.surveyVersion - 1 &&
                  getMunId(d.id) === this.munId)
              ) {
                const option = allYearOptions.find(
                  (option) => d[IDS.VERSION] === option.version,
                );
                if (option) options.push(option);

                if (options.length === allYearOptions.length) break;
              }
            }
          } else {
            if (
              (getId(d.id) == usedId ||
                (this.changedTram && d[IDS.MUN_ID] == this.munId)) &&
              !options.find((o) => o.version === d[IDS.VERSION])
            ) {
              const option = allYearOptions.find(
                (option) => d[IDS.VERSION] === option.version,
              );
              if (option) options.push(option);

              if (options.length === allYearOptions.length) break;
            }
          }
        }

        return options;
      }
    },
    showPreviousSurvey() {
      return !this.changedTram;
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
    showPreviousSurveyForThisQuestion(question, surveyVersion) {
      return !!(
        // check if question doesn't have a variable component
        (
          (!question[IDS.SURVEY.VARIABLE] &&
            // check if muni changed tram from small to large
            this.showPreviousSurvey &&
            // check if question was part of previous survey
            question[IDS.SURVEY[`VERSION_${surveyVersion - 1}`]] &&
            // check if this municipality has data for this question on previous survey
            question.data.some((e) => e.numero_respostes_total_previous)) ||
          (question[IDS.SURVEY.ID] === "p3_99" && this.showPreviousSurvey)
        )
      );
    },
  },
  async mounted() {
    await this.loadData();
  },
};
</script>

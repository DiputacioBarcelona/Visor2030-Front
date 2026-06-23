import Template from "./pages/template.vue";
import Home from "./pages/index.vue";
import Debug from "./pages/debug.vue";
import Comarca from "./pages/comarca.vue";
import ComarcaIndex from "./pages/comarca/index.vue";
import ComarcaIndicator from "./pages/comarca/sdg/indicator.vue";
import Agregacio from "./pages/agregacio.vue";
import AgregacioIndex from "./pages/agregacio/index.vue";
import AgregacioIndicator from "./pages/agregacio/sdg/indicator.vue";
import Municipi from "./pages/municipi.vue";
import MunicipiIndex from "./pages/municipi/index.vue";
import MunicipiIndicator from "./pages/municipi/sdg/indicator.vue";
import SDGLayout from "./components/sdg/sdg-layout.vue";
import MunicipiPrograms from "./pages/municipi/programs.vue";
import SDGLayoutBudget from "./pages/municipi/sdg/budget.vue";
import SDGLayoutPlans from "./pages/municipi/sdg/plans.vue";
import SDGLayoutValoration from "./pages/municipi/sdg/valoration.vue";
import SDGTargets from "./components/sdg/targets.vue";
import SDGTarget from "./components/sdg/target.vue";
import Analisi from "./pages/analisi.vue";
import Metodologia from "./pages/metodologia.vue";
import About from "./pages/about.vue";
import ODS from "./pages/ods.vue";
import NotFound from "./pages/[...404].vue";
import AvisLegal from "./pages/avis-legal.vue";

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  {
    path: "/:locale?",
    component: Template,
    children: [
      {
        path: "",
        name: "home",
        component: Home,
        meta: {
          title: "Home",
        },
      },
      {
        path: "analisi",
        name: "analisi",
        component: Analisi,
        meta: {
          title: "Anàlisi",
        },
      },
      {
        path: "metodologia",
        name: "metodologia",
        component: Metodologia,
        meta: {
          title: "Metodologia",
        },
      },
      {
        path: "sobre-el-visor",
        name: "about",
        component: About,
        meta: {
          title: "Sobre el Visor",
        },
      },
      {
        path: "avis-legal",
        name: "legal",
        component: AvisLegal,
        meta: {
          title: "Avís legal",
        },
      },
      {
        path: "debug",
        name: "debug",
        component: Debug,
      },
      {
        path: "ods/:sdg",
        name: "sdg",
        component: ODS,
        meta: {
          title: "ODS",
        },
      },
      {
        path: "comarques/:comarcaId",
        component: Comarca,
        meta: { title: "Comarca", entityType: "comarca" },
        children: [
          {
            path: "",
            name: "comarca",
            component: ComarcaIndex,
          },
          {
            path: ":sdg",
            name: "comarca-sdg",
            component: SDGLayout,
            children: [
              {
                path: "indicadors",
                name: "comarca-sdg-targets",
                component: SDGTargets,
                children: [
                  {
                    path: ":targetId",
                    name: "comarca-target",
                    component: SDGTarget,
                    children: [
                      {
                        path: ":indicatorId",
                        name: "comarca-indicator",
                        component: ComarcaIndicator,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "agregacions/:agregacioId",
        component: Agregacio,
        meta: { title: "Agregacio", entityType: "agregacio" },
        children: [
          {
            path: "",
            name: "agregacio",
            component: AgregacioIndex,
          },
          {
            path: ":sdg",
            name: "agregacio-sdg",
            component: SDGLayout,
            children: [
              {
                path: "indicadors",
                name: "agregacio-sdg-targets",
                component: SDGTargets,
                children: [
                  {
                    path: ":targetId",
                    name: "agregacio-target",
                    component: SDGTarget,
                    children: [
                      {
                        path: ":indicatorId",
                        name: "agregacio-indicator",
                        component: AgregacioIndicator,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "municipis/:id",
        component: Municipi,
        meta: {
          title: "Municipi",
          entityType: "municipi",
        },
        children: [
          {
            path: "",
            name: "municipi",
            component: MunicipiIndex,
          },
          {
            path: "programes",
            name: "municipi-programs",
            component: MunicipiPrograms,
          },
          {
            path: ":sdg",
            name: "municipi-sdg",
            component: SDGLayout,
            children: [
              {
                path: "indicadors",
                name: "municipi-sdg-targets",
                component: SDGTargets,
                children: [
                  {
                    path: ":targetId",
                    name: "municipi-target",
                    component: SDGTarget,
                    children: [
                      {
                        path: ":indicatorId",
                        name: "municipi-indicator",
                        component: MunicipiIndicator,
                      },
                    ],
                  },
                ],
              },
              {
                path: "pressupost/:targetId?",
                name: "municipi-sdg-budget",
                component: SDGLayoutBudget,
              },
              {
                path: "plans-estrategics",
                name: "municipi-sdg-plans",
                component: SDGLayoutPlans,
              },
              {
                path: "valoracio-ciutadana",
                name: "municipi-sdg-valoration",
                component: SDGLayoutValoration,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/:path(.*)", component: NotFound },
];

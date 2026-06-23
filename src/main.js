import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router/auto";
import { createHead } from "@unhead/vue";
import { routes } from "./routes.js";
import { createI18n } from "vue-i18n";
import ca from "./locales/ca.json";
import es from "./locales/es.json";
import en from "./locales/en.json";

export const SUPPORTED_LOCALES = ["ca", "es", "en"];
export const DEFAULT_LOCALE = "ca";

const app = createApp(App);

const head = createHead();

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  extendRoutes: (/* routes */) => {
    // const adminRoute = routes.find((r) => r.name === '/admin')
    // if (adminRoute) {
    //   adminRoute.meta ??= {}
    //   adminRoute.meta.requiresAuth = true
    // }
    // // completely optional since we are modifying the routes in place
    return routes;
  },
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      // if mobile
      const top = window.innerWidth < 768 ? 150 : 198;

      return {
        el: to.hash,
        behavior: "smooth",
        top,
      };
    }

    // if from route name is municipi and to route name is municipi-sdg, municipi-target or municipi-indicator, scroll to 256

    const isInnerPage = [
      "municipi-sdg",
      "municipi-target",
      "municipi-indicator",
      "municipi-sdg-budget",
    ].includes(to.name);

    if (from.name === "municipi" && isInnerPage) {
      // return { top: 256 };
    }

    // if isInnerPage but previous page was none
    if (isInnerPage && !from.name) {
      // return { top: 256 };
    }
    // if going from municipi-indicator to municipi-sdg-budget or vice versa, do nothing
    if (
      (from.name === "municipi-indicator" &&
        to.name === "municipi-sdg-budget") ||
      (from.name === "municipi-sdg-budget" && to.name === "municipi-indicator")
    ) {
      return false;
    }
    if (to.name !== from.name) {
      return { top: 0 };
    }
  },
});

// Middleware to enforce correct locale logic
router.beforeEach((to, from, next) => {
  const locale = to.params.locale;

  // if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
  //   // If no locale, assume default
  //   to.params.locale = DEFAULT_LOCALE;

  //   // Redirect to prefixless route only if default
  //   if (locale && locale !== DEFAULT_LOCALE) {
  //     return next({
  //       name: to.name,
  //       params: { ...to.params, locale: undefined },
  //       query: to.query,
  //       hash: to.hash,
  //     });
  //   }

  //   return next();
  // }

  const newLocale = SUPPORTED_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE;

  if (i18n.global.locale.value !== newLocale) {
    i18n.global.locale.value = newLocale;
    document.documentElement.setAttribute("lang", newLocale);
  }

  next();
});

const i18n = createI18n({
  // vue-i18n options
  legacy: false, // to use Composition API
  globalInjection: true, // use $t directly in template
  locale: "ca", // https://vue-i18n.intlify.dev/guide/advanced/composition.html#locale-changing
  fallbackLocale: "ca",
  messages: {
    ca,
    es,
    en,
  },
});

app.use(router);
app.use(head);
app.use(i18n);
app.mount("#app");

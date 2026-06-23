<template>
  <div class="bg-white">
    <div class="ot-container py-4">
      <div class="grid items-center gap-4 md:grid-cols-2">
        <img src="/img/logo-ministerio.png" alt="Ministerio" class="w-full" />
        <div class="text-xs">
          Esta publicación ha sido realizada con el apoyo financiero del
          Ministerio de Derechos Sociales, Consumo y Agenda 2030. El contenido
          de dicha publicación es responsabilidad exclusiva de la entidad
          subvencionada y no refleja necesariamente la opinión del Ministerio de
          Derechos Sociales, Consumo y Agenda 2030
        </div>
      </div>
    </div>

    <div
      class="ot-container border-t-grey-2 border-b-4 border-t-8 border-b-primary pb-14 pt-8 text-sm"
    >
      <div
        class="mb-6 grid gap-6 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 xl:gap-x-12"
      >
        <div>
          <DibaIcon class="text-primary" />
        </div>
        <div v-for="section in 3">
          <h4 class="mb-2 px-3 font-semibold">
            <OTText :value="`footer.sections.${section}.title`" />
          </h4>
          <ul class="">
            <li v-for="item in 3" class="border-grey-3 border-b">
              <a
                class="hover:bg-grey-2 inline-block w-full px-3 py-1.5"
                :href="$t(`footer.sections.${section}.items.${item}.link`)"
                target="_blank"
                ><OTText
                  :value="`footer.sections.${section}.items.${item}.text`"
              /></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="sm:gap-10 lg:grid lg:grid-cols-4 xl:gap-x-12">
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-3 sm:flex-nowrap sm:gap-x-10 lg:col-span-2 lg:col-start-2"
        >
          <a
            href="https://www.facebook.com/DiputaciodeBarcelona"
            target="_blank"
          >
            <img
              src="/img/IconesXSS/facebook.svg"
              class="h-8 w-8"
              alt="Facebook"
            />
          </a>
          <a href="https://x.com/Diba?mx=2" target="_blank">
            <img src="/img/IconesXSS/x.svg" alt="X" class="h-8 w-8" />
          </a>
          <a href="https://www.youtube.com/user/Diba" target="_blank">
            <img
              src="/img/IconesXSS/youtube.svg"
              alt="YouTube"
              class="h-8 w-8"
            />
          </a>
          <a href="https://www.instagram.com/dibacat/" target="_blank">
            <img
              src="/img/IconesXSS/insta.svg"
              alt="Instagram"
              class="h-8 w-8"
            />
          </a>
          <a href="https://www.linkedin.com/company/348352" target="_blank">
            <img
              src="/img/IconesXSS/linkedin.svg"
              alt="LinkedIn"
              class="h-8 w-8"
            />
          </a>
          <a href="https://www.tiktok.com/@diputaciobarcelona" target="_blank">
            <img src="/img/IconesXSS/tiktok.svg" alt="TikTok" class="h-8 w-8" />
          </a>
          <a href="https://t.me/diputaciobarcelona" target="_blank">
            <img
              src="/img/IconesXSS/telegram.svg"
              alt="Telegram"
              class="h-8 w-8"
            />
          </a>
          <a href="https://www.threads.net/@dibacat" target="_blank">
            <img
              src="/img/IconesXSS/threads.svg"
              alt="Threads"
              class="h-8 w-8"
            />
          </a>
          <a
            href="https://bsky.app/profile/diputaciobarcelona.bsky.social"
            target="_blank"
          >
            <img
              src="/img/IconesXSS/bluesky.svg"
              alt="Threads"
              class="h-8 w-8"
            />
          </a>
        </div>
      </div>

      <div
        class="mt-6 gap-x-12 text-xs font-semibold sm:mt-10 sm:flex lg:grid lg:grid-cols-4 xl:gap-x-12"
      >
        <div
          class="mb-3 flex flex-shrink-0 gap-x-5 sm:mb-0 sm:gap-x-3 xl:gap-x-6"
        >
          <!-- <a :href="$t('footer.legal.link')" class="hover:underline"
            ><OTText value="footer.legal.text"
          /></a> -->
          <RouterLink :to="{ name: 'legal' }" class="hover:underline"
            ><OTText value="footer.legal.text"
          /></RouterLink>
          <a :href="$t('footer.access.link')" class="hover:underline"
            ><OTText value="footer.access.text"
          /></a>
          <a :href="$t('footer.mapa.link')" class="hover:underline"
            ><OTText value="footer.mapa.text"
          /></a>
        </div>
        <div class="col-span-2 col-start-2">
          <OTText value="footer.address" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style lang="scss" scoped></style>

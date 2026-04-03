<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"
import "vue-sonner/style.css"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "toastOptions")
</script>

<template>
  <Sonner
    class="toaster group !z-[9999]"
    v-bind="delegatedProps"
    :toast-options="{
      classes: {
        toast: 'group toast !z-[9999] group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-3xl p-6 font-sans',
        description: 'group-[.toast]:text-muted-foreground group-[.toast]:italic group-[.toast]:font-medium text-[11px]',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:h-9 group-[.toast]:font-black text-[10px] uppercase tracking-widest',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:h-9',
      },
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-5 text-emerald-500" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-5 text-blue-500" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-5 text-amber-500" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-5 text-destructive" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-5 animate-spin text-primary" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

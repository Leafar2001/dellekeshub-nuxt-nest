<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { type ButtonVariants, buttonVariants } from '.'
import { useStorage } from '@vueuse/core'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})

const specialColor = ref()

function colorIsDarkSimple(hexColor: String) {
  if (typeof hexColor !== 'string') return
  let color = (hexColor.charAt(0) === '#') ? hexColor.substring(1, 7) : hexColor;
  let r = parseInt(color.substring(0, 2), 16); // hexToR
  let g = parseInt(color.substring(2, 4), 16); // hexToG
  let b = parseInt(color.substring(4, 6), 16); // hexToB
  return ((r * 0.299) + (g * 0.587) + (b * 0.114)) <= 150;
}

onBeforeMount(() => {
  specialColor.value = useStorage("special-color-preference", "")
})
</script>

<template>
  <Primitive data-slot="button" :as="as" :as-child="asChild"
    :class="[cn(buttonVariants({ variant, size }), props.class), props.variant === 'special' ? (colorIsDarkSimple(specialColor.value) ? 'text-white' : 'text-black') : '']">
    <slot />
  </Primitive>
</template>

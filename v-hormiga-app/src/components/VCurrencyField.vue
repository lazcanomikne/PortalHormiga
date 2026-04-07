<script setup lang="ts">
import { watch } from 'vue';
import { useCurrencyInput } from 'vue-currency-input';

const props = defineProps({ modelValue: Number, label: String, currency: String, isLabel: Boolean });

const { inputRef, formattedValue, numberValue, setValue, setOptions } = useCurrencyInput({
  currency: props.currency || 'MXN',
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  precision: 0,
  valueRange: { min: 0 },
});

watch(
  () => props.modelValue,
  (value) => {
    setValue(value);
  },
);
watch(
  () => props.currency,
  (value) => {
    setOptions({
      currency: value
    });
  }
)
</script>

<template>
  <template v-if="isLabel">
    <VTextField variant="plain" v-model="formattedValue" hide-details density="compact" readonly ref="inputRef"
      :label="label">
    </VTextField>
  </template>
  <template v-else>
    <VTextField :prefix="props.currency" v-model="props.modelValue" hide-details density="compact" :label="label"
      ref="inputRef">
    </VTextField>
  </template>
</template>

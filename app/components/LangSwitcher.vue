<template>
  <div class="mr-2">
    <select 
      :value="locale" 
      @change="setLocale($event.target.value)"
      class="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>
  </div>
</template>

<script setup>
const { locale, setLocale } = useI18n()
</script>
<template>
  <UModal :open="isOpen" :title="title" @update:open="handleModalChange" >
    <template #body>
      <div class="flex items-center gap-3 p-2">
        <div class="w-10 h-10 bg-theme rounded-full flex-center">
          <UIcon :name="icon" class="text-white w-5 h-5" />
        </div>
        <div>
          <p class="text-white">{{ message }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 ">
        <UButton 
          :label="cancelText"
          @click="handleCancel"
          :disabled="loading"
        />
        <UButton 
          :label="loading ? loadingText : confirmText"
          @click="handleConfirm"
          :loading="loading"
          :disabled="loading"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  loadingText: { type: String, default: 'Processing...' },
  icon: { type: String, default: 'i-lucide-alert-triangle' },
  loading: Boolean
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleModalChange = (value) => {
  if (!value) {
    emit('cancel')
  }
}
</script>


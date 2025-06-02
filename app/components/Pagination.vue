<template>
  <div class="flex-center mt-2">
    <UPagination
      :page="currentPage"
      :items-per-page="itemsPerPage"
      :total="total"
      :disabled="loading"
      size="sm"
      color="custom"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 12,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["page-change"]);

const total = computed(() => props.totalPages * props.itemsPerPage);

const handlePageChange = (page) => {
  emit("page-change", page);
};
</script>
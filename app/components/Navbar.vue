<!-- components/Sidebar.vue -->
<template>
  <div class="flex h-screen bg-primary transition-all duration-300">
    <!-- Sidebar -->
    <div :class="[
      'bg-theme shadow-lg transition-all duration-300 ease-in-out flex flex-col relative z-[1001]',
      isCollapsed ? 'w-16' : 'w-72'
    ]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/20">
        <h1 v-if="!isCollapsed" class="font-bold text-white">{{ appName }}</h1>
        <UButton
          :icon="isCollapsed ? 'i-lucide-menu' : 'i-lucide-x'"
          color="white"
          variant="ghost"
          size="sm"
          @click="toggleSidebar"
          class="text-white hover:bg-white/10"
        />
      </div>

      <!-- Top Controls -->
      <div class="border-b border-white/20 p-4 space-y-3">
        <ThemeSwitcher :is-collapsed="isCollapsed" />
        <ColorPicker :is-collapsed="isCollapsed" />
        <LangSwitcher :is-collapsed="isCollapsed" :show-label="!isCollapsed" />
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div class="space-y-2">
          <div v-for="item in navigationItems" :key="item.key">
            <!-- Collapsed: Icon with tooltip -->
            <UTooltip v-if="isCollapsed" :text="item.label" :popper="{ placement: 'right' }">
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center justify-center p-2 rounded-lg transition-all duration-200',
                  activeItem === item.key
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                ]"
                @click="setActiveItem(item.key)"
              >
                <UIcon :name="item.icon" class="w-5 h-5" />
              </NuxtLink>
            </UTooltip>

            <!-- Expanded: Full menu item -->
            <NuxtLink
              v-else
              :to="item.to"
              :class="[
                'flex items-center px-3 py-2 rounded-lg transition-all duration-200 group w-full',
                activeItem === item.key
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              ]"
              @click="setActiveItem(item.key)"
            >
              <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium text-sm truncate ml-3">{{ item.label }}</span>
              <UBadge v-if="item.badge" color="red" size="xs" class="ml-auto">
                {{ item.badge }}
              </UBadge>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Bottom Section -->
      <div class="border-t border-white/20 p-4 space-y-3">
        <!-- Cart Button -->
        <div v-if="!isCollapsed">
          <CartDrawer />
        </div>
        <UTooltip v-else :text="$t('sidebar.cart')" :popper="{ placement: 'right' }">
          <UButton
            icon="i-lucide-shopping-cart"
            color="white"
            variant="ghost"
            size="sm"
            class="text-white hover:bg-white/10 relative w-full justify-center"
            @click="openCartDrawer"
          >
            <UBadge 
              v-if="cartItemsCount > 0" 
              color="red" 
              size="xs"
              class="absolute -top-1 -right-1 min-w-[16px] h-4 text-xs"
            >
              {{ cartItemsCount }}
            </UBadge>
          </UButton>
        </UTooltip>

        <!-- Logout Button -->
        <UTooltip v-if="isCollapsed" :text="$t('sidebar.logout')" :popper="{ placement: 'right' }">
          <UButton
            icon="i-lucide-log-out"
            color="white"
            variant="ghost"
            size="sm"
            @click="isLogoutModalOpen = true"
            class="w-full text-white hover:bg-white/10 justify-center"
          />
        </UTooltip>
        <UButton
          v-else
          icon="i-lucide-log-out"
          :label="$t('sidebar.logout')"
          color="white"
          variant="ghost"
          size="sm"
          @click="isLogoutModalOpen = true"
          class="w-full text-white hover:bg-white/10"
        />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto bg-primary p-4">
        <slot />
      </main>
    </div>

    <!-- Logout Modal -->
    <ConfirmModal
      :is-open="isLogoutModalOpen"
      :title="$t('sidebar.confirmLogout')"
      :message="$t('sidebar.logoutMessage')"
      :confirm-text="$t('sidebar.logout')"
      icon="i-lucide-log-out"
      :loading="isLoggingOut"
      @confirm="handleLogout"
      @cancel="isLogoutModalOpen = false"
    />

    <UNotifications />
  </div>
</template>

<script setup>
// Composables
const { appName } = useRuntimeConfig().public
const { t } = useI18n()
const localePath = useLocalePath()
const { logout } = useAuthEnhanced()
const { initTheme } = useAppTheme()
const toast = useToast()

// Persistent state (cookies only)
const isCollapsed = useCookie('sidebar-collapsed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: 'lax'
})

const activeItem = useCookie('sidebar-active-item', {
  default: () => 'men',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax'
})

// Local state
const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)
const cartItemsCount = ref(3)

// Navigation configuration
const navigationConfig = [
  { key: "men", translationKey: "sidebar.men", icon: "i-lucide-user", route: "/men" },
  { key: "women", translationKey: "sidebar.women", icon: "i-lucide-user", route: "/women" },
  { key: "electronics", translationKey: "sidebar.electronics", icon: "i-lucide-smartphone", route: "/electronics" },
  { key: "sale", translationKey: "sidebar.sale", icon: "i-lucide-tag", badgeKey: "sidebar.hot", route: "/sale" }
]

// Computed navigation items
const navigationItems = computed(() => {
  return navigationConfig.map(item => ({
    key: item.key,
    label: t(item.translationKey),
    icon: item.icon,
    to: localePath(item.route),
    badge: item.badgeKey ? t(item.badgeKey) : undefined
  }))
})

// Methods
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const setActiveItem = (itemKey) => {
  activeItem.value = itemKey
}

const openCartDrawer = () => {
  toast.add({
    title: t('sidebar.cartOpened'),
    description: t('sidebar.cartItems', { count: cartItemsCount.value }),
    icon: "i-lucide-shopping-cart",
    timeout: 3000
  })
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await logout('manual')
    isLogoutModalOpen.value = false

    toast.add({
      title: t('sidebar.logoutSuccess'),
      description: t('sidebar.logoutSuccessMessage'),
      icon: "i-lucide-check-circle",
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    toast.add({
      title: t('sidebar.logoutFailed'),
      description: t('sidebar.logoutFailedMessage'),
      icon: "i-lucide-x-circle",
    })
  } finally {
    isLoggingOut.value = false
  }
}

// Initialize theme on mount
onMounted(() => {
  initTheme()
})
</script>
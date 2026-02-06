<script setup lang="ts">
// Fetch photos directly from S3 (client-side only)
const { photos, loading, error, fetchPhotos, refresh } = useS3Photos()

const hasPhotos = computed(() => photos.value.length > 0)

// Fetch photos on mount
onMounted(async () => {
  await fetchPhotos()
})

// Lightbox state
const showLightbox = ref(false)
const currentPhotoIndex = ref(0)

function openLightbox(index: number) {
  currentPhotoIndex.value = index
  showLightbox.value = true
}

function closeLightbox() {
  showLightbox.value = false
}

function navigateToPhoto(index: number) {
  currentPhotoIndex.value = index
}

// Format file size for display
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Auto-refresh every 5 minutes
const autoRefreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

onMounted(() => {
  autoRefreshInterval.value = setInterval(() => {
    refresh()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
})

useHead({
  title: 'Brennan\'s Photography',
  meta: [
    { name: 'description', content: 'A clean photography portfolio showcasing beautiful moments' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-light tracking-wide text-gray-900">
          Brennan's Photography
        </h1>
      </nav>
    </header>

    <!-- Gallery Section -->
    <section id="gallery" class="px-4 sm:px-6 lg:px-8 pb-20 pt-20">
      <div class="max-w-7xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p class="mt-4 text-gray-600 font-light">Loading photos from S3...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <p class="text-red-600 font-light">Error loading photos from S3</p>
          <p class="text-sm text-gray-500 mt-2">{{ error }}</p>
          <button 
            @click="refresh()"
            class="mt-4 px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- No Photos State -->
        <div v-else-if="!hasPhotos" class="text-center py-20">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-600 font-light">No photos found in S3 bucket</p>
          <p class="text-sm text-gray-400 mt-2">Upload photos to your Dropbox folder to sync them</p>
        </div>

        <!-- Masonry Grid -->
        <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <div
            v-for="(photo, index) in photos"
            :key="photo.key"
            class="break-inside-avoid group cursor-pointer"
            @click="openLightbox(index)"
          >
            <div class="relative overflow-hidden bg-gray-100 transition-all duration-300 hover:shadow-2xl">
              <!-- Real Image from S3 -->
              <img
                :src="photo.url"
                :alt="photo.key"
                class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              <!-- Optional: Photo info overlay on hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p class="text-sm font-light truncate">{{ photo.key }}</p>
                  <p class="text-xs text-gray-300 mt-1">{{ formatFileSize(photo.size) }}</p>
                </div>
              </div>
              
              <!-- Zoom Icon Hint -->
              <div class="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-7xl mx-auto text-center text-sm text-gray-500 font-light">
        <p>&copy; {{ new Date().getFullYear() }} Brennan. All rights reserved.</p>
      </div>
    </footer>

    <!-- Lightbox -->
    <ImageLightbox
      v-if="showLightbox && photos.length > 0"
      :photos="photos"
      :current-index="currentPhotoIndex"
      @close="closeLightbox"
      @navigate="navigateToPhoto"
    />
  </div>
</template>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>

export interface Photo {
  key: string
  url: string
  lastModified: string
  size: number
  etag: string
}

export function useS3Photos() {
  const s3BucketUrl = 'https://photo-sync-dropbox.s3.us-east-1.amazonaws.com/'
  
  const photos = ref<Photo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Parse S3 bucket listing XML
   */
  function parseS3BucketListing(xml: string): Photo[] {
    const parsedPhotos: Photo[] = []
    
    // Simple XML parsing - extract all <Contents> blocks
    const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g
    const keyRegex = /<Key>(.*?)<\/Key>/
    const lastModifiedRegex = /<LastModified>(.*?)<\/LastModified>/
    const sizeRegex = /<Size>(.*?)<\/Size>/
    const etagRegex = /<ETag>(.*?)<\/ETag>/
    
    let match
    while ((match = contentsRegex.exec(xml)) !== null) {
      const content = match[1]
      
      const keyMatch = content.match(keyRegex)
      const lastModifiedMatch = content.match(lastModifiedRegex)
      const sizeMatch = content.match(sizeRegex)
      const etagMatch = content.match(etagRegex)
      
      if (keyMatch && keyMatch[1]) {
        const key = keyMatch[1]
        
        parsedPhotos.push({
          key,
          url: `${s3BucketUrl}${encodeURIComponent(key)}`,
          lastModified: lastModifiedMatch ? lastModifiedMatch[1] : new Date().toISOString(),
          size: sizeMatch ? parseInt(sizeMatch[1]) : 0,
          etag: etagMatch ? etagMatch[1].replace(/"/g, '') : '',
        })
      }
    }
    
    return parsedPhotos
  }

  /**
   * Fetch photos from S3 bucket
   */
  async function fetchPhotos() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(s3BucketUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch S3 bucket: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      const allPhotos = parseS3BucketListing(xmlText)
      
      // Filter for image files only
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
      const imagePhotos = allPhotos.filter(photo => {
        const ext = photo.key.toLowerCase().substring(photo.key.lastIndexOf('.'))
        return imageExtensions.includes(ext)
      })
      
      // Sort by most recent first
      imagePhotos.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      
      photos.value = imagePhotos
    } catch (err: any) {
      console.error('Error fetching photos from S3:', err)
      error.value = err.message || 'Failed to load photos'
      photos.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh photos from S3
   */
  async function refresh() {
    await fetchPhotos()
  }

  return {
    photos: readonly(photos),
    loading: readonly(loading),
    error: readonly(error),
    fetchPhotos,
    refresh,
  }
}

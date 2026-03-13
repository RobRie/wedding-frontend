import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120_000,
})

// Attach access code to every request
api.interceptors.request.use((config) => {
  const code = localStorage.getItem('access_code')
  if (code) {
    config.headers['X-Access-Code'] = code
  }
  return config
})

export interface Folder {
  name: string
  cover_url: string
}

export interface ImageInfo {
  filename: string
  image_url: string
  thumbnail_url: string
  uploaded_at: string
  size: number
}

export async function listFolders(): Promise<Folder[]> {
  const { data } = await api.get<{ folders: Folder[] }>('/folders')
  return data.folders
}

export async function createFolder(name: string): Promise<{ name: string }> {
  const { data } = await api.post<{ name: string; message: string }>('/folders', { name })
  return data
}

export async function listImages(folder: string): Promise<ImageInfo[]> {
  const { data } = await api.get<{ folder: string; images: ImageInfo[] }>(
    `/folders/${encodeURIComponent(folder)}/images`,
  )
  return data.images
}

export async function uploadImages(
  folder: string,
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<{ uploaded: unknown[]; errors: unknown[] }> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('file', file)
  }
  const { data } = await api.post(`/folders/${encodeURIComponent(folder)}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return data
}

export async function verifyAccessCode(code: string): Promise<boolean> {
  try {
    localStorage.setItem('access_code', code)
    await api.get('/folders')
    return true
  } catch {
    localStorage.removeItem('access_code')
    return false
  }
}

export default api

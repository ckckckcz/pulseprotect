"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { initializeYOLO } from '@/lib/yoloUtils'

interface YOLOContextType {
  isModelLoaded: boolean
  isLoading: boolean
  error: string | null
}

const YOLOContext = createContext<YOLOContextType>({
  isModelLoaded: false,
  isLoading: true,
  error: null
})

export function YOLOProvider({ children }: { children: React.ReactNode }) {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to load the YOLO model
        const success = await initializeYOLO()
        
        if (success) {
          setIsModelLoaded(true)
          console.log('✅ YOLO model loaded successfully')
        } else {
          setError('Failed to load YOLO model')
          console.warn('⚠️ YOLO model failed to load, using fallback detection')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('❌ YOLO model loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadModel()
  }, [])

  return (
    <YOLOContext.Provider value={{ isModelLoaded, isLoading, error }}>
      {children}
    </YOLOContext.Provider>
  )
}

export function useYOLO() {
  const context = useContext(YOLOContext)
  if (!context) {
    throw new Error('useYOLO must be used within YOLOProvider')
  }
  return context
}
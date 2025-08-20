import * as tf from '@tensorflow/tfjs'

export interface Detection {
  class: string
  confidence: number
  bbox: [number, number, number, number]
}

export class YOLOModel {
  private model: tf.GraphModel | null = null
  private inputSize = 640 
  private classNames = ['body', 'title']
  async loadModel(modelPath: string) {
    try {
      console.log('Loading YOLO model...')
      this.model = await tf.loadGraphModel(modelPath)
      console.log('YOLO model loaded successfully')
      return true
    } catch (error) {
      console.error('Failed to load YOLO model:', error)
      return false
    }
  }

  async predict(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Detection[]> {
    if (!this.model) {
      throw new Error('Model not loaded')
    }

    try {
      const tensor = tf.tidy(() => {
        let img = tf.browser.fromPixels(imageElement)
        
        img = tf.image.resizeBilinear(img, [this.inputSize, this.inputSize])
        
        img = img.div(255.0)
        
        return img.expandDims(0)
      })

      const predictions = await this.model.predict(tensor) as tf.Tensor

      const detections = await this.postProcess(predictions, imageElement.width || this.inputSize, imageElement.height || this.inputSize)
      
      tensor.dispose()
      predictions.dispose()

      return detections
    } catch (error) {
      console.error('YOLO prediction error:', error)
      return []
    }
  }

  private async postProcess(predictions: tf.Tensor, originalWidth: number, originalHeight: number): Promise<Detection[]> {
    const data = await predictions.data()
    const detections: Detection[] = []
    const numBoxes = predictions.shape[1] || 0
    const boxSize = predictions.shape[2] || 0
    
    for (let i = 0; i < numBoxes; i++) {
      const offset = i * boxSize
      
      const x = data[offset]
      const y = data[offset + 1] 
      const w = data[offset + 2]
      const h = data[offset + 3]
      const confidence = data[offset + 4]
      
      if (confidence < 0.5) continue
      
      // Get class probabilities
      const classProbs = Array.from(data.slice(offset + 5, offset + 5 + this.classNames.length))
      const classIndex = classProbs.indexOf(Math.max(...classProbs))
      const classConf = classProbs[classIndex] * confidence
      
      if (classConf > 0.5) {
        detections.push({
          class: this.classNames[classIndex],
          confidence: classConf,
          bbox: [
            x * originalWidth,
            y * originalHeight, 
            w * originalWidth,
            h * originalHeight
          ]
        })
      }
    }

    return this.applyNMS(detections, 0.4)
  }

  private applyNMS(detections: Detection[], iouThreshold: number): Detection[] {
    detections.sort((a, b) => b.confidence - a.confidence)
    
    const selected: Detection[] = []
    
    for (const detection of detections) {
      let shouldSelect = true
      
      for (const selectedDet of selected) {
        if (this.calculateIoU(detection.bbox, selectedDet.bbox) > iouThreshold) {
          shouldSelect = false
          break
        }
      }
      
      if (shouldSelect) {
        selected.push(detection)
      }
    }
    
    return selected
  }

  private calculateIoU(box1: number[], box2: number[]): number {
    const [x1, y1, w1, h1] = box1
    const [x2, y2, w2, h2] = box2
    
    const left = Math.max(x1, x2)
    const top = Math.max(y1, y2)
    const right = Math.min(x1 + w1, x2 + w2)
    const bottom = Math.min(y1 + h1, y2 + h2)
    
    if (right <= left || bottom <= top) return 0
    
    const intersection = (right - left) * (bottom - top)
    const union = w1 * h1 + w2 * h2 - intersection
    
    return intersection / union
  }
}

// Create singleton instance
export const yoloModel = new YOLOModel()

// Initialize model (call this in your app startup)
export async function initializeYOLO(modelPath: string = '/models/yolo-model/model.json') {
  try {
    await tf.ready()
    console.log('TensorFlow.js backend:', tf.getBackend())
    const success = await yoloModel.loadModel(modelPath)
    return success
  } catch (error) {
    console.error('YOLO initialization error:', error)
    return false
  }
}
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

// Generate image using Gemini
export const generateImage = async (prompt, options = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
    
    const imagePrompt = `Create a detailed image based on this description: ${prompt}. 
    Style: ${options.style || 'realistic'}
    Aspect ratio: ${options.aspectRatio || 'square'}
    Quality: high resolution, professional`

    const result = await model.generateContent([imagePrompt])
    const response = await result.response
    
    // Note: Gemini doesn't directly generate images, so we'll use a text-to-image service
    // This is a placeholder - you might want to integrate with a proper image generation API
    return {
      success: true,
      imageUrl: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
            Generated: ${prompt.substring(0, 50)}...
          </text>
        </svg>
      `)}`,
      prompt: imagePrompt
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Generate video using Gemini (conceptual - actual video generation would need specialized service)
export const generateVideo = async (prompt, options = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const videoPrompt = `Create a detailed video concept based on this description: ${prompt}.
    Duration: ${options.duration || '10 seconds'}
    Style: ${options.style || 'cinematic'}
    Resolution: ${options.resolution || '1080p'}`

    const result = await model.generateContent([videoPrompt])
    const response = await result.response
    const concept = response.text()

    // This is a placeholder - actual video generation would require specialized APIs
    return {
      success: true,
      concept: concept,
      videoUrl: null, // Would be populated by actual video generation service
      prompt: videoPrompt
    }
  } catch (error) {
    console.error('Error generating video concept:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Generate text content using Gemini
export const generateText = async (prompt, options = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent([prompt])
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      text: text
    }
  } catch (error) {
    console.error('Error generating text:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
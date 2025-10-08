import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Button,
  InputGroup,
  HTMLSelect,
  ButtonGroup,
  Callout,
  Spinner,
  Card
} from '@blueprintjs/core'
import { SectionTab } from 'polotno/side-panel'
import { generateImage } from '../lib/gemini'
import { getImageSize } from 'polotno/utils/image'
import { ImagesGrid } from 'polotno/side-panel/images-grid'
import { useCredits } from '../credits'
import { getCurrentUser } from '../lib/supabase'

const AIImagePanel = observer(({ store }) => {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [aspectRatio, setAspectRatio] = useState('square')
  const [loading, setLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [user, setUser] = useState(null)
  const { credits, consumeCredits } = useCredits('aiImageCredits', 10)

  React.useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const styles = [
    { value: 'realistic', label: '📷 Realistic' },
    { value: 'artistic', label: '🎨 Artistic' },
    { value: 'cartoon', label: '🎭 Cartoon' },
    { value: 'abstract', label: '🌀 Abstract' },
    { value: 'vintage', label: '📜 Vintage' },
    { value: 'modern', label: '✨ Modern' }
  ]

  const aspectRatios = [
    { value: 'square', label: 'Square (1:1)' },
    { value: 'landscape', label: 'Landscape (16:9)' },
    { value: 'portrait', label: 'Portrait (9:16)' },
    { value: 'wide', label: 'Wide (21:9)' }
  ]

  const handleGenerate = async () => {
    if (!user) {
      alert('Please sign in to use AI image generation')
      return
    }

    if (!prompt.trim()) {
      alert('Please enter a description for your image')
      return
    }

    if (credits <= 0) {
      alert('You have no credits left for AI image generation')
      return
    }

    setLoading(true)

    try {
      const result = await generateImage(prompt, {
        style,
        aspectRatio
      })

      if (result.success) {
        setGeneratedImages(prev => [...prev, {
          id: Date.now(),
          url: result.imageUrl,
          prompt: prompt,
          style: style,
          aspectRatio: aspectRatio
        }])
        consumeCredits(1)
      } else {
        alert('Failed to generate image: ' + result.error)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('An error occurred while generating the image')
    } finally {
      setLoading(false)
    }
  }

  const presetPrompts = [
    'A beautiful sunset over mountains',
    'Modern office workspace',
    'Abstract geometric patterns',
    'Vintage coffee shop interior',
    'Futuristic city skyline',
    'Peaceful forest landscape'
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #ccc' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>AI Image Generator</h3>
        
        {!user && (
          <Callout intent="warning" style={{ marginBottom: '15px' }}>
            Please sign in to use AI image generation
          </Callout>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Describe your image
          </label>
          <InputGroup
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic lion in the African savanna"
            disabled={!user}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Quick prompts
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {presetPrompts.map((preset, index) => (
              <Button
                key={index}
                size="small"
                minimal
                onClick={() => setPrompt(preset)}
                disabled={!user}
                style={{ fontSize: '11px' }}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Style
          </label>
          <HTMLSelect
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={!user}
            fill
          >
            {styles.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </HTMLSelect>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Aspect Ratio
          </label>
          <HTMLSelect
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            disabled={!user}
            fill
          >
            {aspectRatios.map(ar => (
              <option key={ar.value} value={ar.value}>{ar.label}</option>
            ))}
          </HTMLSelect>
        </div>

        <Button
          onClick={handleGenerate}
          intent="primary"
          loading={loading}
          disabled={!user || !prompt.trim() || credits <= 0}
          fill
        >
          Generate Image ({credits} credits left)
        </Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
        {generatedImages.length > 0 && (
          <>
            <h4>Generated Images</h4>
            <ImagesGrid
              images={generatedImages}
              getPreview={(image) => image.url}
              onSelect={async (image, pos) => {
                const { width, height } = await getImageSize(image.url)
                const x = (pos?.x || store.width / 2) - width / 2
                const y = (pos?.y || store.height / 2) - height / 2
                
                store.activePage?.addElement({
                  type: 'image',
                  src: image.url,
                  width,
                  height,
                  x,
                  y
                })
              }}
              rowsNumber={2}
            />
          </>
        )}

        {generatedImages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            Generated images will appear here
          </div>
        )}
      </div>
    </div>
  )
})

export const AIImageSection = {
  name: 'ai-image',
  Tab: (props) => (
    <SectionTab name="AI Image" {...props}>
      🎨
    </SectionTab>
  ),
  Panel: AIImagePanel
}
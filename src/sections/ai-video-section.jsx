import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Button,
  InputGroup,
  HTMLSelect,
  Callout,
  Card,
  TextArea
} from '@blueprintjs/core'
import { SectionTab } from 'polotno/side-panel'
import { generateVideo } from '../lib/gemini'
import { getCurrentUser } from '../lib/supabase'
import { useCredits } from '../credits'

const AIVideoPanel = observer(({ store }) => {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('10')
  const [style, setStyle] = useState('cinematic')
  const [resolution, setResolution] = useState('1080p')
  const [loading, setLoading] = useState(false)
  const [generatedConcepts, setGeneratedConcepts] = useState([])
  const [user, setUser] = useState(null)
  const { credits, consumeCredits } = useCredits('aiVideoCredits', 5)

  React.useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const styles = [
    { value: 'cinematic', label: '🎬 Cinematic' },
    { value: 'documentary', label: '📹 Documentary' },
    { value: 'animated', label: '🎭 Animated' },
    { value: 'timelapse', label: '⏰ Time-lapse' },
    { value: 'abstract', label: '🌀 Abstract' },
    { value: 'commercial', label: '📺 Commercial' }
  ]

  const durations = [
    { value: '5', label: '5 seconds' },
    { value: '10', label: '10 seconds' },
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' }
  ]

  const resolutions = [
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '4k', label: '4K Ultra HD' }
  ]

  const handleGenerate = async () => {
    if (!user) {
      alert('Please sign in to use AI video generation')
      return
    }

    if (!prompt.trim()) {
      alert('Please enter a description for your video')
      return
    }

    if (credits <= 0) {
      alert('You have no credits left for AI video generation')
      return
    }

    setLoading(true)

    try {
      const result = await generateVideo(prompt, {
        duration: duration + ' seconds',
        style,
        resolution
      })

      if (result.success) {
        setGeneratedConcepts(prev => [...prev, {
          id: Date.now(),
          concept: result.concept,
          prompt: prompt,
          style: style,
          duration: duration,
          resolution: resolution,
          videoUrl: result.videoUrl
        }])
        consumeCredits(2) // Video generation costs more credits
      } else {
        alert('Failed to generate video concept: ' + result.error)
      }
    } catch (error) {
      console.error('Error generating video:', error)
      alert('An error occurred while generating the video concept')
    } finally {
      setLoading(false)
    }
  }

  const presetPrompts = [
    'A person walking through a busy city street',
    'Ocean waves crashing on a beach at sunset',
    'A chef preparing a gourmet meal',
    'Time-lapse of flowers blooming',
    'Abstract geometric shapes morphing',
    'A product showcase with smooth camera movements'
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #ccc' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>AI Video Generator</h3>
        
        {!user && (
          <Callout intent="warning" style={{ marginBottom: '15px' }}>
            Please sign in to use AI video generation
          </Callout>
        )}

        <Callout intent="primary" style={{ marginBottom: '15px' }}>
          <strong>Note:</strong> This generates video concepts and storyboards. 
          Actual video generation requires specialized services and is coming soon!
        </Callout>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Describe your video
          </label>
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A drone shot flying over a mountain landscape during golden hour"
            disabled={!user}
            rows={3}
            fill
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
                {preset.substring(0, 30)}...
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Duration
            </label>
            <HTMLSelect
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={!user}
              fill
            >
              {durations.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </HTMLSelect>
          </div>

          <div style={{ flex: 1 }}>
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
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Resolution
          </label>
          <HTMLSelect
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            disabled={!user}
            fill
          >
            {resolutions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
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
          Generate Video Concept ({credits} credits left)
        </Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
        {generatedConcepts.length > 0 && (
          <>
            <h4>Generated Video Concepts</h4>
            {generatedConcepts.map((concept) => (
              <Card key={concept.id} style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Prompt:</strong> {concept.prompt}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Style:</strong> {concept.style} | 
                  <strong> Duration:</strong> {concept.duration}s | 
                  <strong> Resolution:</strong> {concept.resolution}
                </div>
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {concept.concept}
                </div>
                {concept.videoUrl && (
                  <Button
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      // Add video to canvas when actual video generation is implemented
                      alert('Video generation coming soon!')
                    }}
                  >
                    Add to Canvas
                  </Button>
                )}
              </Card>
            ))}
          </>
        )}

        {generatedConcepts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            Generated video concepts will appear here
          </div>
        )}
      </div>
    </div>
  )
})

export const AIVideoSection = {
  name: 'ai-video',
  Tab: (props) => (
    <SectionTab name="AI Video" {...props}>
      🎥
    </SectionTab>
  ),
  Panel: AIVideoPanel
}
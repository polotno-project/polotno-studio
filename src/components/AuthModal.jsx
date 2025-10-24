import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Dialog,
  Classes,
  Button,
  InputGroup,
  FormGroup,
  Callout,
  Tabs,
  Tab
} from '@blueprintjs/core'
import { signUp, signIn } from '../lib/supabase'

export const AuthModal = observer(({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (activeTab === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        const { data, error } = await signUp(email, password)
        if (error) throw error
        
        if (data.user) {
          onSuccess(data.user)
          onClose()
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) throw error
        
        if (data.user) {
          onSuccess(data.user)
          onClose()
        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    resetForm()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Authentication"
      style={{ width: '400px' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <Tabs selectedTabId={activeTab} onChange={handleTabChange}>
          <Tab id="signin" title="Sign In" />
          <Tab id="signup" title="Sign Up" />
        </Tabs>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          {error && (
            <Callout intent="danger" style={{ marginBottom: '15px' }}>
              {error}
            </Callout>
          )}

          <FormGroup label="Email" labelFor="email">
            <InputGroup
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormGroup>

          <FormGroup label="Password" labelFor="password">
            <InputGroup
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormGroup>

          {activeTab === 'signup' && (
            <FormGroup label="Confirm Password" labelFor="confirmPassword">
              <InputGroup
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </FormGroup>
          )}

          <Button
            type="submit"
            intent="primary"
            loading={loading}
            fill
            style={{ marginTop: '15px' }}
          >
            {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </div>
    </Dialog>
  )
})
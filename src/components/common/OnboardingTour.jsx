import { useState, useEffect, useCallback } from 'react'

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Claude',
    description: 'Your AI assistant for thoughtful conversation, analysis, and creative tasks. Let us show you around.',
    target: null, // No specific element
    position: 'center',
  },
  {
    id: 'chat',
    title: 'Start a Conversation',
    description: 'Type a message in the input below to start chatting with Claude. Try asking a question or requesting help with a task.',
    target: '#chat-input-extensions-bottom',
    position: 'top',
  },
  {
    id: 'sidebar',
    title: 'Your Conversations',
    description: 'All your conversations are organized in the sidebar. You can search, pin, archive, and organize them into folders.',
    target: '#sidebar-slot',
    position: 'right',
  },
  {
    id: 'artifacts',
    title: 'Artifacts & Code',
    description: 'When Claude generates code, HTML, or diagrams, they appear as interactive artifacts you can preview, copy, and iterate on.',
    target: '#model-selector-slot',
    position: 'bottom',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Open Settings to configure your preferences, manage API keys, and customize Claude to work the way you want.',
    target: '#settings-slot',
    position: 'bottom',
  },
]

export default function OnboardingTour() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const onboarded = localStorage.getItem('claude-onboarded')
    if (!onboarded) {
      // Small delay to let the app render first
      const timer = setTimeout(() => setActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }, [step])

  const handleSkip = useCallback(() => {
    handleFinish()
  }, [])

  const handleFinish = useCallback(() => {
    setActive(false)
    localStorage.setItem('claude-onboarded', 'true')
  }, [])

  if (!active) return null

  const currentStep = STEPS[step]
  const isCenter = currentStep.position === 'center' || !currentStep.target

  // Get target element position for highlight
  const getTooltipStyle = () => {
    if (isCenter) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const el = document.querySelector(currentStep.target)
    if (!el) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const rect = el.getBoundingClientRect()
    const style = { position: 'fixed' }

    switch (currentStep.position) {
      case 'right':
        style.top = `${rect.top + rect.height / 2}px`
        style.left = `${rect.right + 16}px`
        style.transform = 'translateY(-50%)'
        break
      case 'bottom':
        style.top = `${rect.bottom + 12}px`
        style.left = `${rect.left + rect.width / 2}px`
        style.transform = 'translateX(-50%)'
        break
      case 'top':
        style.top = `${rect.top - 12}px`
        style.left = `${rect.left + rect.width / 2}px`
        style.transform = 'translate(-50%, -100%)'
        break
      default:
        style.top = `${rect.bottom + 12}px`
        style.left = `${rect.left}px`
    }

    return style
  }

  const getHighlightStyle = () => {
    if (isCenter || !currentStep.target) return null
    const el = document.querySelector(currentStep.target)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return {
      position: 'fixed',
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      borderRadius: '12px',
      border: '2px solid var(--claude-orange)',
      boxShadow: '0 0 0 4000px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
      zIndex: 59,
      transition: 'all 0.3s ease',
    }
  }

  const highlightStyle = getHighlightStyle()

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Overlay for center steps */}
      {isCenter && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}

      {/* Highlight ring */}
      {highlightStyle && <div style={highlightStyle} />}

      {/* Tooltip */}
      <div
        style={getTooltipStyle()}
        className="w-80 rounded-2xl shadow-2xl p-5 z-[61]"
        role="tooltip"
      >
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 transition-colors duration-300"
                style={{ backgroundColor: i <= step ? 'var(--claude-orange)' : 'var(--bg-tertiary)' }}
              />
            ))}
          </div>

          <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            {currentStep.title}
          </h3>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="text-sm px-4 py-1.5 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--claude-orange)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--claude-orange-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--claude-orange)' }}
            >
              {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

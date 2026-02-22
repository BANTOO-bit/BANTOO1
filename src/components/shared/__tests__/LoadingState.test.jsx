import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingState from '../LoadingState'

describe('LoadingState Component', () => {
    it('renders with default message', () => {
        render(<LoadingState />)
        expect(screen.getByText('Memuat...')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
        const customMessage = 'Sabar ya, lagi disiapin...'
        render(<LoadingState message={customMessage} />)
        expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('renders without fullPage wrapper when fullPage is false', () => {
        const { container } = render(<LoadingState fullPage={false} />)
        // Ensure the min-h-screen class is NOT present
        expect(container.firstChild).not.toHaveClass('min-h-screen')
    })
})

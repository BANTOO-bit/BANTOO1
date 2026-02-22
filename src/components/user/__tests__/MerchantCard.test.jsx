import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MerchantCard from '../MerchantCard'
import { useFavorites } from '../../../context/FavoritesContext'

// Mock the context hook
vi.mock('../../../context/FavoritesContext', () => ({
    useFavorites: vi.fn()
}))

describe('MerchantCard Component', () => {
    const mockMerchant = {
        id: '123',
        name: 'Warung Test',
        is_open: true,
        image: 'test.jpg',
        rating: 4.8,
        category: 'makanan-berat',
        deliveryTime: '15-20 min',
        deliveryFee: 'Rp 10.000'
    }

    const mockToggleFavorite = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        useFavorites.mockReturnValue({
            isFavorite: vi.fn().mockReturnValue(false),
            toggleFavorite: mockToggleFavorite
        })
    })

    it('renders merchant information correctly', () => {
        render(<MerchantCard merchant={mockMerchant} />)

        expect(screen.getByText('Warung Test')).toBeInTheDocument()
        expect(screen.getByText('4.8')).toBeInTheDocument()
        expect(screen.getByText('Makanan Berat')).toBeInTheDocument() // Capitalized
        expect(screen.getByText('15-20 min')).toBeInTheDocument()
        expect(screen.getByText('Rp 10.000')).toBeInTheDocument()
    })

    it('shows Tutup badge and applies opacity when merchant is closed', () => {
        render(<MerchantCard merchant={{ ...mockMerchant, is_open: false }} />)

        expect(screen.getByText('Tutup')).toBeInTheDocument()
        // Article doesn't have an explicit role defined in the component, so we look for the text container
        const article = screen.getByText('Warung Test').closest('article')
        expect(article).toHaveClass('opacity-80')
    })

    it('calls onClick when the card is clicked', () => {
        const handleClick = vi.fn()
        render(<MerchantCard merchant={mockMerchant} onClick={handleClick} />)

        const article = screen.getByText('Warung Test').closest('article')
        fireEvent.click(article)
        expect(handleClick).toHaveBeenCalledWith(mockMerchant)
    })

    it('calls toggleFavorite when favorite button is clicked', () => {
        render(<MerchantCard merchant={mockMerchant} />)

        const favoriteBtn = screen.getByRole('button')
        fireEvent.click(favoriteBtn)

        expect(mockToggleFavorite).toHaveBeenCalledWith(mockMerchant)
    })

    it('hides favorite button when showFavoriteButton is false', () => {
        render(<MerchantCard merchant={mockMerchant} showFavoriteButton={false} />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})

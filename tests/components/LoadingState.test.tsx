import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingState from '../../src/features/shared/components/LoadingState';

describe('LoadingState Component', () => {
    it('should render the default loading message', () => {
        render(<LoadingState />);
        expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });

    it('should render a custom loading message when provided', () => {
        const customMessage = 'Tunggu sebentar ya...';
        render(<LoadingState message={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
        // Default message should not be present
        expect(screen.queryByText('Memuat...')).not.toBeInTheDocument();
    });

    it('should render the spinner animation layout', () => {
        const { container } = render(<LoadingState />);

        // Check for the spinner element (has border-t-primary class)
        const spinner = container.querySelector('.border-t-primary');
        expect(spinner).toBeInTheDocument();

        // Check for the full screen centering wrapper
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });
});

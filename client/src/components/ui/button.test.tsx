import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('Button Component', () => {
    it('renders button with text', () => {
        render(
            <TestWrapper>
                <Button>Click me</Button>
            </TestWrapper>
        )

        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('can be disabled', () => {
        render(
            <TestWrapper>
                <Button disabled>Disabled button</Button>
            </TestWrapper>
        )

        expect(screen.getByRole('button')).toBeDisabled()
    })
})
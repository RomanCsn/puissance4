declare module 'canvas-confetti' {
    type ConfettiOrigin = { x?: number; y?: number }

    export type ConfettiOptions = {
        particleCount?: number
        spread?: number
        startVelocity?: number
        decay?: number
        gravity?: number
        drift?: number
        ticks?: number
        origin?: ConfettiOrigin
        colors?: string[]
        shapes?: Array<'square' | 'circle'>
        scalar?: number
        zIndex?: number
    }

    export default function confetti(options?: ConfettiOptions): void
}

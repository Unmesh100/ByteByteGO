"use client"

// Magic UI MorphingText, adapted for this site:
// - morph/hold durations are props (defaults match the original 1.5s / 0.5s);
// - the animation loop pauses while the text is off screen;
// - prefers-reduced-motion shows the first text, static, with no loop;
// - uses performance.now() for frame timing;
// - the first text is server-rendered (no blank headline before hydration),
//   and `initialHold` keeps it on screen before the first morph;
// - the gooey threshold filter is applied only while morphing, so resting
//   text keeps normal anti-aliasing instead of hard, pixelated edges.

import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const GOO_FILTER = "url(#threshold) blur(0.6px)"

const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const useMorphingText = (texts: string[], morphTime: number, cooldownTime: number, initialHold: number) => {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(0)

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      if (current1.parentElement) current1.parentElement.style.filter = GOO_FILTER
      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`

      current1.textContent = texts[textIndexRef.current % texts.length]
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts]
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles, morphTime, cooldownTime])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (current1 && current2) {
      if (current1.parentElement) current1.parentElement.style.filter = "none"
      current2.style.filter = "none"
      current2.style.opacity = "100%"
      current1.style.filter = "none"
      current1.style.opacity = "0%"
    }
  }, [])

  useEffect(() => {
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (!current1 || !current2) return

    // Reduced motion: a single, static line of text.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (current1.parentElement) current1.parentElement.style.filter = "none"
      current1.textContent = ""
      current1.style.opacity = "0%"
      current2.textContent = texts[0]
      current2.style.filter = "none"
      current2.style.opacity = "100%"
      return
    }

    let animationFrameId = 0
    let running = false
    // Hold the server-rendered first text before morphing away from it.
    cooldownRef.current = initialHold

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const now = performance.now()
      const dt = (now - timeRef.current) / 1000
      timeRef.current = now

      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()
    }

    const start = () => {
      if (running) return
      running = true
      timeRef.current = performance.now()
      animate()
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(animationFrameId)
    }

    // Only animate while visible.
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    observer.observe(current1.parentElement ?? current1)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [doMorph, doCooldown, texts, initialHold])

  return { text1Ref, text2Ref }
}

interface MorphingTextProps {
  className?: string
  texts: string[]
  /** Seconds each morph takes. */
  morphTime?: number
  /** Seconds each word holds before the next morph. */
  cooldownTime?: number
  /** Seconds the first text holds before the first morph. */
  initialHold?: number
}

const Texts: React.FC<Required<Pick<MorphingTextProps, "texts" | "morphTime" | "cooldownTime" | "initialHold">>> = ({
  texts,
  morphTime,
  cooldownTime,
  initialHold,
}) => {
  const { text1Ref, text2Ref } = useMorphingText(texts, morphTime, cooldownTime, initialHold)
  return (
    <>
      <span className="absolute inset-x-0 top-0 m-auto inline-block w-full" ref={text1Ref} />
      {/* Set as HTML so React never reconciles the text the animation rewrites. */}
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
        dangerouslySetInnerHTML={{ __html: escapeHtml(texts[0] ?? "") }}
      />
    </>
  )
}

const SvgFilters: React.FC = () => (
  <svg id="filters" className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
)

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  morphTime = 1.5,
  cooldownTime = 0.5,
  initialHold = 0,
}) => (
  <div
    className={cn(
      "relative mx-auto h-16 w-full max-w-3xl text-center font-sans text-[40pt] leading-none font-bold filter-[url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]",
      className
    )}
  >
    <Texts texts={texts} morphTime={morphTime} cooldownTime={cooldownTime} initialHold={initialHold} />
    <SvgFilters />
  </div>
)

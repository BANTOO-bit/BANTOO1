import { useState, useRef, useEffect } from 'react'

/**
 * OptimizedImage — A drop-in replacement for <img> with:
 * - Native lazy loading
 * - Intersection Observer for below-fold images
 * - Blur-up placeholder effect
 * - Error fallback with icon
 * - Smooth fade-in on load
 */
function OptimizedImage({
    src,
    alt = '',
    className = '',
    fallbackIcon = 'image',
    fallbackClass = '',
    objectFit = 'cover',
    ...props
}) {
    const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'
    const [isVisible, setIsVisible] = useState(false)
    const imgRef = useRef(null)

    // Intersection Observer for lazy rendering
    useEffect(() => {
        if (!imgRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' } // Start loading 200px before visible
        )

        observer.observe(imgRef.current)
        return () => observer.disconnect()
    }, [])

    // Reset status when src changes
    useEffect(() => {
        setStatus('loading')
    }, [src])

    if (!src) {
        return (
            <div ref={imgRef} className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} {...props}>
                <span className={`material-symbols-outlined text-gray-300 dark:text-gray-600 ${fallbackClass || 'text-2xl'}`}>
                    {fallbackIcon}
                </span>
            </div>
        )
    }

    return (
        <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`} {...props}>
            {/* Blur placeholder */}
            {status === 'loading' && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Actual image */}
            {isVisible && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                    className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}

            {/* Error fallback */}
            {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className={`material-symbols-outlined text-gray-300 dark:text-gray-600 ${fallbackClass || 'text-2xl'}`}>
                        {fallbackIcon}
                    </span>
                </div>
            )}
        </div>
    )
}

/**
 * Compress an image file before uploading to Supabase Storage.
 * Reduces file size significantly while maintaining visual quality.
 * 
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width in pixels (default: 800)
 * @param {number} options.maxHeight - Max height in pixels (default: 800)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(file, {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
} = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Scale down if necessary
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to compress image'))
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target.result
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

export default OptimizedImage

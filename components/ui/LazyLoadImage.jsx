"use client"

import { useState, useEffect } from "react"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * LazyLoadImage Component
 * A mobile-optimized image component with lazy loading and responsive sizing
 */
const LazyLoadImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  placeholderColor = "#f0f0f0",
  fallbackSrc = "",
  onLoad,
  onError,
  loadingIndicator = true,
  blur = true,
}) => {
  const { isMobile, connectionStatus } = useMobileOptimization()
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const backgroundColor = placeholderColor // Use placeholderColor as the default background color

  useEffect(() => {
    // Set up Intersection Observer to detect when image is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    // Get the current element to observe
    const element = document.getElementById(`lazy-img-${src.replace(/[^a-zA-Z0-9]/g, "-")}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
      observer.disconnect()
    }
  }, [src])

  const handleImageLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleImageError = (e) => {
    setError(true)
    if (onError) onError(e)
  }

  // Determine if we should load a lower quality image on mobile with slow connection
  const shouldLoadLowQuality = isMobile && connectionStatus === "slow" && src.includes(".")

  // Generate low quality version of the image URL if needed
  const getImageUrl = () => {
    if (error && fallbackSrc) return fallbackSrc
    if (!shouldLoadLowQuality) return src

    // This is a simplified example - in a real app, you might have a server endpoint
    // that generates lower quality images or use a responsive image service
    const parts = src.split(".")
    const ext = parts.pop()
    return `${parts.join(".")}-low-quality.${ext}`
  }

  const imageUrl = getImageUrl()
  const uniqueId = `lazy-img-${src.replace(/[^a-zA-Z0-9]/g, "-")}`

  // Styles for the image container
  const containerStyle = {
    position: "relative",
    overflow: "hidden",
    backgroundColor,
    width: width || "100%",
    height: height || "auto",
    display: "inline-block",
  }
  // Styles for the actual image
  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.3s, filter 0.3s",
    opacity: isLoaded ? 1 : 0,
    filter: isLoaded || !blur ? "none" : "blur(8px)",
  }

  // Loading indicator styles
  const loaderStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: isLoaded ? "none" : "block",
  }

  return (
    <div id={uniqueId} className={`lazy-load-image-container ${className}`} style={containerStyle}>
      {inView && (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={alt}
          style={imageStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {!isLoaded && loadingIndicator && (
        <div style={loaderStyle}>
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && !fallbackSrc && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
          <p className="text-muted small mt-2">Image not available</p>
        </div>
      )}
    </div>
  )
}

export default LazyLoadImage

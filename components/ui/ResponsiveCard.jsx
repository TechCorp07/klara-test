"use client"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * ResponsiveCard Component
 * A mobile-optimized card component that adapts to different screen sizes
 */
const ResponsiveCard = ({
  title,
  subtitle,
  content,
  footer,
  image,
  actions,
  onClick,
  className = "",
  fullWidthOnMobile = true,
}) => {
  const { isMobile, isTablet } = useMobileOptimization()

  const cardClasses = ["card", "h-100", className, isMobile && fullWidthOnMobile ? "w-100" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={cardClasses} onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      {image && (
        <div className="card-img-container">
          <img src={image} className="card-img-top" alt={title} loading="lazy" />
        </div>
      )}

      <div className="card-body">
        {title && <h5 className="card-title">{title}</h5>}
        {subtitle && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}

        <div className="card-text">{content}</div>

        {actions && actions.length > 0 && (
          <div className={`card-actions ${isMobile ? "mt-3" : "mt-auto"}`}>
            {isMobile ? (
              // Stack buttons vertically on mobile for better touch targets
              <div className="d-grid gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn ${action.variant || "btn-primary"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (action.onClick) action.onClick()
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon && <i className={`bi bi-${action.icon} me-2`}></i>}
                    {action.label}
                  </button>
                ))}
              </div>
            ) : (
              // Horizontal button layout for tablet/desktop
              <div className="d-flex gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn ${action.variant || "btn-primary"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (action.onClick) action.onClick()
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon && <i className={`bi bi-${action.icon} me-2`}></i>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

export default ResponsiveCard

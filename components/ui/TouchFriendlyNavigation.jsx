"use client"

import { useState, useEffect } from "react"
import { useMobileOptimization } from "../../contexts/MobileOptimizationContext"

/**
 * TouchFriendlyNavigation Component
 * A mobile-optimized navigation component with touch-friendly controls
 */
const TouchFriendlyNavigation = ({
  items,
  activeItem = null,
  onItemClick,
  orientation = "horizontal",
  collapsible = true,
  logo = null,
  userMenu = null,
}) => {
  const { isMobile, isTablet } = useMobileOptimization()
  const [expanded, setExpanded] = useState(false)
  const [activeItemState, setActiveItemState] = useState(activeItem)

  useEffect(() => {
    setActiveItemState(activeItem)
  }, [activeItem])

  const handleItemClick = (item) => {
    setActiveItemState(item.id)
    if (onItemClick) {
      onItemClick(item)
    }
    if (isMobile && expanded) {
      setExpanded(false)
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  // Mobile navigation (hamburger menu)
  if (isMobile && orientation === "horizontal" && collapsible) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light mobile-nav">
        <div className="container-fluid">
          {logo && (
            <a className="navbar-brand" href={logo.href || "#"}>
              {typeof logo === "string" ? <img src={logo} alt="Logo" height="30" /> : logo}
            </a>
          )}

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {items.map((item) => (
                <li key={item.id} className={`nav-item ${activeItemState === item.id ? "active" : ""}`}>
                  <a
                    className={`nav-link ${activeItemState === item.id ? "active" : ""}`}
                    href={item.href || "#"}
                    onClick={(e) => {
                      if (!item.href || item.href === "#") {
                        e.preventDefault()
                      }
                      handleItemClick(item)
                    }}
                  >
                    {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {userMenu && (
              <div className="navbar-nav">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {userMenu.avatar && (
                      <img src={userMenu.avatar} alt="User" className="rounded-circle me-2" width="30" height="30" />
                    )}
                    {userMenu.label || "User"}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    {userMenu.items.map((item, index) => (
                      <li key={index}>
                        <a
                          className="dropdown-item"
                          href={item.href || "#"}
                          onClick={(e) => {
                            if (!item.href || item.href === "#") {
                              e.preventDefault()
                            }
                            if (item.onClick) {
                              item.onClick()
                            }
                          }}
                        >
                          {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </div>
            )}
          </div>
        </div>
      </nav>
    )
  }

  // Mobile bottom tab navigation
  if (isMobile && orientation === "horizontal" && !collapsible) {
    return (
      <div className="mobile-tab-nav fixed-bottom bg-white border-top">
        <div className="d-flex justify-content-around">
          {items.map((item) => (
            <div
              key={item.id}
              className={`tab-item text-center py-2 ${activeItemState === item.id ? "active" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <div>
                  <i className={`bi bi-${item.icon}`}></i>
                </div>
              )}
              <div className="small">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vertical sidebar navigation
  if (orientation === "vertical") {
    const sidebarClasses = ["sidebar", isMobile ? "sidebar-mobile" : "", expanded ? "expanded" : "", "bg-light"]
      .filter(Boolean)
      .join(" ")

    return (
      <div className={sidebarClasses}>
        {isMobile && (
          <div className="sidebar-toggle" onClick={toggleExpanded}>
            <i className={`bi bi-${expanded ? "x" : "list"}`}></i>
          </div>
        )}

        {logo && (
          <div className="sidebar-header">
            <a href={logo.href || "#"}>
              {typeof logo === "string" ? <img src={logo} alt="Logo" className="img-fluid" /> : logo}
            </a>
          </div>
        )}

        <ul className="nav flex-column">
          {items.map((item) => (
            <li key={item.id} className={`nav-item ${activeItemState === item.id ? "active" : ""}`}>
              <a
                className={`nav-link ${activeItemState === item.id ? "active" : ""}`}
                href={item.href || "#"}
                onClick={(e) => {
                  if (!item.href || item.href === "#") {
                    e.preventDefault()
                  }
                  handleItemClick(item)
                }}
              >
                {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                <span className="nav-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {userMenu && (
          <div className="sidebar-footer">
            <div className="dropdown">
              <a
                href="#"
                className="d-flex align-items-center text-decoration-none dropdown-toggle"
                id="dropdownUser"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {userMenu.avatar && (
                  <img src={userMenu.avatar} alt="User" className="rounded-circle me-2" width="32" height="32" />
                )}
                <span>{userMenu.label || "User"}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser">
                {userMenu.items.map((item, index) => (
                  <li key={index}>
                    <a
                      className="dropdown-item"
                      href={item.href || "#"}
                      onClick={(e) => {
                        if (!item.href || item.href === "#") {
                          e.preventDefault()
                        }
                        if (item.onClick) {
                          item.onClick()
                        }
                      }}
                    >
                      {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default horizontal navigation for tablet/desktop
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {logo && (
          <a className="navbar-brand" href={logo.href || "#"}>
            {typeof logo === "string" ? <img src={logo} alt="Logo" height="30" /> : logo}
          </a>
        )}

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {items.map((item) => (
              <li key={item.id} className={`nav-item ${activeItemState === item.id ? "active" : ""}`}>
                <a
                  className={`nav-link ${activeItemState === item.id ? "active" : ""}`}
                  href={item.href || "#"}
                  onClick={(e) => {
                    if (!item.href || item.href === "#") {
                      e.preventDefault()
                    }
                    handleItemClick(item)
                  }}
                >
                  {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {userMenu && (
            <div className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {userMenu.avatar && (
                    <img src={userMenu.avatar} alt="User" className="rounded-circle me-2" width="30" height="30" />
                  )}
                  {userMenu.label || "User"}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  {userMenu.items.map((item, index) => (
                    <li key={index}>
                      <a
                        className="dropdown-item"
                        href={item.href || "#"}
                        onClick={(e) => {
                          if (!item.href || item.href === "#") {
                            e.preventDefault()
                          }
                          if (item.onClick) {
                            item.onClick()
                          }
                        }}
                      >
                        {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TouchFriendlyNavigation

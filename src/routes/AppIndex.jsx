"use client"

import { useState, useEffect } from "react"
import Sidebar from "../pages/sidebar/Sidebar"
import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { FaBars } from "react-icons/fa"
import "./app-index.css"

export default function AppIndex() {
  const [isOpen, setIsOpen] = useState(false) // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false)

  const { user } = useSelector((s) => s.auth)

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-open sidebar on desktop, closed on mobile
      if (!mobile && !isOpen) {
        setIsOpen(true)
      } else if (mobile && isOpen) {
        setIsOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  // Student layout - full width container
  if (user.user_type === "Student") {
    return (
      <div className="student-layout">
        <Outlet />
      </div>
    )
  }

  // Admin/Teacher layout with sidebar
  return (
    <div className="app-layout">
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header">
          <button className="mobile-toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="mobile-logo">
            <img
              src={require("../assets/startupIcon.png") || "/placeholder.svg"}
              alt="Elite CBT"
              className="mobile-logo-img"
            />
            <span className="mobile-app-name">Elite CBT</span>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar-container ${isOpen ? "open" : "closed"} ${isMobile ? "mobile" : "desktop"} `}>
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      </div>

      {/* Main Content */}
      <div className={`main-content ${isOpen && !isMobile ? "with-sidebar" : "full-width"}`}>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

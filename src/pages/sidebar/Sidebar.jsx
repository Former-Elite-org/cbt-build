// "use client"

// import "./sidebar.css"
// import { FaChevronRight, FaTimes } from "react-icons/fa"
// import { Link, useLocation } from "react-router-dom"
// import { TbLogout2 } from "react-icons/tb"

// // Updated icons
// import { AiOutlineDashboard } from "react-icons/ai"
// import { GiNewspaper } from "react-icons/gi"
// import { IoMdSchool, IoMdSettings } from "react-icons/io"
// import { GrUserWorker } from "react-icons/gr"
// import { MdPeopleAlt } from "react-icons/md"
// import { BsCalendarWeek } from "react-icons/bs"
// import { BsJournal } from "react-icons/bs"

// import { useSelector } from "react-redux"
// import { logout } from "../../redux/actions/auth"
// import { useNavigate } from "react-router-dom"
// import { useDispatch } from "react-redux"
// import appLogo from "../../assets/app-logo.png"

// export default function Sidebar({ isOpen, toggleSidebar, isMobile }) {
//   const { user } = useSelector((s) => s.auth)
//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const location = useLocation()

//   const handleLogout = () => {
//     // navigate("/login")
//     dispatch(logout(navigate))
//   }

//   const handleLinkClick = () => {
//     // Close sidebar on mobile when link is clicked
//     if (isMobile) {
//       toggleSidebar()
//     }
//   }

//   if (user.user_type === "Student") return null

//   const isActiveLink = (path) => {
//     return location?.pathname === path || location?.pathname.startsWith(path + "/")
//   }
//   return (
//     <nav className={`sidebar ${isOpen ? "open" : "close"} ${isMobile ? "mobile" : "desktop"}`}>
//       <header className="sidebar-header">
//         <div className={`image-text ${isOpen ? "large" : "small"}`}>
//           <div className="logo">
//             <img
//               src={appLogo}
//               alt="Elite CBT"
//               className="logo-img"
//             />
//             {isOpen && <span className="app-name">Elite CBT</span>}
//           </div>
//         </div>

//         {/* Toggle button - different for mobile and desktop */}
//         {isMobile ? (
//           <FaTimes className="mobile-close" onClick={toggleSidebar} />
//         ) : (
//           <FaChevronRight className={`toggle ${isOpen ? "rotated" : ""}`} onClick={toggleSidebar} />
//         )}
//       </header>

//       <div className="menu-bar">
//         <div className="menu">
//           {/* Dashboard */}
//           <ul className="menu-links">
//             <li className={`nav-link ${isActiveLink("/dashboard") ? "active" : ""}`}>
//               <Link to="/dashboard" onClick={handleLinkClick}>
//                 <AiOutlineDashboard className="icon" />
//                 <span className="text nav-text">Dashboard</span>
//               </Link>
//             </li>
//           </ul>

//           {/* Exams Section */}
//           {isOpen && <div className="menu-category">Exams</div>}
//           <ul className="menu-links">
//             <li className={`nav-link ${isActiveLink("/exams") ? "active" : ""}`}>
//               <Link to="/exams" onClick={handleLinkClick}>
//                 <GiNewspaper className="icon" />
//                 <span className="text nav-text">Newly Created Exams</span>
//               </Link>
//             </li>
//             {user.user_type?.toLowerCase().includes("admin") && (
//               <li className={`nav-link ${isActiveLink("/exam/reports") ? "active" : ""}`}>
//                 <Link to="/exam/reports" onClick={handleLinkClick}>
//                   <BsJournal className="icon" />
//                   <span className="text nav-text">Exam Reports</span>
//                 </Link>
//               </li>
//             )}
//             {user.user_type === "Teacher" && (
//               <li className={`nav-link ${isActiveLink("/exam/results") ? "active" : ""}`}>
//                 <Link to="/exam/results" onClick={handleLinkClick}>
//                   <BsJournal className="icon" />
//                   <span className="text nav-text">Exam Results</span>
//                 </Link>
//               </li>
//             )}
//           </ul>

//           {/* Admin Section */}
//           {user.user_type?.toLowerCase().includes("admin") && (
//             <>
//               {isOpen && <div className="menu-category">School Management</div>}
//               <ul className="menu-links">

//                 <li className={`nav-link ${isActiveLink("/school/sections") ? "active" : ""}`}>
//                   <Link to="/school/sections" onClick={handleLinkClick}>
//                     <BsJournal className="icon" />
//                     <span className="text nav-text">School Sections</span>
//                   </Link>
//                 </li>
//                  <li className={`nav-link ${isActiveLink("/school/classes") ? "active" : ""}`}>
//                   <Link to="/school/classes" onClick={handleLinkClick}>
//                     <IoMdSchool className="icon" />
//                     <span className="text nav-text">School Classes</span>
//                   </Link>
//                 </li>
//                 <li className={`nav-link ${isActiveLink("/school/subjects") ? "active" : ""}`}>
//                   <Link to="/school/subjects" onClick={handleLinkClick}>
//                     <BsJournal className="icon" />
//                     <span className="text nav-text">School Subjects</span>
//                   </Link>
//                 </li>

//                 <li className={`nav-link ${isActiveLink("/students/list") ? "active" : ""}`}>
//                   <Link to="/students/list" onClick={handleLinkClick}>
//                     <MdPeopleAlt className="icon" />
//                     <span className="text nav-text">School Students</span>
//                   </Link>
//                 </li>
//                 <li className={`nav-link ${isActiveLink("/teachers/list") ? "active" : ""}`}>
//                   <Link to="/teachers/list" onClick={handleLinkClick}>
//                     <GrUserWorker className="icon" />
//                     <span className="text nav-text">School Teachers</span>
//                   </Link>
//                 </li>
//                 <li className={`nav-link ${isActiveLink("/school/terms") ? "active" : ""}`}>
//                   <Link to="/school/terms" onClick={handleLinkClick}>
//                     <BsCalendarWeek className="icon" />
//                     <span className="text nav-text">Term Manager</span>
//                   </Link>
//                 </li>
//                 <li className={`nav-link ${isActiveLink("/school/exam-grading") ? "active" : ""}`}>
//                   <Link to="/school/exam-grading" onClick={handleLinkClick}>
//                     <IoMdSettings className="icon" />
//                     <span className="text nav-text">Exam Grade Setup</span>
//                   </Link>
//                 </li>
//               </ul>
//             </>
//           )}
//         </div>

//         {/* Bottom Content */}
//         <div className="bottom-content">
//           <ul className="menu-links">
//             <li className="nav-link logout-link">
//               <Link to="/login" onClick={handleLogout}>
//                 <TbLogout2 className="icon" />
//                 <span className="text nav-text">Logout</span>
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   )
// }

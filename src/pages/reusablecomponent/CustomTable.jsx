"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  InputGroup,
  InputGroupText,
  Button,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
} from "reactstrap"
import { FaSearch, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { motion } from "framer-motion"

export default function CustomTable({
  type = "",
  fields = [],
  data = [],
  className = "",
  styles = {},
  rowStyle = () => ({}),
  message = "List is empty.",
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  // Filter data based on search query
  const filteredData = data.filter((item) =>
    fields.some((field) =>
      String(item[field.value] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    ),
  )

  // Paginate filtered data
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  const visibleFields = fields.filter((field) => !field.hidden)

  return (
    <div className={`w-100 ${className}`} style={styles}>
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 py-5">
          <Row className="align-items-center">
            <Col md={6}>
              <h4 className="mb-0 font-bold text-2xl text-white text-uppercase tracking-wider">{type}</h4>
            </Col>
            <Col md={6}>
              <Row className="g-3 justify-content-end">
                <Col xs={12} sm={8} md={6}>
                  <InputGroup className="shadow-sm bg-white/90 backdrop-blur-sm rounded-xl">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-transparent text-gray-800"
                      style={{ fontSize: "15px", padding: "0.75rem 1rem" }}
                    />
                    <InputGroupText className="bg-transparent border-0 text-primary">
                      <FaSearch className="text-gray-400" />
                    </InputGroupText>
                  </InputGroup>
                </Col>
                <Col xs="auto">
                  <Button
                    color="light"
                    size="sm"
                    className="shadow-sm border-0 text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200 me-2"
                    style={{ borderRadius: "12px", padding: "0.5rem 1rem" }}
                  >
                    <FaFilter className="text-lg" />
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="shadow-sm border-0 text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200"
                    style={{ borderRadius: "12px", padding: "0.5rem 1rem" }}
                  >
                    <FaDownload className="text-lg" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead className="bg-gray-50">
                  <tr>
                    {visibleFields.map((field, idx) => (
                      <th
                        key={idx}
                        className="border-b border-gray-200 text-uppercase font-semibold text-gray-700 px-6 py-4"
                        style={{ fontSize: "13px", letterSpacing: "0.5px" }}
                      >
                        {field.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          ...rowStyle(item),
                          borderLeft: "4px solid transparent",
                        }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftColor = "#007bff"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftColor = "transparent"
                        }}
                      >
                        {visibleFields.map((field, fieldIdx) => (
                          <td key={fieldIdx} className="px-6 py-4 align-middle" style={{ fontSize: "14px" }}>
                            {field.custom && field.component
                              ? field.component(item, (currentPage - 1) * itemsPerPage + idx)
                              : item[field.value] || item[field.value_alt] || <span className="text-muted">-</span>}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={visibleFields.length} className="text-center py-5 text-muted">
                        <div className="py-4">
                          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                          <p className="mb-0 font-weight-medium">{message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none p-4">
            {paginatedData.length > 0 ? (
              <div className="space-y-4">
                {paginatedData.map((item, idx) => (
                  <div key={idx} className="col-12">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card
                        className="border-0 shadow-sm h-100 transition-all duration-300 hover:shadow-lg"
                        style={{
                          ...rowStyle(item),
                          borderRadius: "16px",
                          borderLeft: "4px solid #007bff",
                          backgroundColor: "#fff",
                        }}
                      >
                        <CardBody className="p-5">
                          {visibleFields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="flex items-center justify-between mb-4 last:mb-0">
                              <div className="text-gray-500 text-sm font-medium">
                                {field.title}:
                              </div>
                              <div className="text-gray-900 dark:text-white text-sm font-medium">
                                {field.custom && field.component ? (
                                  field.component(item, (currentPage - 1) * itemsPerPage + idx)
                                ) : (
                                  <span>
                                    {item[field.value] || item[field.value_alt] || (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardBody>
                      </Card>
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm text-center py-8 bg-gray-50">
                <CardBody>
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-inbox fa-4x"></i>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">{message}</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <Row className="align-items-center">
                <Col md={6} className="mb-2 mb-md-0">
                  <p className="text-gray-600 text-sm">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}</span> to{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{filteredData.length}</span> results
                  </p>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-center justify-content-md-end">
                    <Pagination className="mb-0" size="sm">
                      <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink previous onClick={handlePrev} className="border-0 bg-transparent text-gray-600 hover:text-gray-900 dark:text-white">
                          <FaChevronLeft className="me-1" />
                          Previous
                        </PaginationLink>
                      </PaginationItem>

                      <PaginationItem active>
                        <PaginationLink className="border-0 bg-primary-500 text-white rounded-full px-3 py-1.5">
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>

                      <PaginationItem disabled={currentPage === totalPages}>
                        <PaginationLink next onClick={handleNext} className="border-0 bg-transparent text-gray-600 hover:text-gray-900 dark:text-white">
                          Next
                          <FaChevronRight className="ms-1" />
                        </PaginationLink>
                      </PaginationItem>
                    </Pagination>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

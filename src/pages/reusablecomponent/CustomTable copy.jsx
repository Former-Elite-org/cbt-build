import React, { useState } from "react";
import {
  Input,
  InputGroup,
  InputGroupText,
  Button,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import { FaSearch, FaFilter, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";

export default function CustomTable(props) {
  const {
    type = "",
    fields = [],
    data = [],
    className = "",
    styles = {},
    rowStyle = () => ({}),
    message = "List is empty.",
  } = props;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered Data
  const filteredData = data.filter((item) =>
    fields.some((field) =>
      String(item[field.value] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  // Paginated Data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination Handlers
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) =>
      Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage))
    );

  return (
    <Card className="custom-table-card">
      <CardHeader className="bg-white border-0">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-2">
          <div className="d-flex align-items-center">
            <h4 className="custom-table-header">{type.toUpperCase()}</h4>
          </div>

          <div className="d-flex gap-3">
            <div className="custom-table-search">
              <InputGroup className="custom-table-search-input">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="custom-table-search-field"
                />
                <InputGroupText className="custom-table-search-icon">
                  <FaSearch />
                </InputGroupText>
              </InputGroup>
            </div>

            <button className="custom-table-icon-button">
              <FaFilter />
            </button>

            <button className="custom-table-icon-button">
              <FaDownload />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                {fields?.map((_item, _idx) => {
                  if (_item.hidden) return null;
                  return (
                    <th key={_idx} className="custom-table-header-cell">
                      {_item.title}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {paginatedData && paginatedData.length ? (
                paginatedData.map((item, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="custom-table-row"
                    style={{ ...rowStyle(item) }}
                  >
                    {fields.map((_item, _idx) => {
                      if (_item.hidden) return null;
                      if (_item.custom) {
                        const absoluteIndex = (currentPage - 1) * itemsPerPage + idx;
                        return (
                          <td key={_idx} className="custom-table-cell">
                            {_item.component(item, absoluteIndex)}
                          </td>
                        );
                      }

                      return (
                        <td key={_idx} className="custom-table-cell">
                          {item[_item.value] || item[_item.value_alt] || "-"}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={fields?.length}>
                    <div className="custom-table-empty">
                      <p>{message}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="custom-table-pagination">
          <Button
            className="custom-table-pagination-button"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left me-2"></i>
            Previous
          </Button>
          <div style={{ color: "#1a237e", fontWeight: 500 }}>
            Page {currentPage} of{" "}
            {Math.ceil(filteredData.length / itemsPerPage)}
          </div>
          <Button
            className="custom-table-pagination-button"
            onClick={handleNext}
            disabled={
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
            }
          >
            Next
            <i className="fas fa-chevron-right ms-2"></i>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

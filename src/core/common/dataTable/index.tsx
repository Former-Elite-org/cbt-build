import React, { useState, useEffect } from "react";
import { Table, Input, Card } from "antd";
import "antd/dist/reset.css";
import { CardHeader } from "reactstrap";

export interface DatatableProps {
  columns: any[];
  dataSource: any[];
  Selection?: boolean;
  setDataSource?: (data: any[]) => void;
  pageSizeOptions?: (number | string)[];
  defaultPageSize?: number;
  withSearch?: boolean;
  withPagination?: boolean;
  title?:string|null
}

const Datatable = ({
  columns,
  dataSource,
  Selection = false,
  setDataSource,
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 10,
  withSearch = true,
  withPagination = true,
  title=null
}: DatatableProps) => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(dataSource);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Global search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(dataSource);
      return;
    }

    const filtered = dataSource.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );

    setFilteredData(filtered);
  }, [searchText, dataSource]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Auto-expand all rows on mobile
      setExpandedRowKeys(filteredData?.map((item) => item.key || item.id || ""));
    } else {
      // Collapse all on desktop
      setExpandedRowKeys([]);
    }
  }, [filteredData, isMobile]);


  // Row selection logic
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
      const selectedData = filteredData.filter((item) =>
        selectedKeys.includes(item.key || item.id)
      );
      if (setDataSource) setDataSource(selectedData);
    },
  };


  return (
    <Card>
      <CardHeader><h3>{title}</h3></CardHeader>
      {withSearch && (
        <div style={{ marginBottom: 20 }}>
          <Input.Search
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: '75%' }}
          />
        </div>
      )}

      {isMobile ? (
        // MOBILE: custom rendering
        filteredData?.map((record: any, index: number) => (
          <div
            key={record.key || index}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              background: "#fff",
            }}
          >
            {columns?.map((col: any) => {
              if (col.dataIndex) {
                const content = col.render
                  ? col.render(record[col.dataIndex], record, index) // ✅ index passed here!
                  : record[col.dataIndex];
                return (
                  <div
                    key={col.key || col.dataIndex}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <strong>{col.title}:</strong>
                    <span>{content}</span>
                  </div>
                );
              } else if (col.render) {
                return (
                  <div
                    key={col.key || col.title}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <strong>{col.title}:</strong>
                    <span>{col.render(null, record, index)}</span> {/* ✅ index passed here too! */}
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        ))

      ) : (
        // DESKTOP: AntD Table
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={
            withPagination
              ? {
                pageSize: defaultPageSize,
                showSizeChanger: true,
                pageSizeOptions: pageSizeOptions?.map(String),
              }
              : false
          }
          rowSelection={Selection ? rowSelection : undefined}
          locale={{ emptyText: "No matching records found" }}
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );

};

export default Datatable;
  
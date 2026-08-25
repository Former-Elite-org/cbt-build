// index.tsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button } from "antd";
import { DatatableProps } from "../../data/interface"; // Ensure correct path

const DataFormtable: React.FC<DatatableProps> = ({
  columns,
  dataSource,
  setDataSource,
}) => {
  const [localData, setLocalData] = useState(dataSource || []);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [showInputs, setShowInputs] = useState(localData.length === 0);

  // Handle input change for new row
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    setNewRow({ ...newRow, [key]: e.target.value });
  };

  // Add new row to the table
  const handleAddRow = () => {
    setLocalData([...localData, { ...newRow, key: localData.length }]);
    setNewRow({});
  };

  // Define columns with input fields if dataSource is empty
  const modifiedColumns = columns.map((col) => ({
    ...col,
    render: (_: any, __: any, index: number) =>
      showInputs ? (
        <Input
          placeholder={`Enter ${col.title}`}
          value={newRow[col.dataIndex]}
          onChange={(e) => handleInputChange(e, col.dataIndex)}
        />
      ) : col.render ? (
        col.render(_, __, index)
      ) : (
        _
      ),
  }));

  useEffect(() => {
    handleAddRow();
  }, [0]);
  return (
    <>
      {/* {JSON.stringify(dataSource)} */}
      <div className="table-top-data d-flex px-3 justify-content-between">
        <div className="page-range"></div>
      </div>

      <Table
        className="table datanew dataTable no-footer"
        columns={modifiedColumns}
        dataSource={localData}
        pagination={{
          locale: { items_per_page: "" },
          nextIcon: <span>Next</span>,
          prevIcon: <span>Prev</span>,
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
      />

      {showInputs && (
        <Button type="primary" onClick={handleAddRow} style={{ marginTop: 2 }}>
          Add +
        </Button>
      )}
    </>
  );
};

export default DataFormtable;

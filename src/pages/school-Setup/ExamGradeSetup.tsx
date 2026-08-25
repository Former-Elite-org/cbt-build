import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Form, Input, Select, Modal, Button } from "antd";
import { Form as FormUI, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { gradePoints, activeList, _get, _post } from "../../Helper";
import Datatable from "../../core/common/dataTable/index.tsx";
import { motion } from "framer-motion"
const { Option } = Select;

const _form = {
  query_type: 'create',
  min_score: "",
  max_score: "",
  grade: "",
  remark: "",
  section: "",
  status: "Active",
};

interface GradeProps { }

const ExamGradeSetup: React.FC<GradeProps> = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [form, setForm] = useState(_form);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [formInstance] = Form.useForm();

  useEffect(() => {
    _get('classes?query_type=select-sections',
      (res) => setSections(res.data),
      console.error
    );
  }, []);

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getGrades = useCallback(() => {
    _get(
      "grade-setup?query_type=select-all",
      (res) => {
        if (res.data && res.data.length) {
          setGrades(res.data);
        }
      },
      (err) => {
        toast.error("Error occurred");
        console.error("Error: ", err);
      }
    );
  }, []);

  useEffect(() => {
    getGrades();
  }, [getGrades]);

  const handleSubmit = (query_type = 'Create') => {
    _post(
      'grade-setup',
      { ...form, query_type },
      (res) => {
        if (res.success) {
          getGrades();
          toast.success('Submitted');
          setIsAddModalVisible(false);
          setIsEditModalVisible(false);
        }
      },
      (err) => {
        toast.error("Error: Not Submitted.");
        console.log(err);
      }
    );
  };

  const handleDelete = () => {
    handleSubmit("delete");
    setIsDeleteModalVisible(false);
  };

  const handleEdit = (record: any) => {
    setForm({ ...record, query_type: 'UPDATE' });
    setSelectedRecord(record);
    formInstance.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
    formInstance.resetFields();
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_text: string, _record: any, index: number) => (
        <span>{index + 1}</span>
      ),
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      render: (text: string) => <span>{text || 'All'}</span>,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Min Score",
      dataIndex: "min_score",
      key: "min_score",
      render: (text: string) => <span>{text}%</span>,
    },
    {
      title: "Max Score",
      dataIndex: "max_score",
      key: "max_score",
      render: (text: string) => <span>{text}%</span>,
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_dataIndex: number, record: any) => (
        <div className="d-flex align-items-center">
          <div className="dropdown">
            <Link
              to="#"
              className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="ti ti-dots-vertical fs-14" />
            </Link>
            <ul className="dropdown-menu dropdown-menu-right p-3">
              <li>
                <Button
                  className="dropdown-item rounded-1"
                  onClick={() => handleEdit(record)}
                >
                  <i className="ti ti-edit-circle me-2" />
                  Edit
                </Button>
              </li>
              <li>
                <Button
                  className="dropdown-item rounded-1"
                  onClick={() => {
                    setForm({ ...record, id: record.id, query_type: 'DELETE' });
                    setIsDeleteModalVisible(true);
                  }}
                >
                  <i className="ti ti-trash-x me-2" />
                  Delete
                </Button>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const mapped_section = sections.map((i: any) => ({
    label: i.section,
    value: i.section,
  }));

  return (
    <div className="elite-admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="dashboard-title">School Setup</h2>
          {/* <p className="dashboard-subtitle">Manage exams, monitor performance, and oversee CBT operations</p> */}
        </motion.div>
      </div>

      <div style={{ marginTop: 60 }}>
        {/* Page Header */}

        <div className="d-flex justify-content-end mt-3">
          <Button
            type="primary"
            className="btn btn-primary"
            onClick={() => {
              setForm(_form);
              setIsAddModalVisible(true);
            }}
          >
            <i className="ti ti-square-rounded-plus-filled me-2" />
            Add Grade
          </Button>
        </div>

        {/* /Page Header */}

        {/* Grade List Card */}
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Grade List</h4>
          </div>
          <div className="card-body p-0 py-3">
            <Datatable
              columns={columns}
              dataSource={grades}
            />
          </div>
        </div>
        {/* /Grade List Card */}

        {/* Add Grade Modal */}
        <Modal
          title="Add Grade"
          open={isAddModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={formInstance}
            onFinish={() => handleSubmit("Create")}
            layout="vertical"
            initialValues={_form}
          >
            <Form.Item label="Section" name="section">
              <Select
                showSearch
                placeholder="Select Section"
                optionFilterProp="children"
                options={[
                  { value: "", label: "All" },
                  ...mapped_section,
                ]}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, section: value }))
                }
              />
            </Form.Item>

            <Form.Item
              label="Marks From (%)"
              name="min_score"
              rules={[{ required: true, message: "Please enter min score!" }]}
            >
              <Input
                type="number"
                name="min_score"
                onChange={handleChanges}
                placeholder="Enter Min Score"
              />
            </Form.Item>

            <Form.Item
              label="Marks Upto (%)"
              name="max_score"
              rules={[{ required: true, message: "Please enter max score!" }]}
            >
              <Input
                type="number"
                name="max_score"
                onChange={handleChanges}
                placeholder="Enter Max Score"
              />
            </Form.Item>

            <Form.Item
              label="Grade"
              name="grade"
              rules={[{ required: true, message: "Please select grade!" }]}
            >
              <Select
                showSearch
                placeholder="Select Grade"
                optionFilterProp="children"
                options={gradePoints}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, grade: value }))
                }
              />
            </Form.Item>

            <Form.Item
              label="Remark"
              name="remark"
              rules={[{ required: true, message: "Please enter remark!" }]}
            >
              <Input
                name="remark"
                onChange={handleChanges}
                placeholder="Enter Remark"
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select
                showSearch
                placeholder="Select Status"
                optionFilterProp="children"
                options={activeList}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              />
            </Form.Item>

            <div className="d-flex justify-content-end mt-3">
              <Button htmlType="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="ms-2">
                Add Grade
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Edit Grade Modal */}
        <Modal
          title="Edit Grade"
          open={isEditModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={formInstance}
            onFinish={() => handleSubmit("Update")}
            layout="vertical"
            initialValues={form}
          >
            <Form.Item
              label="Grade"
              name="grade"
              rules={[{ required: true, message: "Please enter grade!" }]}
            >
              <Input
                name="grade"
                onChange={handleChanges}
                placeholder="Enter Grade"
              />
            </Form.Item>

            <Form.Item
              label="Min Score (%)"
              name="min_score"
              rules={[{ required: true, message: "Please enter min score!" }]}
            >
              <Input
                name="min_score"
                onChange={handleChanges}
                placeholder="Enter Min Score"
              />
            </Form.Item>

            <Form.Item
              label="Max Score (%)"
              name="max_score"
              rules={[{ required: true, message: "Please enter max score!" }]}
            >
              <Input
                name="max_score"
                onChange={handleChanges}
                placeholder="Enter Max Score"
              />
            </Form.Item>

            <Form.Item
              label="Remark"
              name="remark"
              rules={[{ required: true, message: "Please enter remark!" }]}
            >
              <Input
                name="remark"
                onChange={handleChanges}
                placeholder="Enter Remark"
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select
                showSearch
                placeholder="Select Status"
                optionFilterProp="children"
                options={activeList}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              />
            </Form.Item>

            <div className="d-flex justify-content-end mt-3">
              <Button htmlType="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="ms-2">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Deletion"
          open={isDeleteModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button key="delete" danger onClick={handleDelete}>
              Yes, Delete
            </Button>,
          ]}
        >
          <p>You want to delete this item. This action cannot be undone.</p>
        </Modal>
      </div>
    </div>
  );
};

export default ExamGradeSetup;
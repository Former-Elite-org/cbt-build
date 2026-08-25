import React, { useEffect, useState } from "react";
import {
	Table,
	Modal,
	Form,
	Input,
	DatePicker,
	Button,
	Select,
	message,
	Badge,
	Space,
} from "antd";
import moment from "moment";
import { _get, _post } from "../../Helper";
import Datatable from "../../core/common/dataTable/index.tsx";
import { motion } from "framer-motion"
const { Option } = Select;

const SchoolTermSetup = () => {
	const [form] = Form.useForm();
	const [addForm] = Form.useForm();

	const [academicYears, setAcademicYears] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isAddModalVisible, setIsAddModalVisible] = useState(false);
	const [selectedTerm, setSelectedTerm] = useState(null);

	// Fetch academic years/terms
	const getAcademicYears = () => {
		_get(
			"get-academic-years",
			(res) => {
				if (res.success && Array.isArray(res.results)) {
					setAcademicYears(res.results);
				} else {
					message.error("Failed to fetch academic years.");
				}
			},
			(err) => {
				message.error("Error fetching academic years");
				console.error(err);
			}
		);
	};

	useEffect(() => {
		getAcademicYears();
	}, []);

	// Open edit modal
	const showEditModal = (record) => {
		setSelectedTerm(record);
		form.setFieldsValue({
			...record,
			id: record.id,
			term: record.term,
			begin_date: record.begin_date ? moment(record.begin_date) : null,
			end_date: record.end_date ? moment(record.end_date) : null,
			status: record.status || "Active",
		});
		setIsModalVisible(true);
	};

	// Close edit modal
	const handleCancelEdit = () => {
		setIsModalVisible(false);
		setSelectedTerm(null);
		form.resetFields();
	};

	// Submit updated term
	const handleSubmitEdit = () => {
		form.validateFields().then((values) => {
			const payload = {
				...values,
				query_type: values.query_type,
				status: values.status,
				begin_date: moment(values.begin_date).format("YYYY-MM-DD"),
				end_date: moment(values.end_date).format("YYYY-MM-DD"),
			};

			_post(
				"create-academic-years",
				payload,
				(res) => {
					if (res.success) {
						message.success("Term updated successfully!");
						getAcademicYears(); // Refresh list
						handleCancelEdit();
					} else {
						message.error("Failed to update term");
					}
				},
				(err) => {
					message.error("Error updating term");
					console.error(err);
				}
			);
		});
	};
	// Submit updated status
	const handleSubmitStatus = (values) => {
		const payload = {
			id: values.id,
			query_type: 'update-status',
			status: values.status,
		};

		_post(
			"create-academic-years",
			payload,
			(res) => {
				if (res.success) {
					message.success("Term updated successfully!");
					getAcademicYears(); // Refresh list
					handleCancelEdit();
				} else {
					message.error("Failed to update term");
				}
			},
			(err) => {
				message.error("Error updating term");
				console.error(err);
			}
		);
	};

	// Submit new term
	const handleSubmitAdd = () => {
		addForm.validateFields().then((values) => {
			const payload = {
				...values,
				query_type: "create",
				begin_date: moment(values.begin_date).format("YYYY-MM-DD"),
				end_date: moment(values.end_date).format("YYYY-MM-DD"),
			};

			_post(
				"create-academic-years",
				payload,
				(res) => {
					if (res.success) {
						message.success("Term created successfully!");
						getAcademicYears(); // Refresh list
						handleCancelAdd();
					} else {
						message.error("Failed to create term");
					}
				},
				(err) => {
					message.error("Error creating term");
					console.error(err);
				}
			);
		});
	};

	// Cancel add modal
	const handleCancelAdd = () => {
		setIsAddModalVisible(false);
		addForm.resetFields();
	};

	const columns = [
		{
			title: "#",
			dataIndex: "id",
			key: "id",
			render: (_, __, index) => index + 1,
		},
		{
			title: "Term Setup",
			dataIndex: "academic_year",
			key: "academic_year",
		},
		{
			title: "Term",
			dataIndex: "term",
			key: "term",
		},
		{
			title: "Start Date",
			dataIndex: "begin_date",
			key: "begin_date",
			render: (text) => moment(text).format("YYYY-MM-DD"),
		},
		{
			title: "End Date",
			dataIndex: "end_date",
			key: "end_date",
			render: (text) => moment(text).format("YYYY-MM-DD"),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Badge
					status={status === "Active" ? "success" : "error"}
					text={status}
				/>
			),
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			render: (_, record) => (
				<Space>
					<Button secondary onClick={() => showEditModal({ ...record, query_type: 'update', })}>
						Edit
					</Button>
					<Button
					danger={record.status === 'Active' }
						type={record.status === 'Active' ? 'danger' : 'primary'}
						onClick={() => {
							handleSubmitStatus({
								...record, 
								status: record.status === 'Active' ? 'Inactive' : 'Active',
							});
						}}
					>
						{record.status === 'Active' ? 'Deactivate' : 'Activate'}
					</Button>
				</Space>
			),
		},
	];

	return ( <div className="elite-admin-dashboard">
		  {/* Header Section */}
		  <div className="dashboard-header">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
			  <h2 className="dashboard-title">Terms Management</h2>
			  {/* <p className="dashboard-subtitle">Manage exams, monitor performance, and oversee CBT operations</p> */}
			</motion.div>
		  </div>

		<div style={{marginTop: 60 }}>
			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: 16,
				}}
			>
				<h2>Manage Terms</h2>
				<Button type="primary" onClick={() => setIsAddModalVisible(true)}>
					+ New Term
				</Button>
			</div>

			{/* Table */}
			<Datatable dataSource={academicYears} columns={columns} />

			{/* Edit Term Modal */}
			<Modal
				title="Update Term"
				open={isModalVisible}
				onCancel={handleCancelEdit}
				footer={[
					<Button key="cancel" onClick={handleCancelEdit}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleSubmitEdit}>
						Save Changes
					</Button>,
				]}
			>
				<Form form={form} layout="vertical">
					{/* Academic Year Field */}
					<Form.Item
						label="Academic Year"
						name="year"
						rules={[{ required: true }]}
						initialValue={`${moment().year()}/${moment().year() + 1}`}
					>
						<Input placeholder="e.g. 2024/2025" />
					</Form.Item>
					<Form.Item
						rules={[{ required: true }]}
						label="Term" name="term">
						<Input disabled />
					</Form.Item>

					<Form.Item
						label="Start Date"
						name="begin_date"
						rules={[{ required: true, type: "date" }]}
					>
						<DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
					</Form.Item>

					<Form.Item
						label="End Date"
						name="end_date"
						rules={[{ required: true, type: "date" }]}
					>
						<DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
					</Form.Item>

					<Form.Item
						label="Status"
						name="status"
						rules={[{ required: true }]}
					>
						<Select>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			{/* Add New Term Modal */}
			<Modal
				title="Add New Term"
				open={isAddModalVisible}
				onCancel={handleCancelAdd}
				footer={[
					<Button key="cancel" onClick={handleCancelAdd}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleSubmitAdd}>
						Create Term
					</Button>,
				]}
			>
				<Form form={addForm} layout="vertical">
					{/* Academic Year Field */}
					<Form.Item
						label="Academic Year"
						name="year"
						rules={[{ required: true }]}
						initialValue={`${moment().year()}/${moment().year() + 1}`}
					>
						<Input placeholder="e.g. 2024/2025" />
					</Form.Item>
					<Form.Item
						label="Term Name"
						name="term"
						rules={[{ required: true }]}
					>
						<Input placeholder="e.g. First Term" />
					</Form.Item>

					<Form.Item
						label="Start Date"
						name="begin_date"
						rules={[{ required: true, type: "date" }]}
					>
						<DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
					</Form.Item>

					<Form.Item
						label="End Date"
						name="end_date"
						rules={[{ required: true, type: "date" }]}
					>
						<DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
					</Form.Item>

					<Form.Item
						label="Status"
						name="status"
						rules={[{ required: true }]}
						initialValue="Active"
					>
						<Select>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
		</div>
	);
};

export default SchoolTermSetup;
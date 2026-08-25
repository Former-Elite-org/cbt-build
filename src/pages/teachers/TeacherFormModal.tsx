// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import {
// Modal,Form,Input,DatePicker,Select,Button,Space,Divider,message,Tag,Row,Col,
// } from "antd";
// import { _post } from "../../Helper";
// import { useSelector } from "react-redux";
// import { toast } from "react-hot-toast";
// import { CloseCircleOutlined } from "@ant-design/icons";
// const { Option } = Select;
// const _teacherClass = {
// 	teacher_id: 0,
// 	subject: "",
// 	class_name: "",
// 	section: "",
// 	class_code: "",
// 	branch_id: "",
// }
// const _teacherRole = {
// 	teacher_id: 0,
// 	section: "",
// 	class_name: "",
// 	user_type: "",
// 	class_code: "",
// 	branch_id: "",
// 	subject: "",
// }
// const staffTypes = [
// 	{ label: "Academic Staff", value: "Academic Staff" },
// 	// { label: "None Academic Staff", value: "None Academic Staff" },
// ];
// const roleOptions = [{ label: "Form Master", value: "Form Master" }];
// const staffRoles = {
// 	"Academic Staff": [
// 		{ label: "School Head", value: "School Head" },
// 		{ label: "Vice School Head", value: "Vice School Head" },
// 		{ label: "Subject Teacher", value: "Subject Teacher" },
// 		{ label: "Form Master", value: "Form Master" },
// 		// { label: "Liberian", value: "Liberian" },
// 	],
// 	"None Academic Staff": [
// 		{ label: "Accountant", value: "Accountant" },
// 		{ label: "Cashier", value: "Cashier" },
// 		{ label: "Security", value: "Security" },
// 		{ label: "Cleaner", value: "Cleaner" },
// 		{ label: "Driver", value: "Driver" },
// 		{ label: "School Nurse", value: "School Nurse" },
// 		{ label: "Metron", value: "Metron" },
// 	],
// };
// const TeacherFormModal = ({
// 	visible,
// 	mode,
// 	initialValues,
// 	onCancel,
// 	onDone,
// }) => {
// 	const [form] = Form.useForm();
// 	const [teacherClass, setTeacherClass] = useState(_teacherClass);
// 	const [teacherRole, setTeacherRole] = useState(_teacherRole);
// 	const [teacherClasses, setTeacherClasses] = useState([]);
// 	const [teacherRoles, setTeacherRoles] = useState([]);
// 	// Remove a class from teacherClasses
// 	const removeTeacherClass = (index: number) => {
// 		setTeacherClasses((prev) => prev.filter((_, i) => i !== index));
// 	};
// 	const { user, selected_branch, subjects, classes, sections } = useSelector(
// 		(state: any) => state.auth
// 	);
// 	// Mapped Sections
// 	const mapped_section = useMemo(() => {
// 		return sections?.map((i: any) => ({
// 			label: i.section_name,
// 			value: i.section_name,
// 		}));
// 	}, [sections]);
// 	// Filtered classes by section
// 	const classOptions = useMemo(() => {
// 		return teacherClass.section
// 			? classes.filter((cls: any) => cls.section === teacherClass.section)
// 			: classes;
// 	}, [teacherClass.section, classes]);
// 	// Subject options based on class_code
// 	const subjectOptions = useMemo(() => {
// 		return subjects.filter((s: any) => s.class_code === teacherClass.class_code).map((s: any) => ({
// 			label: s.subject,
// 			value: s.subject_code,
// 		}));
// 	}, [subjects, teacherClass.class_code]);
// 	  const handleAddClass = useCallback(() => {
//     if (
//       teacherClass.class_name &&
//       teacherClass.section &&
//       teacherClass.subject
//     ) {
//       setTeacherClasses((prev) => [...prev, teacherClass]);
//       form.resetFields(['section', 'class_name', 'subject']);
//       setTeacherClass(_teacherClass);
//     }
//   }, [teacherClass, form]);
//   // Handle Add Role
//   const handleAddRole = useCallback(() => {
//     if (teacherRole.class_name && teacherRole.section && teacherRole.role) {
//       setTeacherRoles((prev) => [...prev, teacherRole]);
//       form.resetFields(['section', 'class_name', 'role']);
//       setTeacherRole(_teacherRole);
//     }
//   }, [teacherRole, form]);
//   // Submit handler
//   const handleSubmit = async () => {
//     try {
//       const values = await form.validateFields(); // Validate form
//       // alert(JSON.stringify(values))
//       const filtedTeacherSubjects = teacherClasses.filter((role) => role.teacher_id < 1)
//       const filtedTeacherRoles = teacherRoles.filter((role) => role.teacher_id < 1)
//       const payload = {
//         ...values,
//         query_type: mode,
//         school_id: user.school_id,
//         branch_id: selected_branch.branch_id,
//         teacherSubjects: filtedTeacherSubjects.map((sbj)=> ({
//           ...sbj,
//           teacher_id: initialValues?.id || 0, // Use existing ID for update
//         })),
//         teacherRoles:filtedTeacherRoles.map((role) => ({
//           ...role,
//           teacher_id: initialValues?.id || 0, // Use existing ID for update
//         })),
//         passport_url: initialValues?.passport_url || "",
//         teacher_id: initialValues?.id || 0, // Use existing ID for update
//         staff_type: values.staff_type,
//         user_type:
//          ["Subject Teacher","Form Master"].includes(values.staff_role) ? "Teacher":"Admin",
//       };
//       // alert(JSON.stringify(payload))
//       // return;
//       _post("teachers", payload, (res) => {
//         if (res.success) {
//           toast.success(
//             mode === "create" ? "Created successfully" : "Updated successfully"
//           );
//           onDone();
//           onCancel();
//         } else {
//           toast.error("Submission failed.");
//         }
//       });
//     } catch (error) {
//       // Form validation errors or runtime errors will be caught here
//       console.error("Submission error:", error);
//       message.error(
//         error?.message || "An unexpected error occurred during submission."
//       );
//     }
//   };
// useEffect(() => {
//     if(initialValues && initialValues.id) {
//       // If initialValues has an id, it means we are editing an existing teacher
//       setTeacherClasses(JSON.parse(initialValues.teacherClasses) || []);
//       setTeacherRoles(JSON.parse(initialValues.teacherRoles) || []);
//     }
//   }, [initialValues])
// 	// Remove a role from teacherRoles
// 	function removeTeacherRole(index: number) {
// 		setTeacherRoles((prev) => prev.filter((_, i) => i !== index));
// 	}
// const staffRole = Form.useWatch("staff_role", form);
// return (
//     <Modal
//       title={mode === "create" ? "Add New Teacher" : "Edit Teacher"}
//       open={visible}
//       onCancel={onCancel}
//       footer={[
//         <Button key="cancel" onClick={onCancel}>
//           Cancel
//         </Button>,
//         <Button key="submit" type="primary" onClick={handleSubmit}>
//           {mode === "create" ? "Add Teacher" : "Save Changes"}
//         </Button>,
//       ]}
//       width="100%"
//       style={{ maxWidth: 800 }}
//     >
//       {/* {JSON.stringify({staffRole:form.getFieldValue("staff_role")})} */}
//       <Form
//         form={form}
//         layout="vertical"
//         initialValues={{ ...initialValues, staff_type: staffTypes[0].value }}
//       >
//         {/* Personal Information */}
//         <Divider orientation="left">Appointment Details</Divider>

//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label="Staff Type"
//               name="staff_type"
//               rules={[{ required: true }]}
//             >
//               <Select options={staffTypes} />
//             </Form.Item>
//           </Col>
//           <Col span={12}>
//             <Form.Item
//               label="Staff Role"
//               name="staff_role"
//               rules={[{ required: true }]}
//             >
//               <Select
//                 options={
//                   staffRoles[
//                     form.getFieldValue("staff_type") || "Academic Staff"
//                   ] || []
//                 }
//               />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Divider orientation="left">Personal Information</Divider>
//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label="Full Name"
//               name="name"
//               rules={[{ required: true }]}
//             >
//               <Input />
//             </Form.Item>
//           </Col>
//           <Col span={12}>
//             <Form.Item label="Gender" name="sex" rules={[{ required: true }]}>
//               <Select
//                 options={["Male", "Female"].map((gender) => ({
//                   label: gender,
//                   value: gender,
//                 }))}
//               />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item
//               rules={[{ required: true }]}
//               label="Address"
//               name="address"
//             >
//               <Input />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label="Mobile No"
//               name="mobile_no"
//               rules={[
//                 { required: true, message: "Please input your mobile number!" },
//                 {
//                   pattern: /^(?:\+?[1-9]\d{7,14}|0\d{10})$/,
//                   message: "Please enter a valid mobile number!",
//                 },
//               ]}
//             >
//               <Input placeholder="Leading 0 or +234 " />
//             </Form.Item>
//           </Col>
//           <Col span={12}>
//             <Form.Item
//               rules={[
//                 { required: true, message: "Please input your email address!" },
//                 {
//                   type: "email",
//                   message: "Please enter a valid email address!",
//                 },
//               ]}
//               label="Email Address"
//               name="email"
//             >
//               <Input />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label="Password"
//               name="password"
//               initialValue="123456"
//               rules={[
//                 { required: true, message: "Please input your password!" },
//                 {
//                   min: 6,
//                   message: "Password must be at least 6 characters long!",
//                 },
//               ]}
//             >
//               <Input.Password placeholder="Enter your password" />
//             </Form.Item>
//           </Col>
//         </Row>
//         {["Subject Teacher","Form Master"].includes(staffRole) ? <>
//         <Divider orientation="left">Class & Subject Assignment</Divider>

//         <Row gutter={16}>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item
//               label="Section"
//               name="section"
//             >
//               <Select
//                 placeholder="Select Section"
//                 options={mapped_section}
//                 style={{ flex: 1 }}
//                 onChange={(value) =>
//                   setTeacherClass((p) => ({ ...p, section: value }))
//                 }
//                 value={teacherClass.section}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item
//               label="Class"
//               name="class_name"
//             >
//               <Select
//                 placeholder="Select Class"
//                 options={classOptions.map((c: any) => ({
//                   label: c.class_name,
//                   value: c.class_code,
//                 }))}
//                 style={{ flex: 1 }}
//                 onChange={(value) =>
//                   setTeacherClass((p) => {
//                     const selectedClass = classOptions.find(
//                       (c: any) => c.class_code === value
//                     );
//                     return {
//                       ...p,
//                       class_code: value,
//                       class_name: selectedClass?.class_name || "",
//                       branch_id: selectedClass.branch_id,
//                     };
//                   })
//                 }
//                 value={teacherClass.class_name}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item
//               rules={[{ required: teacherClasses.length < 1 }]}
//               label="Subject"
//               name="subject"
//             >
//               <Select
//                 placeholder="Select Subject"
//                 options={subjectOptions}
//                 style={{ flex: 1 }}
//                 onChange={(value) => {
//                   const selectedSubject = subjectOptions.find(
//                     (c: any) => c.value === value
//                   );
//                   setTeacherClass((p) => ({
//                     ...p,
//                     subject: selectedSubject.label,
//                     subject_code: selectedSubject.value,
//                   }));
//                 }}
//                 value={teacherClass.subject}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item label="Action" name="">
//               <Button type="primary" onClick={handleAddClass}>
//                 Add +
//               </Button>
//             </Form.Item>
//           </Col>
//         </Row>
//         {teacherClasses.map((cls: any, idx: number) => (
//           <Row key={idx} gutter={16}>
//             <Col xs={24} sm={12} md={8} lg={6}>
//               {cls.section}
//             </Col>
//             <Col xs={24} sm={12} md={8} lg={6}>
//               {cls.class_name}
//             </Col>
//             <Col xs={24} sm={12} md={8} lg={6}>
//               {cls.subject}
//             </Col>
//             <Col xs={24} sm={12} md={8} lg={6}>
//               <Button
//                 type="link"
//                 danger
//                 icon={<CloseCircleOutlined />}
//                 onClick={() => removeTeacherClass(idx)}
//               >
//                 Remove
//               </Button>
//             </Col>
//           </Row>
//         ))}
//         {/* Teacher Roles */}
//         <Divider orientation="left">Teacher Roles</Divider>
//         <Row gutter={16}>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item name="section" style={{ flex: 1 }} label="Section">
//               <Select
//                 placeholder="Select Section"
//                 options={mapped_section}
//                 onChange={(value) =>
//                   setTeacherRole((p) => ({ ...p, section: value }))
//                 }
//                 value={teacherRole.section}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item
//               // rules={[{ required: true }]}
//               label="Class"
//               name="class_name"
//             >
//               <Select
//                 placeholder="Select Class"
//                 options={classOptions.map((c: any) => ({
//                   label: c.class_name,
//                   value: c.class_code,
//                 }))}
//                 style={{ flex: 1 }}
//                 onChange={(value) =>
//                   setTeacherRole((p) => {
//                     const selectedClass = classOptions.find(
//                       (c: any) => c.class_code === value
//                     );
//                     return {
//                       ...p,
//                       class_code: value,
//                       class_name: selectedClass?.class_name || "",
//                       branch_id: selectedClass.branch_id,
//                       user_type: "Teacher",
//                     };
//                   })
//                 }
//                 value={teacherClass.class_name}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item
//               name="role"
//               style={{ flex: 1 }}
//               rules={[{ required: mode === "create" }]}
//               label="Role"
//             >
//               <Select
//                 placeholder="Select Role"
//                 options={roleOptions}
//                 style={{ flex: 1 }}
//                 onChange={(value) =>
//                   setTeacherRole((p) => ({ ...p, role: value }))
//                 }
//                 value={teacherRole.role}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Form.Item label="Action" name="">
//               <Button type="primary" onClick={handleAddRole}>
//                 Add +
//               </Button>
//             </Form.Item>
//           </Col>
//         </Row>
//         {teacherRoles.map((role, index) => (
//           <Row key={index} gutter={16}>
//             <Col span={6}>{role.section}</Col>
//             <Col span={6}>{role.class_name}</Col>
//             <Col span={6}>{role.role}</Col>
//             <Col span={6}>
//               <Button
//                 type="link"
//                 danger
//                 icon={<CloseCircleOutlined />}
//                 onClick={() => removeTeacherRole(index)}
//               >Remove
//               </Button>
//             </Col>
//           </Row>
//         ))}</>:null}
//       </Form>
//     </Modal>
//   );
// };
// export default TeacherFormModal;


import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Modal, Form, Input, Select, Button, Divider, message, Row, Col
} from "antd";
import { _post } from "../../Helper";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { CloseCircleOutlined } from "@ant-design/icons";

const _teacherClass = {
  teacher_id: 0, subject: "", class_name: "", section: "", class_code: "", branch_id: "",
};
const _teacherRole = {
  teacher_id: 0, section: "", class_name: "", user_type: "", class_code: "", branch_id: "", subject: "", role: ""
};
const staffTypes = [{ label: "Academic Staff", value: "Academic Staff" }];
const roleOptions = [{ label: "Form Master", value: "Form Master" }];
const staffRoles: Record<string, any[]> = {
  "Academic Staff": [
    { label: "School Head", value: "School Head" },
    { label: "Vice School Head", value: "Vice School Head" },
    { label: "Subject Teacher", value: "Subject Teacher" },
    { label: "Form Master", value: "Form Master" },
  ],
};

const TeacherFormModal = ({ visible, mode, initialValues, onCancel, onDone }: any) => {
  const [form] = Form.useForm();
  const [teacherClass, setTeacherClass] = useState(_teacherClass);
  const [teacherRole, setTeacherRole] = useState(_teacherRole);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [teacherRoles, setTeacherRoles] = useState<any[]>([]);

  const removeTeacherClass = (index: number) => {
    setTeacherClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const removeTeacherRole = (index: number) => {
    setTeacherRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const { user, selected_branch, subjects, classes, sections } = useSelector((state: any) => state.auth);

  const mapped_section = useMemo(() => {
    return sections?.map((i: any) => ({ label: i.section_name, value: i.section_name }));
  }, [sections]);

  const classOptions = useMemo(() => {
    return teacherClass.section ? classes.filter((cls: any) => cls.section === teacherClass.section) : classes;
  }, [teacherClass.section, classes]);

  const subjectOptions = useMemo(() => {
    return subjects.filter((s: any) => s.class_code === teacherClass.class_code).map((s: any) => ({
      label: s.subject, value: s.subject_code,
    }));
  }, [subjects, teacherClass.class_code]);

  const handleAddClass = useCallback(() => {
    if (teacherClass.class_name && teacherClass.section && teacherClass.subject) {
      setTeacherClasses((prev) => [...prev, teacherClass]);
      form.resetFields(['class_name', 'subject']);
      setTeacherClass(_teacherClass);
    }
  }, [teacherClass, form]);

  const handleAddRole = useCallback(() => {
    if (teacherRole.class_name && teacherRole.section && teacherRole.role) {
      setTeacherRoles((prev) => [...prev, teacherRole]);
      form.resetFields(['class_name', 'role']);
      setTeacherRole(_teacherRole);
    }
  }, [teacherRole, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const filteredTeacherSubjects = teacherClasses.filter((role) => role.teacher_id < 1);
      const filteredTeacherRoles = teacherRoles.filter((role) => role.teacher_id < 1);
      
      const payload = {
        ...values,
        query_type: mode,
        school_id: user.school_id,
        branch_id: selected_branch.branch_id,
        teacherSubjects: filteredTeacherSubjects.map((sbj) => ({ ...sbj, teacher_id: initialValues?.id || 0 })),
        teacherRoles: filteredTeacherRoles.map((role) => ({ ...role, teacher_id: initialValues?.id || 0 })),
        passport_url: initialValues?.passport_url || "",
        teacher_id: initialValues?.id || 0,
        staff_type: values.staff_type,
        user_type: ["Subject Teacher", "Form Master"].includes(values.staff_role) ? "Teacher" : "Admin",
      };

      _post("teachers", payload, (res) => {
        if (res.success) {
          toast.success(mode === "create" ? "Created successfully" : "Updated successfully");
          onDone();
          onCancel();
        } else { toast.error("Submission failed."); }
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      message.error(error?.message || "An unexpected error occurred during submission.");
    }
  };

  useEffect(() => {
    if (initialValues && initialValues.id) {
      setTeacherClasses(JSON.parse(initialValues.teacherClasses) || []);
      setTeacherRoles(JSON.parse(initialValues.teacherRoles) || []);
    }
  }, [initialValues]);

  const staffRole = Form.useWatch("staff_role", form);
  return (
    <Modal
      title={mode === "create" ? "Add New Teacher" : "Edit Teacher"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>{mode === "create" ? "Add Teacher" : "Save Changes"}</Button>,
      ]}
      width="100%"
      style={{ maxWidth: 800 }}
    >
      <Form form={form} layout="vertical" initialValues={{ ...initialValues, staff_type: staffTypes[0].value }}>
        <Divider orientation="left">Appointment Details</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Staff Type" name="staff_type" rules={[{ required: true }]}>
              <Select options={staffTypes} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Staff Role" name="staff_role" rules={[{ required: true }]}>
              <Select options={staffRoles[form.getFieldValue("staff_type") || "Academic Staff"] || []} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Personal Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Gender" name="sex" rules={[{ required: true }]}>
              <Select options={["Male", "Female"].map((g) => ({ label: g, value: g }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item rules={[{ required: true }]} label="Address" name="address"><Input /></Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Mobile No" name="mobile_no" rules={[{ required: true, message: "Please input mobile!" }, { pattern: /^(?:\+?[1-9]\d{7,14}|0\d{10})$/, message: "Invalid mobile!" }]}>
              <Input placeholder="Leading 0 or +234 " />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item rules={[{ required: true, message: "Please input email!" }, { type: "email", message: "Invalid email!" }]} label="Email Address" name="email"><Input /></Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Password" name="password" initialValue="123456" rules={[{ required: true, message: "Input password!" }, { min: 6, message: "Min 6 characters!" }]}>
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>
        </Row>

        {["Subject Teacher", "Form Master"].includes(staffRole) ? (
          <>
            <Divider orientation="left">Class & Subject Assignment</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Section" name="section">
                  <Select placeholder="Select Section" options={mapped_section} onChange={(v) => setTeacherClass((p) => ({ ...p, section: v }))} value={teacherClass.section} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Class" name="class_name">
                  <Select placeholder="Select Class" options={classOptions.map((c: any) => ({ label: c.class_name, value: c.class_code }))} onChange={(v) => setTeacherClass((p) => {
                    const sc = classOptions.find((c: any) => c.class_code === v);
                    return { ...p, class_code: v, class_name: sc?.class_name || "", branch_id: sc?.branch_id || "" };
                  })} value={teacherClass.class_name} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item rules={[{ required: teacherClasses.length < 1 }]} label="Subject" name="subject">
                  <Select placeholder="Select Subject" options={subjectOptions} onChange={(v) => {
                    const ss = subjectOptions.find((c: any) => c.value === v);
                    setTeacherClass((p) => ({ ...p, subject: ss?.label || "", subject_code: ss?.value || "" }));
                  }} value={teacherClass.subject} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Action"><Button type="primary" onClick={handleAddClass}>Add +</Button></Form.Item>
              </Col>
            </Row>

            {teacherClasses.map((cls: any, idx: number) => (
              <Row key={idx} gutter={16} className="mb-2 bg-gray-50/50 p-2 rounded">
                <Col span={6}>{cls.section}</Col><Col span={6}>{cls.class_name}</Col><Col span={6}>{cls.subject}</Col>
                <Col span={6}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => removeTeacherClass(idx)}>Remove</Button></Col>
              </Row>
            ))}

            <Divider orientation="left">Teacher Roles</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="section_role" label="Section">
                  <Select placeholder="Select Section" options={mapped_section} onChange={(v) => setTeacherRole((p) => ({ ...p, section: v }))} value={teacherRole.section} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Class" name="class_name_role">
                  <Select placeholder="Select Class" options={classOptions.map((c: any) => ({ label: c.class_name, value: c.class_code }))} onChange={(v) => setTeacherRole((p) => {
                    const sc = classOptions.find((c: any) => c.class_code === v);
                    return { ...p, class_code: v, class_name: sc?.class_name || "", branch_id: sc?.branch_id || "", user_type: "Teacher" };
                  })} value={teacherRole.class_name} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="role" rules={[{ required: mode === "create" }]} label="Role">
                  <Select placeholder="Select Role" options={roleOptions} onChange={(v) => setTeacherRole((p) => ({ ...p, role: v }))} value={teacherRole.role} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="Action"><Button type="primary" onClick={handleAddRole}>Add +</Button></Form.Item>
              </Col>
            </Row>

            {teacherRoles.map((role, index) => (
              <Row key={index} gutter={16} className="mb-2 bg-gray-50/50 p-2 rounded">
                <Col span={6}>{role.section}</Col><Col span={6}>{role.class_name}</Col><Col span={6}>{role.role}</Col>
                <Col span={6}><Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => removeTeacherRole(index)}>Remove</Button></Col>
              </Row>
            ))}
          </>
        ) : null}
      </Form>
    </Modal>
  );
};

export default TeacherFormModal;

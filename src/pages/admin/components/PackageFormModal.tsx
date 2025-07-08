import { FC, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, Select } from "antd";
import { Package } from "@/hooks/useAdminDashboard";

interface PackageFormModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: Omit<Package, "id">) => void;
  initialValues: Package | null;
  isSaving: boolean;
  categories: string[];
}

export const PackageFormModal: FC<PackageFormModalProps> = ({
  open,
  onCancel,
  onFinish,
  initialValues,
  isSaving,
  categories,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialValues || {
          name: "",
          price: 0,
          description: "",
          duration: "",
          category: "",
        }
      );
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title={isEditing ? "Edit Package" : "Add New Package"}
      open={open}
      onCancel={onCancel}
      footer={null}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Package Name"
          rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, type: "number" }]}>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/Rp\s?|(,*)/g, "") as any}
          />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true }]}>
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="duration"
          label="Duration (e.g., 30 hari)"
          rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSaving}>
            {isEditing ? "Save Changes" : "Create Package"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

import { FC, useState, useMemo } from "react";
import {
  Typography,
  Button,
  Table,
  Spin,
  Alert,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Input,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useAdminPackages } from "@/hooks/useAdminPackages";
import { Package } from "@/hooks/useAdminDashboard";
import { useUrlParams } from "@/hooks/useUrlParams";
import { PackageFormModal } from "./components/PackageFormModal";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const AdminPackages: FC = () => {
  const { packages, loading, error, addPackage, updatePackage, deletePackage } =
    useAdminPackages();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { getParam, setParams } = useUrlParams();

  const categories = [...new Set(packages.map((pkg) => pkg.category))].sort();

  const currentPage = parseInt(getParam("page") || "1", 10);
  const pageSize = parseInt(getParam("pageSize") || "10", 10);
  const searchTerm = getParam("search") || "";

  const filteredPackages = useMemo(() => {
    if (!searchTerm) return packages;

    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.duration.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [packages, searchTerm]);

  const showModal = (pkg: Package | null = null) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const handleFinish = async (values: Omit<Package, "id">) => {
    setIsSaving(true);
    try {
      if (editingPackage) {
        await updatePackage({ ...values, id: editingPackage.id });
        message.success("Package updated successfully");
      } else {
        await addPackage(values);
        message.success("Package added successfully");
      }
      handleCancel();
    } catch (e) {
      message.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePackage(id);
      message.success("Package deleted successfully");
    } catch (e) {
      message.error("Failed to delete package");
    }
  };

  const columns: ColumnsType<Package> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: categories.map((cat) => ({ text: cat, value: cat })),
      onFilter: (value: any, record: Package) => record.category === value,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      sorter: (a, b) => a.duration.localeCompare(b.duration),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Package) => {
        const isProtected = record.id <= 5;
        return (
          <Space size="middle">
            <Button onClick={() => showModal(record)} disabled={isProtected}>
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this package?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              disabled={isProtected}>
              <Button danger disabled={isProtected}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}>
        <Spin size="large" />
      </div>
    );
  if (error)
    return (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
      />
    );

  const handleTableChange = (pagination: any) => {
    setParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24 }}
        gutter={[16, 16]}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Manage Packages
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}>
            Add Package
          </Button>
        </Col>
      </Row>

      <Input
        placeholder="Search packages by name, category, description, or duration..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setParams({ search: e.target.value })}
        style={{ marginBottom: 16, maxWidth: 500 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredPackages}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredPackages.length,
        }}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      <PackageFormModal
        open={isModalVisible}
        onCancel={handleCancel}
        onFinish={handleFinish}
        initialValues={editingPackage}
        isSaving={isSaving}
        categories={categories}
      />
    </>
  );
};

export default AdminPackages;

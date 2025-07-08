import { FC, useMemo } from "react";
import { Typography, Table, Tag, Spin, Alert, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAdminDashboard, Customer } from "@/hooks/useAdminDashboard";
import { useUrlParams } from "@/hooks/useUrlParams";

const { Title } = Typography;

const AdminCustomers: FC = () => {
  const { customers, loading, error } = useAdminDashboard();
  const { getParam, setParams } = useUrlParams();

  const searchTerm = getParam("search") || "";

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.userId.toString().includes(searchTerm)
    );
  }, [customers, searchTerm]);

  if (loading) {
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
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: Customer, b: Customer) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "Not provided",
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      render: (userId: number) => `User #${userId}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value: any, record: Customer) => record.status === value,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
      sorter: (a: Customer, b: Customer) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Customer Management</Title>
        <p style={{ color: "#666", marginTop: 8 }}>
          Customers are automatically created when they make their first
          purchase.
        </p>

        <Input
          placeholder="Search customers by name, email, phone, or user ID..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setParams({ search: e.target.value })}
          style={{ maxWidth: 400, marginTop: 16 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        scroll={{ x: true }}
      />
    </>
  );
};

export default AdminCustomers;

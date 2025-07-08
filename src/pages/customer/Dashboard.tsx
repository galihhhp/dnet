import { FC } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Table,
  Tag,
} from "antd";
import { useCustomerDashboard } from "@/hooks/useCustomerDashboard";
import { useUrlParams } from "@/hooks/useUrlParams";
import { ShoppingCartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { TableProps } from "antd";
import { Transaction } from "@/hooks/useAdminDashboard";

const { Title } = Typography;

const CustomerDashboard: FC = () => {
  const { transactions, packages, loading, error } = useCustomerDashboard();
  const { getParam, setParams } = useUrlParams();

  const currentPage = parseInt(getParam("page") || "1", 10);
  const pageSize = parseInt(getParam("pageSize") || "10", 10);

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

  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  );

  const totalSpent = completedTransactions.reduce(
    (acc, t) => acc + t.amount,
    0
  );

  const getPackageName = (packageId: number) => {
    return packages.find((p) => p.id === packageId)?.name || "Unknown Package";
  };

  const columns: TableProps<Transaction>["columns"] = [
    {
      title: "Package Name",
      dataIndex: "packageId",
      key: "packageId",
      render: (id: number) => getPackageName(id),
      sorter: (a, b) =>
        getPackageName(a.packageId).localeCompare(getPackageName(b.packageId)),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "geekblue";
        if (status === "completed") color = "green";
        if (status === "pending") color = "volcano";
        if (status === "failed") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
      ],
      onFilter: (value: any, record: any) => record.status.indexOf(value) === 0,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val: string) => dayjs(val).format("DD MMM YYYY, HH:mm"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: "descend",
    },
  ];

  const handleTableChange = (pagination: any) => {
    setParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <>
      <Title level={2} style={{ marginBottom: "24px" }}>
        My Dashboard
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Spent"
              value={totalSpent}
              formatter={(value) =>
                `Rp ${Number(value).toLocaleString("id-ID")}`
              }
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Packages Purchased"
              value={completedTransactions.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Payment History">
            <Table
              dataSource={transactions}
              columns={columns}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: transactions.length,
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomerDashboard;

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
} from "antd";
import { Line } from "@ant-design/charts";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { UserOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { TransactionTable } from "@/components/TransactionTable";

const { Title } = Typography;

const AdminDashboard: FC = () => {
  const { transactions, customers, packages, loading, error } =
    useAdminDashboard();

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

  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const packageSales = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, transaction) => {
      const packageId = transaction.packageId;
      if (!acc[packageId]) {
        acc[packageId] = { count: 0 };
      }
      acc[packageId].count += 1;
      return acc;
    }, {} as Record<number, { count: number }>);

  const popularPackagesData = Object.entries(packageSales)
    .map(([packageId, data]) => {
      const pkg = packages.find((p) => p.id === parseInt(packageId));
      return {
        key: packageId,
        name: pkg ? pkg.name : `ID: ${packageId}`,
        sales: data.count,
        revenue: transactions
          .filter(
            (t) =>
              t.packageId === parseInt(packageId) && t.status === "completed"
          )
          .reduce((acc, t) => acc + t.amount, 0),
      };
    })
    .sort((a, b) => b.sales - a.sales);

  const revenueByDate = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => {
      const date = dayjs(t.date).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  const paymentMethodData = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, transaction) => {
      const method = transaction.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += transaction.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

  const totalTransactions = transactions.filter(
    (t) => t.status === "completed"
  ).length;

  const paymentAnalyticsData = Object.entries(paymentMethodData)
    .map(([method, data]) => ({
      key: method,
      paymentMethod: method,
      usageCount: data.count,
      totalAmount: data.amount,
      percentage: ((data.count / totalTransactions) * 100).toFixed(1),
    }))
    .sort((a, b) => b.usageCount - a.usageCount);

  return (
    <>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Admin Dashboard
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              formatter={(value) =>
                `Rp ${Number(value).toLocaleString("id-ID")}`
              }
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={transactions.length}
              prefix={<SwapOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Customers"
              value={customers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Revenue Over Time">
                <Line
                  data={chartData}
                  xField="date"
                  yField="revenue"
                  height={250}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Recent Transactions">
                <TransactionTable
                  transactions={transactions}
                  packages={packages}
                  loading={loading}
                  limit={5}
                />
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Popular Packages">
                <Table
                  dataSource={popularPackagesData}
                  columns={[
                    {
                      title: "Package",
                      dataIndex: "name",
                      key: "name",
                    },
                    {
                      title: "Sales",
                      dataIndex: "sales",
                      key: "sales",
                      sorter: (a, b) => b.sales - a.sales,
                    },
                    {
                      title: "Revenue",
                      dataIndex: "revenue",
                      key: "revenue",
                      render: (value: number) =>
                        `Rp ${value.toLocaleString("id-ID")}`,
                      sorter: (a, b) => b.revenue - a.revenue,
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Payment Method Analytics">
                <Table
                  dataSource={paymentAnalyticsData}
                  columns={[
                    {
                      title: "Payment Method",
                      dataIndex: "paymentMethod",
                      key: "paymentMethod",
                      render: (method: string) => (
                        <span style={{ textTransform: "capitalize" }}>
                          {method}
                        </span>
                      ),
                    },
                    {
                      title: "Usage Count",
                      dataIndex: "usageCount",
                      key: "usageCount",
                      sorter: (a, b) => b.usageCount - a.usageCount,
                    },
                    {
                      title: "Total Amount",
                      dataIndex: "totalAmount",
                      key: "totalAmount",
                      render: (value: number) =>
                        `Rp ${value.toLocaleString("id-ID")}`,
                      sorter: (a, b) => b.totalAmount - a.totalAmount,
                    },
                    {
                      title: "Percentage",
                      dataIndex: "percentage",
                      key: "percentage",
                      render: (value: string) => `${value}%`,
                      sorter: (a, b) =>
                        parseFloat(b.percentage) - parseFloat(a.percentage),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;

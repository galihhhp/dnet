import { FC } from "react";
import { Typography, Spin, Alert } from "antd";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { TransactionTable } from "@/components/TransactionTable";

const { Title } = Typography;

const AdminTransactions: FC = () => {
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

  return (
    <>
      <Title level={2} style={{ marginBottom: 24 }}>
        All Transactions
      </Title>
      <TransactionTable
        transactions={transactions}
        packages={packages}
        loading={loading}
        showSearch={true}
      />
    </>
  );
};

export default AdminTransactions;

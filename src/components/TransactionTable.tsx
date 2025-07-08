import { FC, useMemo } from "react";
import { Table, Tag, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useUrlParams } from "@/hooks/useUrlParams";
import dayjs from "dayjs";
import { Transaction, Package } from "@/hooks/useAdminDashboard";

interface TransactionTableProps {
  transactions: Transaction[];
  packages: Package[];
  loading: boolean;
  limit?: number;
  showSearch?: boolean;
}

export const TransactionTable: FC<TransactionTableProps> = ({
  transactions,
  packages,
  loading,
  limit,
  showSearch = false,
}) => {
  const { getParam, setParams } = useUrlParams();

  const searchTerm = getParam("search") || "";

  const getPackageName = (packageId: number) => {
    const pkg = packages.find((p) => p.id === packageId);
    return pkg ? pkg.name : `ID: ${packageId}`;
  };

  const filteredTransactions = useMemo(() => {
    if (!showSearch || !searchTerm) return transactions;

    return transactions.filter((transaction) => {
      const packageName = getPackageName(transaction.packageId);
      return (
        transaction.id.toString().includes(searchTerm) ||
        transaction.userId.toString().includes(searchTerm) ||
        packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentMethod
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm)
      );
    });
  }, [transactions, searchTerm, showSearch, packages]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      render: (id: number) => `User #${id}`,
    },
    {
      title: "Package Name",
      dataIndex: "packageId",
      key: "packageId",
      render: (id: number) => getPackageName(id),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `Rp ${val.toLocaleString("id-ID")}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "completed") color = "green";
        if (status === "pending") color = "orange";
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
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: "descend" as const,
    },
  ];

  const handleTableChange = (pagination: any) => {
    if (!limit) {
      setParams({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
    }
  };

  const finalTransactions = showSearch ? filteredTransactions : transactions;

  const sortedTransactions = useMemo(() => {
    return [...finalTransactions].sort(
      (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
    );
  }, [finalTransactions]);

  const tableData = limit
    ? sortedTransactions.slice(0, limit)
    : sortedTransactions;

  const paginationConfig = limit
    ? false
    : {
        current: parseInt(getParam("page") || "1", 10),
        pageSize: parseInt(getParam("pageSize") || "10", 10),
        total: sortedTransactions.length,
      };

  return (
    <>
      {showSearch && (
        <Input
          placeholder="Search transactions by ID, user ID, package, status, payment method, or amount..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setParams({ search: e.target.value })}
          style={{ marginBottom: 16, maxWidth: 600 }}
          allowClear
        />
      )}

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        pagination={paginationConfig}
        onChange={handleTableChange}
        scroll={{ x: true }}
        loading={loading}
      />
    </>
  );
};

import { FC, useMemo } from "react";
import {
  Table,
  Tag,
  Input,
  Button,
  message,
  Popconfirm,
  DatePicker,
  Space,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAuth } from "@/hooks/useAuth";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import {
  exportToExcel,
  formatCurrency,
  formatDate,
  formatStatus,
  ExcelColumn,
} from "@/utils/excelExport";
import api from "@/utils/api";
import dayjs from "dayjs";
import { Transaction, Package } from "@/hooks/useAdminDashboard";

const { RangePicker } = DatePicker;

interface TransactionTableProps {
  transactions: Transaction[];
  packages: Package[];
  loading: boolean;
  limit?: number;
  showSearch?: boolean;
  onTransactionUpdate?: () => void;
}

export const TransactionTable: FC<TransactionTableProps> = ({
  transactions,
  packages,
  loading,
  limit,
  showSearch = false,
  onTransactionUpdate,
}) => {
  const { getParam, setParams } = useUrlParams();
  const { user } = useAuth();

  const {
    filteredData: dateFilteredTransactions,
    dateRange,
    setDateRange,
    clearDateFilter,
    hasDateFilter,
  } = useDateRangeFilter(transactions, { dateField: "date" });

  const searchTerm = getParam("search") || "";

  const getPackageName = (packageId: number) => {
    const pkg = packages.find((p) => p.id === packageId);
    return pkg ? pkg.name : `ID: ${packageId}`;
  };

  const filteredTransactions = useMemo(() => {
    if (!showSearch || !searchTerm) return dateFilteredTransactions;

    return dateFilteredTransactions.filter((transaction) => {
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
  }, [dateFilteredTransactions, searchTerm, showSearch, packages]);

  const handleExportExcel = () => {
    try {
      const columns: ExcelColumn[] = [
        { key: "id", title: "Transaction ID", width: 15 },
        {
          key: "userId",
          title: "User ID",
          width: 12,
          formatter: (id) => `User #${id}`,
        },
        { key: "packageName", title: "Package Name", width: 25 },
        {
          key: "amount",
          title: "Amount",
          width: 15,
          formatter: formatCurrency,
        },
        { key: "status", title: "Status", width: 12, formatter: formatStatus },
        { key: "date", title: "Date", width: 20, formatter: formatDate },
        { key: "paymentMethod", title: "Payment Method", width: 15 },
      ];

      const exportData = finalTransactions.map((transaction) => ({
        ...transaction,
        packageName: getPackageName(transaction.packageId),
      }));

      exportToExcel({
        filename: "transactions",
        sheetName: "Transactions",
        columns,
        data: exportData,
      });

      message.success("Excel file downloaded successfully!");
    } catch (error) {
      message.error("Failed to export Excel file");
    }
  };

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

  const finalTransactions = showSearch
    ? filteredTransactions
    : dateFilteredTransactions;

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
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setParams({ search: e.target.value })}
              style={{ width: 300 }}
              allowClear
            />
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Start Date", "End Date"]}
              style={{ width: 250 }}
              allowClear
            />
            {hasDateFilter && (
              <Button
                icon={<CalendarOutlined />}
                onClick={clearDateFilter}
                type="dashed">
                Clear Date Filter
              </Button>
            )}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              disabled={finalTransactions.length === 0}>
              Export Excel
            </Button>
          </Space>
        </Space>
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

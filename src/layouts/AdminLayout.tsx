import { FC, ReactNode, useState } from "react";
import { Layout, Menu, Typography, Button, Grid, Drawer } from "antd";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  DashboardOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  MenuOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const AdminLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = Grid.useBreakpoint();

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
      style:
        location.pathname === "/admin/dashboard"
          ? { backgroundColor: "#18181a", color: "white" }
          : {},
    },
    {
      key: "/admin/customers",
      icon: <UserOutlined />,
      label: <Link to="/admin/customers">Customers</Link>,
      style:
        location.pathname === "/admin/customers"
          ? { backgroundColor: "#18181a", color: "white" }
          : {},
    },
    {
      key: "/admin/packages",
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/packages">Packages</Link>,
      style:
        location.pathname === "/admin/packages"
          ? { backgroundColor: "#18181a", color: "white" }
          : {},
    },
    {
      key: "/admin/transactions",
      icon: <SwapOutlined />,
      label: <Link to="/admin/transactions">Transactions</Link>,
      style:
        location.pathname === "/admin/transactions"
          ? { backgroundColor: "#18181a", color: "white" }
          : {},
    },
  ];

  const menuComponent = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={!screens.lg ? () => setDrawerVisible(false) : undefined}
      style={{ borderRight: 0 }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {screens.lg ? (
        <Sider theme="light" width={250}>
          <div style={{ padding: "24px 16px" }}>
            <Text type="secondary">Welcome back,</Text>
            <Title level={5} style={{ margin: 0 }}>
              {user?.name || "Admin"}
            </Title>
          </div>
          {menuComponent}
        </Sider>
      ) : (
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0 } }}>
          {menuComponent}
        </Drawer>
      )}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          {screens.lg ? (
            <div />
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              type="text"
              danger
              onClick={logout}
              icon={<LogoutOutlined />}
              style={{ fontSize: "14px" }}>
              Sign Out
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

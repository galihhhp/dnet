import { FC, ReactNode, useState } from "react";
import { Layout, Menu, Button, Badge, Drawer } from "antd";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import {
  DashboardOutlined,
  ShoppingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { CartDrawer } from "@/pages/customer/components/CartDrawer";

const { Header, Content } = Layout;

interface CustomerLayoutProps {
  children: ReactNode;
}

export const CustomerLayout: FC<CustomerLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const { cartItems } = useCart();
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: "/customer/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/customer/dashboard">Dashboard</Link>,
    },
    {
      key: "/customer/packages",
      icon: <ShoppingOutlined />,
      label: <Link to="/customer/packages">Packages</Link>,
    },
  ];

  const actionItems = [
    {
      key: "cart",
      label: (
        <Badge
          count={cartItems.length}
          onClick={() => setCartDrawerVisible(true)}>
          <Button
            type="text"
            icon={<ShoppingOutlined style={{ fontSize: "20px" }} />}
          />
        </Badge>
      ),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>D-Net</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderBottom: "none" }}
          />
          <Menu
            theme="light"
            mode="horizontal"
            selectable={false}
            items={actionItems}
            style={{ borderBottom: "none", marginLeft: "24px" }}
          />
        </div>
      </Header>
      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: "calc(100vh - 112px)",
          }}>
          {children}
        </div>
      </Content>
      <CartDrawer
        open={cartDrawerVisible}
        onClose={() => setCartDrawerVisible(false)}
      />
    </Layout>
  );
};

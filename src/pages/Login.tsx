import { FC, useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  Alert,
  Spin,
  Card,
  List,
  Tag,
} from "antd";
import { useAuth, User } from "@/hooks/useAuth";
import api from "@/utils/api";
import { ThunderboltOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LoginPage: FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const response = await api.get("/users");
        setDemoUsers(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchDemoUsers();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/users?email=${values.email}&password=${values.password}`
      );
      const user = response.data[0];
      if (user) {
        login(user);
      } else {
        setError("Invalid email or password.");
      }
    } catch (e) {
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseAccount = (user: User) => {
    form.setFieldsValue({
      email: user.email,
      password: user.password,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
      }}>
      <Card
        style={{
          width: 400,
          border: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <ThunderboltOutlined
            style={{ fontSize: 32, marginBottom: 16, color: "#18181a" }}
          />
          <Title level={2}>Login</Title>
          <Text type="secondary">Welcome back to your account</Text>
        </div>
        <Spin spinning={loading}>
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large">
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your Email!",
                  type: "email",
                },
              ]}>
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}>
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>
            </Form.Item>
          </Form>
        </Spin>
        {demoUsers.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text
              type="secondary"
              style={{ textAlign: "center", display: "block" }}>
              Or use a demo account
            </Text>
            <List
              itemLayout="horizontal"
              dataSource={demoUsers}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => handleUseAccount(user)}>
                      Use Account
                    </Button>,
                  ]}>
                  <List.Item.Meta
                    title={
                      <Tag color={user.role === "admin" ? "volcano" : "cyan"}>
                        {user.role}
                      </Tag>
                    }
                    description={user.email}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;

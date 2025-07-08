import { FC, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
  Alert,
  message,
  Input,
} from "antd";
import { useCustomerPackages } from "@/hooks/useCustomerPackages";
import { useCart } from "@/context/CartContext";
import { useUrlParams } from "@/hooks/useUrlParams";
import {
  ShoppingCartOutlined,
  CopyOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const CustomerPackages: FC = () => {
  const { packages, loading, error } = useCustomerPackages();
  const { addToCart } = useCart();
  const { getParam, setParams } = useUrlParams();

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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText("HEMAT30K");
    message.success("Discount code copied!");
  };

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

  return (
    <>
      <Title level={2} style={{ marginBottom: "16px" }}>
        Browse Packages
      </Title>
      <Alert
        message="Special Discount!"
        description={
          <span>
            Use code <strong>HEMAT30K</strong> for 10% off on purchases over Rp
            30,000!
          </span>
        }
        type="info"
        showIcon
        action={
          <Button
            size="small"
            type="text"
            icon={<CopyOutlined />}
            onClick={handleCopyToClipboard}>
            Copy Code
          </Button>
        }
        style={{ marginBottom: "24px" }}
      />

      <Input
        placeholder="Search packages by name, category, description, or duration..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setParams({ search: e.target.value })}
        style={{ marginBottom: 24, maxWidth: 500 }}
        allowClear
      />

      <Row gutter={[16, 16]}>
        {filteredPackages.map((pkg) => (
          <Col xs={24} sm={12} md={8} lg={6} key={pkg.id}>
            <Card
              hoverable
              actions={[
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => addToCart(pkg)}>
                  Add to Cart
                </Button>,
              ]}>
              <Card.Meta
                title={<Title level={4}>{pkg.name}</Title>}
                description={
                  <>
                    <Paragraph>{pkg.description}</Paragraph>
                    <Text
                      strong
                      style={{ fontSize: "1.2rem", color: "#1890ff" }}>
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </Text>
                    <br />
                    <Text type="secondary">Duration: {pkg.duration}</Text>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CustomerPackages;

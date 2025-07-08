import { FC, useState, useEffect } from "react";
import {
  Drawer,
  List,
  Button,
  Statistic,
  Input,
  Form,
  Typography,
  message,
  Empty,
  Select,
} from "antd";
import { useCart } from "@/context/CartContext";
import { useCustomerPackages } from "@/hooks/useCustomerPackages";

const { Title } = Typography;
const { Option } = Select;

const DISCOUNT_CODE = "HEMAT30K";
const MIN_PURCHASE = 30000;
const DISCOUNT_AMOUNT = 0.1;

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cartItems, removeFromCart, totalPrice, clearCart } = useCart();
  const { createTransaction } = useCustomerPackages();
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (discount > 0 && totalPrice < MIN_PURCHASE) {
      setDiscount(0);
      message.warning("Discount removed as purchase amount is below minimum.");
    }
  }, [totalPrice, discount]);

  const handleApplyDiscount = (values: { discountCode: string }) => {
    if (values.discountCode === DISCOUNT_CODE) {
      if (totalPrice >= MIN_PURCHASE) {
        setDiscount(totalPrice * DISCOUNT_AMOUNT);
        message.success("Discount applied!");
      } else {
        message.warning(
          `Minimum purchase of Rp ${MIN_PURCHASE.toLocaleString(
            "id-ID"
          )} to apply discount.`
        );
      }
    } else {
      message.error("Invalid discount code.");
    }
    form.resetFields();
  };

  const finalPrice = totalPrice - discount;

  const handleCheckout = async () => {
    if (!paymentMethod) {
      message.error("Please select a payment method.");
      return;
    }
    setIsCheckingOut(true);
    try {
      await Promise.all(
        cartItems.map((item) => createTransaction(item, paymentMethod))
      );
      message.success("Checkout successful!");
      clearCart();
      setDiscount(0);
      onClose();
    } catch (error) {
      message.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Drawer
      title={`My Cart (${cartItems.length})`}
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      footer={
        cartItems.length > 0 ? (
          <Button
            type="primary"
            block
            onClick={handleCheckout}
            loading={isCheckingOut}>
            Checkout Now (Rp {finalPrice.toLocaleString("id-ID")})
          </Button>
        ) : null
      }>
      {cartItems.length > 0 ? (
        <>
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>,
                ]}>
                <List.Item.Meta
                  title={item.name}
                  description={`Rp ${item.price.toLocaleString("id-ID")}`}
                />
              </List.Item>
            )}
          />
          <div style={{ marginTop: 24 }}>
            <Title level={5}>Summary</Title>
            <Statistic
              title="Subtotal"
              value={totalPrice}
              formatter={(val) => `Rp ${Number(val).toLocaleString("id-ID")}`}
            />
            {discount > 0 && (
              <Statistic
                title={`Discount (${(DISCOUNT_AMOUNT * 100).toFixed(0)}%)`}
                value={discount}
                formatter={(val) =>
                  `- Rp ${Number(val).toLocaleString("id-ID")}`
                }
                valueStyle={{ color: "#3f8600" }}
              />
            )}

            <Form form={form} onFinish={handleApplyDiscount} layout="inline">
              <Form.Item name="discountCode">
                <Input placeholder="Discount code" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Apply</Button>
              </Form.Item>
            </Form>
            <Form.Item
              label="Payment Method"
              required
              style={{ marginTop: "16px" }}>
              <Select
                placeholder="Select a payment method"
                onChange={(value) => setPaymentMethod(value)}
                style={{ width: "100%" }}>
                <Option value="gopay">Gopay</Option>
                <Option value="ovo">OVO</Option>
                <Option value="dana">DANA</Option>
                <Option value="bank">Bank Transfer</Option>
              </Select>
            </Form.Item>
          </div>
        </>
      ) : (
        <Empty description="Your cart is empty." />
      )}
    </Drawer>
  );
};

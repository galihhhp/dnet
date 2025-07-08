import { FC } from "react";
import { Button, Result } from "antd";
import { Link } from "react-router";

const UnauthorizedPage: FC = () => (
  <Result
    status="403"
    title="403 - Access Denied"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/login">Back to Login</Link>
      </Button>
    }
  />
);

export default UnauthorizedPage;

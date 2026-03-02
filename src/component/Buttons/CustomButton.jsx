import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CustomButton = ({
  name,
  to,
  onClick,
  className = "",
  style = {},
  type = "default",
  htmlType,
  icon, // ✅ allow icon
  danger, // ✅ allow danger styling
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <Button
      type={type}
      danger={danger} // ✅ pass danger
      icon={icon} // ✅ pass icon
      className={className}
      onClick={handleClick}
      style={style}
      htmlType={htmlType}
    >
      {name}
    </Button>
  );
};

export default CustomButton;

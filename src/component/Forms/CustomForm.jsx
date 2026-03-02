import React from "react";
import { Form, Input } from "antd";
import CustomButton from "../Buttons/CustomButton";

const CustomForm = ({ fields, formData, handleChange, handleSubmit }) => {
  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={formData}
      className="custom-form"
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label || field.placeholder}
          name={field.name}
          rules={[{ required: true, message: `Please enter ${field.name}` }]}
        >
          <Input
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={handleChange}
          />
        </Form.Item>
      ))}

      <Form.Item>
        <CustomButton name="Submit" type="primary" />
      </Form.Item>
    </Form>
  );
};

export default CustomForm;

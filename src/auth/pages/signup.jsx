import { useState } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../../firebase"; // Ensure path is correct

export default function Signup({ onLoginSuccess, onSaveUser }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ... inside handleSignupSubmit
  const handleSignupSubmit = async (values) => {
    const { name, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 1. Check Cloud directly for existing email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Email already exists! Please login instead.");
        navigate("/login");
        return;
      }

      const newUser = {
        name,
        email,
        password, // Note: In a real app, use Firebase Auth to hash passwords!
        role: "user",
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
      };

      // 2. Call the save function (this will trigger addDoc in App.jsx)
      const createdUser = await onSaveUser(newUser);

      alert("Account Created!");
      onLoginSuccess(createdUser);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Connection Error: Check your Firebase rules.");
    }
  };

  return (
    <div className="center">
      <div className="card">
        <h2>Create Account</h2>
        <Form layout="vertical" onFinish={handleSignupSubmit}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6, message: "Min 6 characters" }]}
          >
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm password" }]}
          >
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Repeat password"
            />
          </Form.Item>

          <Checkbox
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{ marginBottom: "1rem" }}
          >
            Show Password
          </Checkbox>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div
          className="auth-footer"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <p>Already have an account?</p>
          <Button type="link" onClick={() => navigate("/login")}>
            Login here
          </Button>
        </div>
      </div>
    </div>
  );
}

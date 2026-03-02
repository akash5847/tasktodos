import { useState } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import db from "../../firebase"; // Adjust path to your firebase.js

export default function Login({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ... inside your Login component
  const handleLogin = async (values) => {
    const { email, password } = values;

    // 1. Admin Check (Keep your existing logic)
    const adminCredentials = {
      "akash@gmail.com": "akash",
      "rohan@gmail.com": "rohan",
    };
    if (adminCredentials[email] === password) {
      const usersRef = collection(db, "users");
      const adminQuery = query(
        usersRef,
        where("email", "==", email),
        where("password", "==", password),
        where("role", "==", "admin"),
      );
      const adminSnapshot = await getDocs(adminQuery);

      if (adminSnapshot.empty) {
        alert("Admin account not found in Firebase users collection.");
        return;
      }

      const adminDoc = adminSnapshot.docs[0];
      const adminUser = { id: adminDoc.id, ...adminDoc.data(), isLoggedIn: true };
      await updateDoc(doc(db, "users", adminDoc.id), {
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
      });

      onLoginSuccess(adminUser);
      navigate("/dashboard");
      return;
    }

    try {
      // 2. Direct Firestore Query (The "Cloud" way)
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email),
        where("password", "==", password),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Invalid Email or Password!");
        return;
      }

      // 3. Get the user document
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };

      // 4. Update login status in Cloud
      await updateDoc(doc(db, "users", userDoc.id), {
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
      });

      alert(`Login Successful! Welcome ${userData.name}`);
      onLoginSuccess({ ...userData, isLoggedIn: true });
      navigate("/dashboard");
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Connection failed. Check your internet or Firebase config.");
    }
  };
  return (
    <div className="center">
      <div className="card">
        <h2>Login</h2>
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password
              placeholder="Password"
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: setShowPassword,
              }}
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
              Login
            </Button>
          </Form.Item>
        </Form>

        <div
          className="auth-footer"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <p>Don't have an account?</p>
          <Button type="link" onClick={() => navigate("/signup")}>
            Sign Up here
          </Button>
        </div>
      </div>
    </div>
  );
}

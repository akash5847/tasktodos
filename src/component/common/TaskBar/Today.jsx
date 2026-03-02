import React from "react";
import CustomButton from "../../Buttons/CustomButton";

function Today({ setActiveSection }) {
  return (
    <CustomButton
      name="Today"
      type="default"
      onClick={() => setActiveSection("today")}
      style={{ width: "100%", marginBottom: "0.5rem" }}
    />
  );
}

export default Today;

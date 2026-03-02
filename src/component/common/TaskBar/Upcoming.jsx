import React from "react";
import CustomButton from "../../Buttons/CustomButton";

function Upcoming({ setActiveSection }) {
  return (
    <CustomButton
      name="Upcoming"
      type="default"
      onClick={() => setActiveSection("upcoming")}
      style={{ width: "100%", marginBottom: "0.5rem" }}
    />
  );
}

export default Upcoming;

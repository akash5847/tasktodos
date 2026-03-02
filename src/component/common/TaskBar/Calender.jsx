import React from "react";
import CustomButton from "../../Buttons/CustomButton";

function Calender({ setActiveSection }) {
  return (
    <CustomButton
      name="Calendar"
      type="default"
      onClick={() => setActiveSection("calendar")}
      style={{ width: "100%", marginBottom: "0.5rem" }}
    />
  );
}

export default Calender;

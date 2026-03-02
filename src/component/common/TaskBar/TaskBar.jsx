import React from "react";
import { Divider } from "antd";
import Upcoming from "./Upcoming";
import Today from "./Today";
import Calender from "./Calender";

function TaskBar({ setActiveSection }) {
  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>TASKS</h3>
      <Upcoming setActiveSection={setActiveSection} />
      <Divider />
      <Today setActiveSection={setActiveSection} />
      <Divider />
      <Calender setActiveSection={setActiveSection} />
      <Divider />
    </div>
  );
}

export default TaskBar;

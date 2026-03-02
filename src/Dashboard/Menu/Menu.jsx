import React, { useMemo } from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  PushpinOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import moment from "moment";
import Tags from "../../component/common/TagsBar/Tags";

function Menu({
  tasks,
  onLogout,
  setActiveSection,
  activeSection,
  tags,
  setTags,
  onRenameTag,
  onDeleteTag,
  canViewSettings,
}) {
  const todayCount = useMemo(
    () =>
      tasks.filter((task) =>
        moment(task.time, "YYYY-MM-DD HH:mm").isSame(moment(), "day"),
      ).length,
    [tasks],
  );
  const upcomingCount = useMemo(
    () =>
      tasks.filter((task) =>
        moment(task.time, "YYYY-MM-DD HH:mm").isSameOrAfter(
          moment().startOf("day"),
          "day",
        ),
      ).length,
    [tasks],
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2 className="sidebar-title">Menu</h2>
        <MenuOutlined className="sidebar-head-icon" />
      </div>

      <div className="sidebar-search">
        <Input
          bordered={false}
          placeholder="Search"
          prefix={<SearchOutlined />}
          className="sidebar-search-input"
        />
      </div>

      <section className="menu-group">
        <h4 className="menu-group-title">TASKS</h4>
        <button
          className={`menu-row${activeSection === "upcoming" ? " is-active" : ""}`}
          onClick={() => setActiveSection("upcoming")}
        >
          <span className="menu-row-left">Upcoming</span>
          <span className="menu-row-count">{upcomingCount}</span>
        </button>
        <button
          className={`menu-row${activeSection === "today" ? " is-active" : ""}`}
          onClick={() => setActiveSection("today")}
        >
          <span className="menu-row-left">Today</span>
          <span className="menu-row-count">{todayCount}</span>
        </button>
        <button
          className={`menu-row${activeSection === "calendar" ? " is-active" : ""}`}
          onClick={() => setActiveSection("calendar")}
        >
          <span className="menu-row-left">
            <CalendarOutlined />
            Calendar
          </span>
        </button>
        <button
          className={`menu-row${activeSection === "stickywall" ? " is-active" : ""}`}
          onClick={() => setActiveSection("stickywall")}
        >
          <span className="menu-row-left">
            <PushpinOutlined />
            Sticky Wall
          </span>
        </button>
      </section>

      <section className="menu-group">
        <h4 className="menu-group-title">TAGS</h4>
        <Tags
          tags={tags}
          setTags={setTags}
          onRenameTag={onRenameTag}
          onDeleteTag={onDeleteTag}
          selectedTag={activeSection?.name || null}
          setActiveSection={setActiveSection}
          showTitle={false}
        />
      </section>

      <div className="sidebar-footer">
        {canViewSettings && (
          <button
            className="menu-footer-btn"
            onClick={() => setActiveSection("settings")}
          >
            <SettingOutlined />
            Settings
          </button>
        )}
        <button className="menu-footer-btn" onClick={onLogout}>
          <LogoutOutlined />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Menu;

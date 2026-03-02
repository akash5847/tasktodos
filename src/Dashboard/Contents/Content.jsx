import React, { useEffect, useMemo, useState } from "react";
import { Card, Divider, Button, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import TodayTasks from "../../component/common/TaskBar/Todaytask/TodayTasks";
import UpcomingTasks from "../../component/common/TaskBar/Upcomingtask/UpcomingTask";
import CalendarView from "../../component/common/TaskBar/CalendarView";
import Setting from "../../component/layout/Footer/Setting";
import TagsTasks from "../../component/common/TagsBar/TagsTasks";
import CreateTaskModal from "../../component/modals/CreateTaskModal";

const taskHasTag = (task, tagName) =>
  Array.isArray(task.tags)
    ? task.tags.includes(tagName)
    : typeof task.tag === "string"
      ? task.tag === tagName
      : false;

function Content({
  activeSection,
  tasks,
  handleSaveTask, // <--- Add this
  handleUpdateTask, // (This now points to handleSaveTask in App.jsx)
  handleDeleteTask,
  tags,
  setTags,
  handleRenameTag,
  handleDeleteTag,
  selectedTask,
  setSelectedTask,
  canViewSettings,
}) {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const activeTag =
    activeSection && typeof activeSection === "object" && activeSection.name
      ? activeSection
      : null;
  const isCalendarView = activeSection === "calendar";

  const todayCount = useMemo(() => {
    return tasks.filter((t) =>
      moment(t.time, "YYYY-MM-DD HH:mm").isSame(moment(), "day"),
    ).length;
  }, [tasks]);

  const upcomingCount = useMemo(() => {
    const today = moment().startOf("day");
    return tasks.filter((t) => moment(t.time).isSameOrAfter(today, "day"))
      .length;
  }, [tasks]);

  const tagCount = useMemo(() => {
    if (!activeTag) return 0;
    return tasks.filter((t) => taskHasTag(t, activeTag.name)).length;
  }, [tasks, activeTag]);

  const visibleTaskIds = useMemo(() => {
    if (activeSection === "today") {
      return new Set(
        tasks
          .filter((t) =>
            moment(t.time, "YYYY-MM-DD HH:mm").isSame(moment(), "day"),
          )
          .map((t) => t.id),
      );
    }

    if (activeSection === "upcoming") {
      const today = moment().startOf("day");
      return new Set(
        tasks
          .filter((t) => moment(t.time).isSameOrAfter(today, "day"))
          .map((t) => t.id),
      );
    }

    if (activeTag) {
      return new Set(
        tasks.filter((t) => taskHasTag(t, activeTag.name)).map((t) => t.id),
      );
    }

    return new Set(tasks.map((t) => t.id));
  }, [activeSection, activeTag, tasks]);

  useEffect(() => {
    if (!selectedTask?.id) return;
    if (!visibleTaskIds.has(selectedTask.id)) {
      setSelectedTask(null);
    }
  }, [selectedTask, setSelectedTask, visibleTaskIds]);

  useEffect(() => {
    if (!selectedTask?.id) return;
    const latestTask = tasks.find((task) => task.id === selectedTask.id);
    if (!latestTask) return;
    setSelectedTask(latestTask);
  }, [tasks, selectedTask?.id, setSelectedTask]);

  const sectionTitle =
    activeSection === "today"
      ? "Today"
      : activeSection === "upcoming"
        ? "Upcoming"
        : activeSection === "calendar"
          ? "Calendar"
          : activeSection === "stickywall"
            ? "Sticky Wall"
            : activeSection === "settings"
              ? canViewSettings
                ? "Settings"
                : "Tasks"
              : activeTag
                ? activeTag.name
                : "Tasks";

  const sectionCount =
    activeSection === "today"
      ? todayCount
      : activeSection === "upcoming"
        ? upcomingCount
        : activeTag
          ? tagCount
          : null;

  const handleDeleteSelected = async () => {
    if (!selectedTask) return;
    await handleDeleteTask(selectedTask.id); // Cloud Delete
    setSelectedTask(null);
  };

  const handleSaveSelected = async (taskData) => {
    const existingTask = tasks.find((task) => task.id === taskData.id);
    await handleUpdateTask({
      id: taskData.id,
      subject: taskData.subject,
      task: taskData.task,
      tags: taskData.tags,
      dueDate: taskData.dueDate,
      completed: existingTask?.completed ?? existingTask?.done ?? false,
      done: existingTask?.done ?? existingTask?.completed ?? false,
      bookmarked: existingTask?.bookmarked ?? false,
    });

    setSelectedTask((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        subject: taskData.subject,
        text: taskData.task,
        tags: taskData.tags,
        time: taskData.dueDate || prev.time,
      };
    });
  };

  const handleAddTask = async (taskData) => {
    await handleSaveTask(taskData);
    setIsAddModalVisible(false);
  };
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsDetailModalVisible(true);
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const currentCompleted = task.completed ?? task.done ?? false;
    await handleUpdateTask({
      ...task,
      id: task.id,
      subject: task.subject,
      task: task.text,
      tags: Array.isArray(task.tags)
        ? task.tags
        : task.tag
          ? [task.tag]
          : [],
      dueDate: task.time,
      completed: !currentCompleted,
      done: !currentCompleted,
    });
  };

  const handleToggleBookmark = async (taskId, forceValue) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const nextBookmarked =
      typeof forceValue === "boolean" ? forceValue : !(task.bookmarked ?? false);
    await handleUpdateTask({
      ...task,
      id: task.id,
      subject: task.subject,
      task: task.text,
      tags: Array.isArray(task.tags)
        ? task.tags
        : task.tag
          ? [task.tag]
          : [],
      dueDate: task.time,
      completed: task.completed ?? task.done ?? false,
      done: task.done ?? task.completed ?? false,
      bookmarked: nextBookmarked,
    });
  };

  return (
    <div className="content-shell">
      <Card variant="borderless" className="dashboard-surface">
        <div className={`dashboard-grid${isCalendarView ? " is-calendar" : ""}`}>
          <section className="task-pane">
            <div className="task-pane-header">
              <div className="task-pane-title">
                <h2>{sectionTitle}</h2>
                {sectionCount !== null && (
                  <span className="task-count">{sectionCount}</span>
                )}
              </div>
            </div>

            <Divider className="soft-divider" />

            <div className="task-pane-body">
              {activeSection === "today" && (
                <TodayTasks
                  tasks={tasks}
                  selectedTaskId={selectedTask?.id}
                  setSelectedTask={setSelectedTask}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === "upcoming" && (
                <UpcomingTasks
                  tasks={tasks}
                  selectedTaskId={selectedTask?.id}
                  setSelectedTask={setSelectedTask}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === "calendar" && (
                <CalendarView
                  tasks={tasks}
                  handleUpdateTask={handleUpdateTask}
                  handleDeleteTask={handleDeleteTask}
                  tags={tags}
                  setTags={setTags}
                  onRenameTag={handleRenameTag}
                  onDeleteTag={handleDeleteTag}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}

              {activeSection === "settings" && canViewSettings && <Setting />}

              {activeTag && (
                <TagsTasks
                  tag={activeTag}
                  tasks={tasks}
                  selectedTaskId={selectedTask?.id}
                  setSelectedTask={setSelectedTask}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}
            </div>

            {!isCalendarView && activeSection !== "settings" && (
              <div className="task-pane-footer">
                <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
                  +Add New Task
                </Button>
              </div>
            )}
          </section>

          {!isCalendarView && (
            <aside className="detail-pane">
              <div className="detail-pane-header">
                <h3>Task:</h3>
              </div>
              {selectedTask ? (
                <div className="detail-content">
                  <h4 className="detail-subject">{selectedTask.subject}</h4>
                  <p className="detail-field-label">Description</p>
                  <p className="detail-text">{selectedTask.text || "No description"}</p>

                  <div className="detail-row">
                    <span className="detail-label">Due date</span>
                    <span className="detail-value">
                      {selectedTask.time || "Not set"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tags</span>
                    <span className="detail-value detail-tag-row">
                      {(Array.isArray(selectedTask.tags)
                        ? selectedTask.tags
                        : selectedTask.tag
                          ? [selectedTask.tag]
                          : []
                      ).map((tagName) => (
                        <Tag key={tagName} color="cyan" className="detail-tag">
                          {tagName}
                        </Tag>
                      ))}
                    </span>
                  </div>

                  <div className="detail-actions">
                    <Button
                      className="btn-delete-task"
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteSelected}
                    >
                      Delete Task
                    </Button>
                    <Button
                      className="btn-save-task"
                      icon={<EditOutlined />}
                      onClick={() => setIsDetailModalVisible(true)}
                    >
                      Edit Task
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="detail-empty">
                  <p>Select a task from the middle panel.</p>
                </div>
              )}
            </aside>
          )}
        </div>
      </Card>

      <CreateTaskModal
        isModalVisible={isDetailModalVisible}
        setIsModalVisible={setIsDetailModalVisible}
        onSave={handleSaveSelected} // Now uses cloud
        initialValues={selectedTask}
        tags={tags}
        setTags={setTags}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTag}
      />

      <CreateTaskModal
        isModalVisible={isAddModalVisible}
        setIsModalVisible={setIsAddModalVisible}
        onSave={handleAddTask}
        initialValues={null}
        tags={tags}
        setTags={setTags}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}

export default Content;

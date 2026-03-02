import React, { useMemo, useState } from "react";
import { Calendar, Card, Modal, Button } from "antd";
import { DeleteOutlined, StarFilled } from "@ant-design/icons";
import moment from "moment";
import CommonList from "../../Listing/CommonList";
import CreateTaskModal from "../../modals/CreateTaskModal";

function CalendarView({
  tasks,
  handleUpdateTask,
  handleDeleteTask,
  tags,
  setTags,
  onRenameTag,
  onDeleteTag,
  onToggleBookmark,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRangeType, setSelectedRangeType] = useState("day");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [checkedTaskIds, setCheckedTaskIds] = useState([]);

  const getTasksForDate = (date) => {
    return tasks.filter(
      (task) =>
        moment(task.time, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD"),
    );
  };

  const getTasksForMonth = (date) => {
    return tasks.filter((task) =>
      moment(task.time, "YYYY-MM-DD HH:mm").isSame(date, "month"),
    );
  };

  const handleSelect = (value, info) => {
    setSelectedDate(value.clone());
    setSelectedRangeType(info?.source === "month" ? "month" : "day");
    setCheckedTaskIds([]);
    setIsModalOpen(true);
  };

  const selectedDateTasks = !selectedDate
    ? []
    : selectedRangeType === "month"
      ? getTasksForMonth(selectedDate)
      : getTasksForDate(selectedDate);
  const checkedCount = checkedTaskIds.length;
  const checkedTaskIdSet = useMemo(() => new Set(checkedTaskIds), [checkedTaskIds]);

  const handleToggleCalendarCheck = (taskId) => {
    setCheckedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleBulkCalendarDelete = async () => {
    await Promise.all(checkedTaskIds.map((taskId) => handleDeleteTask(taskId)));
    setCheckedTaskIds([]);
  };

  const handleBulkCalendarBookmark = async () => {
    const checkedTasks = selectedDateTasks.filter((task) =>
      checkedTaskIdSet.has(task.id),
    );
    const shouldUnbookmark = checkedTasks.every((task) => task.bookmarked);
    const nextBookmarkedValue = !shouldUnbookmark;
    await Promise.all(
      checkedTaskIds.map((taskId) =>
        onToggleBookmark(taskId, nextBookmarkedValue),
      ),
    );
  };

  const cellRender = (current, info) => {
    if (info.type !== "date") {
      return info.originNode;
    }

    const dayTasks = getTasksForDate(current);
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {dayTasks.slice(0, 2).map((task) => (
          <li key={task.id}>
            <CommonList task={task} CalendarView={true} onEdit={() => {}} />
          </li>
        ))}
        {dayTasks.length > 2 && (
          <li style={{ fontSize: "10px", color: "#1890ff" }}>
            + {dayTasks.length - 2} more
          </li>
        )}
      </ul>
    );
  };

  const handleCalendarWheel = (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.closest(".ant-select-selector") || target.closest(".ant-picker-input"))
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Card variant="borderless">
        <h2>Task Calendar</h2>
        <div onWheelCapture={handleCalendarWheel}>
          <Calendar cellRender={cellRender} onSelect={handleSelect} />
        </div>
      </Card>

      <Modal
        title={`Tasks for ${
          selectedDate
            ? selectedRangeType === "month"
              ? selectedDate.format("MMMM YYYY")
              : selectedDate.format("MMMM Do, YYYY")
            : ""
        }`}
        open={isModalOpen}
        onCancel={() => {
          setCheckedTaskIds([]);
          setIsModalOpen(false);
        }}
        footer={null}
        width={600}
      >
        {selectedDateTasks.length > 0 ? (
          <div style={{ border: "1px solid #f0f0f0", borderRadius: "8px" }}>
            {checkedCount > 1 && (
              <div className="task-bulk-actions">
                <Button icon={<DeleteOutlined />} onClick={handleBulkCalendarDelete}>
                  Del
                </Button>
                <Button icon={<StarFilled />} onClick={handleBulkCalendarBookmark}>
                  {selectedDateTasks
                    .filter((task) => checkedTaskIdSet.has(task.id))
                    .every((task) => task.bookmarked)
                    ? "Unbookmark"
                    : "Bookmark"}
                </Button>
              </div>
            )}
            {selectedDateTasks.map((item) => {
              return (
                <CommonList
                  key={item.id}
                  task={item}
                  onToggle={handleToggleCalendarCheck}
                  taskChecked={checkedTaskIdSet.has(item.id)}
                  onDelete={handleDeleteTask}
                  onToggleBookmark={onToggleBookmark}
                  showDeleteAction={checkedCount <= 1}
                  onEdit={
                    checkedTaskIdSet.has(item.id)
                      ? (task) => {
                          setEditingTask(task);
                          setIsEditModalVisible(true);
                        }
                      : undefined
                  }
                  showEditAction={checkedCount <= 1}
                />
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>No tasks for this day.</p>
        )}
      </Modal>

      <CreateTaskModal
        isModalVisible={isEditModalVisible}
        setIsModalVisible={setIsEditModalVisible}
        onSave={(values) => {
          handleUpdateTask({
            id: editingTask.id,
            subject: values.subject,
            task: values.task,
            tags: values.tags,
            dueDate: values.dueDate,
            completed: editingTask.completed ?? editingTask.done ?? false,
            done: editingTask.done ?? editingTask.completed ?? false,
            bookmarked: editingTask.bookmarked ?? false,
          });
          setIsEditModalVisible(false);
        }}
        initialValues={editingTask}
        tags={tags}
        setTags={setTags}
        onRenameTag={onRenameTag}
        onDeleteTag={onDeleteTag}
      />
    </div>
  );
}

export default CalendarView;

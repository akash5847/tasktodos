import React, { useMemo } from "react";
import { Button } from "antd";
import { DeleteOutlined, StarFilled } from "@ant-design/icons";
import moment from "moment";
import CommonList from "../../../Listing/CommonList";

function UpcomingTasks({
  tasks,
  selectedTaskId,
  setSelectedTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onToggleBookmark,
}) {
  const filteredTasks = useMemo(() => {
    const today = moment().startOf("day");
    return tasks.filter((task) =>
      moment(task.time).isSameOrAfter(today, "day"),
    );
  }, [tasks]);

  const checkedTasks = useMemo(
    () => filteredTasks.filter((task) => task.completed ?? task.done ?? false),
    [filteredTasks],
  );
  const checkedTaskIds = checkedTasks.map((task) => task.id);
  const isBulkMode = checkedTaskIds.length > 1;

  const handleBulkDelete = async () => {
    await Promise.all(checkedTaskIds.map((taskId) => onDeleteTask(taskId)));
  };

  const handleBulkBookmark = async () => {
    const shouldUnbookmark = checkedTasks.every((task) => task.bookmarked);
    const nextBookmarkedValue = !shouldUnbookmark;
    await Promise.all(
      checkedTaskIds.map((taskId) =>
        onToggleBookmark(taskId, nextBookmarkedValue),
      ),
    );
  };

  return (
    <div className="task-list">
      {isBulkMode && (
        <div className="task-bulk-actions">
          <Button icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            Del
          </Button>
          <Button icon={<StarFilled />} onClick={handleBulkBookmark}>
            {checkedTasks.every((task) => task.bookmarked)
              ? "Unbookmark"
              : "Bookmark"}
          </Button>
        </div>
      )}
      <div className="task-rows">
        {filteredTasks.map((task) => (
          <CommonList
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleBookmark={onToggleBookmark}
            onSelect={setSelectedTask}
            isSelected={selectedTaskId === task.id}
            taskChecked={task.completed ?? task.done ?? false}
            showEditAction={!isBulkMode}
            showDeleteAction={!isBulkMode}
          />
        ))}
      </div>
    </div>
  );
}

export default UpcomingTasks;

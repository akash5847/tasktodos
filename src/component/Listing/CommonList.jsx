import React from "react";
import { Checkbox, Tag, Badge } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  RightOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

const CommonList = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
  CalendarView,
  taskChecked,
  onToggleBookmark,
  showEditAction = true,
  showDeleteAction = true,
}) => {
  if (!task) return null;
  const taskTags = Array.isArray(task.tags)
    ? task.tags.filter(Boolean)
    : task.tag
      ? [task.tag]
      : [];
  const isCompleted = task.completed ?? task.done ?? false;
  const isChecked = typeof taskChecked === "boolean" ? taskChecked : isCompleted;
  const isBookmarked = Boolean(task.bookmarked);

  if (CalendarView) {
    return (
      <div
        onClick={() => onEdit(task)}
        style={{ cursor: "pointer", marginBottom: "2px" }}
      >
        <Badge
          status={isCompleted ? "success" : "processing"}
          text={task.subject}
          title={`${task.subject}: ${task.text}`}
        />
      </div>
    );
  }

  const handleRowClick = () => {
    if (onSelect) {
      onSelect(task);
    }
    if (onToggle) {
      onToggle(task.id);
    }
  };

  return (
    <div
      className={`task-item${isSelected ? " is-selected" : ""}`}
      onClick={handleRowClick}
    >
      <div className="task-item-main">
        {onToggle ? (
          <Checkbox
            checked={isChecked}
            onChange={() => onToggle(task.id)}
            className="task-item-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        {!onToggle ? <span className="task-item-checkbox ghost" /> : null}

        <div className="task-item-copy">
          <div className="task-item-topline">
            <p className={`task-item-subject${isCompleted ? " is-completed" : ""}`}>
              {task.subject}
            </p>
          </div>
          {(task.time || taskTags.length > 0) && (
            <div className="task-item-meta">
              {task.time && <span>{task.time}</span>}
              {taskTags.map((tagName) => (
                <Tag key={`${task.id}-${tagName}`} className="task-item-tag">
                  {tagName}
                </Tag>
              ))}
            </div>
          )}

          {task.text ? <p className="task-item-text">{task.text}</p> : null}
        </div>
        {onToggleBookmark ? (
          <button
            type="button"
            className="task-item-icon-btn task-item-bookmark-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(task.id, !isBookmarked);
            }}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <StarFilled className="task-item-action star is-filled" />
            ) : (
              <StarOutlined className="task-item-action star" />
            )}
          </button>
        ) : null}
      </div>

      {!onEdit && !onDelete ? <RightOutlined className="task-item-chevron" /> : null}
      {onEdit && isChecked && showEditAction ? (
        <button
          type="button"
          className="task-item-icon-btn task-item-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <EditOutlined className="task-item-action task-item-action-edit" />
        </button>
      ) : null}
      {onDelete && isChecked && showDeleteAction ? (
        <button
          type="button"
          className="task-item-icon-btn task-item-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <DeleteOutlined className="task-item-action task-item-action-delete danger" />
        </button>
      ) : null}
    </div>
  );
};

export default CommonList;

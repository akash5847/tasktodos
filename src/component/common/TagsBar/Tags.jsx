import React, { useState } from "react";
import { Tag, Input, Button, Space } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

function Tags({
  tags = [],
  setTags,
  setActiveSection,
  selectedTag,
  onTagSelect,
  onRenameTag,
  onDeleteTag,
  showTitle = true,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editValue, setEditValue] = useState("");

  // Helper to prevent the Modal from closing when interacting with Tags
  const handleAction = (e, callback) => {
    if (e) {
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      // if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
      // e.preventDefault();
      // e.stopPropagation();
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    if (callback) callback();
  };

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) return;

    const newTag = { id: Date.now(), name };
    setTags((prevTags) => [...prevTags, newTag]);
    setNewTagName("");
    setIsAdding(false);
  };

  const handleEditTag = (id, providedOldName) => {
    const nextName = editValue.trim();
    if (!nextName) return;
    const oldName =
      providedOldName || editingTagName || tags.find((tag) => tag.id === id)?.name;
    if (!oldName) return;
    const isDuplicateName = tags.some(
      (tag) =>
        tag.id !== id && tag.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (isDuplicateName) return;

    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.id === id ? { ...tag, name: nextName } : tag,
      ),
    );
    if (typeof onRenameTag === "function" && oldName !== nextName) {
      onRenameTag(oldName, nextName);
    }
    setEditingTagId(null);
    setEditingTagName("");
    setEditValue("");
  };

  const handleDeleteTag = (tag) => {
    if (!tag?.name) return;
    if (typeof onDeleteTag === "function") {
      onDeleteTag(tag.name);
      return;
    }
    setTags((prevTags) => prevTags.filter((t) => t.id !== tag.id));
  };

  return (
    <div
      style={{ padding: "0.5rem" }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {showTitle ? <h4 style={{ marginBottom: "12px" }}>Tags</h4> : null}

      {tags.map((tag) => (
        <div key={tag.id} style={{ marginBottom: "0.5rem" }}>
          {editingTagId === tag.id ? (
            <Space>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                size="small"
                onPressEnter={(e) =>
                  handleAction(e, () => handleEditTag(tag.id, tag.name))
                }
              />
              <Button
                htmlType="button"
                size="small"
                onClick={(e) => handleAction(e, () => handleEditTag(tag.id, tag.name))}
              >
                Save
              </Button>
              <Button
                htmlType="button"
                size="small"
                onClick={(e) =>
                  handleAction(e, () => {
                    setEditingTagId(null);
                    setEditingTagName("");
                    setEditValue("");
                  })
                }
              >
                Cancel
              </Button>
            </Space>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Tag
                color={
                  Array.isArray(selectedTag)
                    ? selectedTag.includes(tag.name)
                      ? "blue"
                      : "default"
                    : selectedTag === tag.name
                      ? "blue"
                      : "default"
                }
                closable
                onClose={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteTag(tag);
                }}
                onClick={(e) =>
                  handleAction(e, () => {
                    if (onTagSelect) {
                      onTagSelect(tag);
                      return;
                    }
                    if (setActiveSection) {
                      setActiveSection(tag);
                    }
                  })
                }
                style={{ cursor: "pointer", padding: "4px 8px" }}
              >
                {tag.name}
              </Tag>

              <Button
                type="text"
                htmlType="button"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) =>
                  handleAction(e, () => {
                    setEditValue(tag.name);
                    setEditingTagId(tag.id);
                    setEditingTagName(tag.name);
                  })
                }
              />
            </div>
          )}
        </div>
      ))}

      {!isAdding ? (
        <Button
          htmlType="button"
          className="ant-btn-dashed" // You can use className or keep type="dashed" with htmlType
          style={{ width: "100%", borderStyle: "dashed" }}
          icon={<PlusOutlined />}
          onClick={(e) => handleAction(e, () => setIsAdding(true))}
        >
          Add Tag
        </Button>
      ) : (
        <div style={{ marginTop: "10px" }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onPressEnter={(e) => {
                e.preventDefault(); // 🛡️ STOP the Enter key from submitting the Task Modal
                e.stopPropagation(); // 🛡️ STOP the event from reaching the Form
                handleAddTag();
              }}
            />
            <Button
              htmlType="button" // 🛡️ This prevents the form from submitting!
              onClick={(e) => handleAction(e, handleAddTag)}
            >
              Add
            </Button>
            <Button
              htmlType="button"
              onClick={(e) => handleAction(e, () => setIsAdding(false))}
            >
              X
            </Button>
          </Space.Compact>
        </div>
      )}
    </div>
  );
}

export default Tags;

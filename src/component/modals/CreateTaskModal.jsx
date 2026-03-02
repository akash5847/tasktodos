import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Divider,
  Tag,
  Segmented,
  Select,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Tags from "../common/TagsBar/Tags";

dayjs.extend(customParseFormat);

const CreateTaskModal = ({
  isModalVisible,
  setIsModalVisible,
  onSave,
  initialValues,
  tags,
  setTags,
  onRenameTag,
  onDeleteTag,
}) => {
  const [form] = Form.useForm();
  const [timeMode, setTimeMode] = useState("24h");
  const initializedKeyRef = useRef(null);

  const watchedTags = Form.useWatch("tags", form);
  const selectedTagNames = useMemo(
    () => (Array.isArray(watchedTags) ? watchedTags : []),
    [watchedTags],
  );

  const parseDueDate = (value) => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    if (value instanceof Date) return dayjs(value);
    if (typeof value === "number") return dayjs(value);
    if (typeof value?.toDate === "function") return dayjs(value.toDate());
    if (typeof value === "object" && typeof value.seconds === "number") {
      const millis = Math.floor((value.nanoseconds || 0) / 1e6);
      return dayjs.unix(value.seconds).millisecond(millis);
    }

    const parsed = dayjs(value, [
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD hh:mm A",
      "YYYY-MM-DD hh:mm:ss A",
      "YYYY-MM-DDTHH:mm:ss.SSSZ",
      "YYYY-MM-DDTHH:mm:ssZ",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DDTHH:mm",
    ], true);
    if (parsed.isValid()) return parsed;

    const fallback = dayjs(value);
    return fallback.isValid() ? fallback : null;
  };

  // Load Data & Clear Validation Jitter
  useEffect(() => {
    if (!isModalVisible) {
      initializedKeyRef.current = null;
      return;
    }

    const initKey = initialValues?.id ?? "__new__";
    if (initializedKeyRef.current === initKey) return;

    if (initialValues) {
      const dateValue = parseDueDate(initialValues.dueDate || initialValues.time);

      form.setFieldsValue({
        subject: initialValues.subject,
        task: initialValues.text ?? initialValues.task ?? "",
        tags: Array.isArray(initialValues.tags) ? initialValues.tags : [],
        dueDate: dateValue && dateValue.isValid() ? dateValue : null,
      });
    } else {
      form.resetFields();
    }

    initializedKeyRef.current = initKey;
  }, [isModalVisible, initialValues?.id, form]);

  const handleSubmit = async (values) => {
    const normalizedTags = Array.isArray(values.tags) ? values.tags : [];
    await onSave({
      ...values,
      id: initialValues?.id || Date.now(),
      tags: normalizedTags,
      dueDate: values.dueDate
        ? values.dueDate.format("YYYY-MM-DD HH:mm")
        : null,
    });
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={initialValues ? "Edit Task" : "Add New Task"}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={600}
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
        // This ensures the red error disappears as soon as you pick a date
        onValuesChange={(changedValues) => {
          if (changedValues.dueDate) {
            form.validateFields(["dueDate"]);
          }
        }}
      >
        <Form.Item label="Subject" name="subject" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Task" name="task" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item name="tags" hidden>
          <Select mode="multiple" options={[]} />
        </Form.Item>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div>
            <Form.Item
              label="Due Date & Time"
              name="dueDate"
              rules={[
                { required: true, message: "Due date and time is required." },
              ]}
            >
              <DatePicker
                showTime={{
                  format: timeMode === "12h" ? "hh:mm A" : "HH:mm",
                  use12Hours: timeMode === "12h",
                  changeOnScroll: false,
                  showNow: false,
                  needConfirm: false,
                }}
                format={
                  timeMode === "12h" ? "YYYY-MM-DD hh:mm A" : "YYYY-MM-DD HH:mm"
                }
                inputReadOnly
                style={{ width: "100%" }}
                onWheel={(e) => e.target.blur()}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            <div style={{ marginTop: "2px" }}>
              <div style={{ marginBottom: "8px", fontWeight: 500 }}>
                Time format
              </div>
              <Segmented
                value={timeMode}
                onChange={setTimeMode}
                options={["24h", "12h"]}
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "8px", fontWeight: 500 }}>Tags</div>
            <div style={{ marginBottom: "10px" }}>
              {selectedTagNames.length > 0 ? (
                selectedTagNames.map((tagName) => (
                  <Tag
                    key={tagName}
                    color="blue"
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      const updated = selectedTagNames.filter(
                        (name) => name !== tagName,
                      );
                      form.setFieldsValue({ tags: updated });
                    }}
                  >
                    {tagName}
                  </Tag>
                ))
              ) : (
                <span>None</span>
              )}
            </div>
            <Tags
              tags={tags}
              setTags={setTags}
              onDeleteTag={(tagName) => {
                if (typeof onDeleteTag === "function") {
                  onDeleteTag(tagName);
                } else {
                  setTags((prevTags) =>
                    prevTags.filter((tag) => tag.name !== tagName),
                  );
                }

                const currentTags = form.getFieldValue("tags") || [];
                if (!Array.isArray(currentTags) || !currentTags.includes(tagName)) {
                  return;
                }
                const updated = currentTags.filter((name) => name !== tagName);
                form.setFieldsValue({ tags: updated });
              }}
              onRenameTag={(oldName, newName) => {
                if (typeof onRenameTag === "function") {
                  onRenameTag(oldName, newName);
                }
                const currentTags = form.getFieldValue("tags") || [];
                if (!Array.isArray(currentTags) || !currentTags.includes(oldName)) {
                  return;
                }
                const renamed = currentTags.map((name) =>
                  name === oldName ? newName : name,
                );
                form.setFieldsValue({ tags: [...new Set(renamed)] });
              }}
              selectedTag={selectedTagNames}
              onTagSelect={(tag) => {
                const currentTags = form.getFieldValue("tags") || [];
                if (!currentTags.includes(tag.name)) {
                  const newTags = [...currentTags, tag.name];
                  form.setFieldsValue({ tags: newTags });
                }
              }}
            />
          </div>
        </div>

        <Divider />
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={() => setIsModalVisible(false)}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save Task
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;

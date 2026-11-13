"use client";

import { Button, Card, Form, Input, Select, Space } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

// Flexible content sections (Ingredients, Brewing, Packaging, anything).
// Edited as plain text in the form (one item or paragraph per line);
// product-form.tsx converts to/from the string[] the database stores.

export type SectionType = "text" | "list" | "steps";

export type SectionDraft = {
  title: string;
  type: SectionType;
  text: string; // one item or paragraph per line
};

// Titles and types only, so every tea product is laid out the same way.
const TEA_PRESET: SectionDraft[] = [
  { title: "Ingredients", type: "list", text: "" },
  { title: "Net Weight", type: "text", text: "" },
  { title: "What's Inside", type: "text", text: "" },
  { title: "Brewing Instructions", type: "steps", text: "" },
  { title: "Packaging", type: "text", text: "" },
];

const TYPE_OPTIONS = [
  { value: "text", label: "Paragraph" },
  { value: "list", label: "Bullet list" },
  { value: "steps", label: "Numbered steps" },
];

export function ProductSectionsEditor() {
  const form = Form.useFormInstance();

  return (
    <Form.List name="sections">
      {(fields, { add, remove, move }) => {
        function addTeaTemplate() {
          const existing: SectionDraft[] = form.getFieldValue("sections") ?? [];
          const have = new Set(
            existing.map((s) => s.title.trim().toLowerCase()),
          );
          TEA_PRESET.filter((p) => !have.has(p.title.toLowerCase())).forEach(
            (p) => add(p),
          );
        }

        return (
          <>
            {fields.map((field, index) => (
              <Card
                key={field.key}
                size="small"
                className="mb-3"
                extra={
                  <Space size={0}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      aria-label="Move section up"
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === fields.length - 1}
                      aria-label="Move section down"
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label="Remove section"
                      onClick={() => remove(field.name)}
                    />
                  </Space>
                }
              >
                <Space align="start" wrap className="w-full">
                  <Form.Item
                    name={[field.name, "title"]}
                    label="Title"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter a title",
                      },
                      { max: 60, message: "Max 60 characters" },
                    ]}
                  >
                    <Input
                      style={{ width: 240 }}
                      placeholder="e.g. Ingredients"
                    />
                  </Form.Item>

                  <Form.Item name={[field.name, "type"]} label="Shown as">
                    <Select style={{ width: 170 }} options={TYPE_OPTIONS} />
                  </Form.Item>
                </Space>

                <Form.Item
                  name={[field.name, "text"]}
                  label="Content (one item or paragraph per line)"
                  className="!mb-0"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Add some content",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Card>
            ))}

            <Space wrap>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ title: "", type: "text", text: "" })}
              >
                Add section
              </Button>
              <Button onClick={addTeaTemplate}>Add tea template</Button>
            </Space>
          </>
        );
      }}
    </Form.List>
  );
}
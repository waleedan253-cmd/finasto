"use client";

import {
  AutoComplete,
  Button,
  Input,
  InputNumber,
  Select,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// Repeatable variant rows (e.g. "100g", "250g") for the product form,
// shown as one compact editable table: one row per variant, every field
// editable in place. Purely a controlled array editor. The parent form
// (product-form.tsx) owns the array and diffs it against the loaded data
// to build ProductInput.deletedVariantIds on submit.

export type VariantDraft = {
  id?: string; // present = existing row from the database
  name: string;
  sku: string;
  price: string; // kept as string while editing; parsed to number on submit
  salePrice: string; // "" = no sale price (edited in the offer drawer)
  saleStartsAt: string; // ISO date string, "" = none
  saleEndsAt: string; // ISO date string, "" = none
  stock: string;
  weight: string; // "" = no weight set
  status: "active" | "disabled" | "draft";
};

export function emptyVariant(): VariantDraft {
  return {
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    saleStartsAt: "",
    saleEndsAt: "",
    stock: "0",
    weight: "",
    status: "active",
  };
}

type FieldErrors = Partial<Record<keyof VariantDraft, string>>;

type Row = VariantDraft & { _index: number };

export function VariantRepeater({
  value,
  onChange,
  errors,
  sizeSuggestions = [],
}: {
  value: VariantDraft[];
  onChange: (next: VariantDraft[]) => void;
  errors?: Record<number, FieldErrors>;
  sizeSuggestions?: string[];
}) {
  function update(index: number, patch: Partial<VariantDraft>) {
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...value, emptyVariant()]);
  }

  const canRemove = value.length > 1;

  // Input + inline error message, so a mistake is visible on its own cell.
  function Cell({
    error,
    children,
  }: {
    error?: string;
    children: React.ReactNode;
  }) {
    return (
      <div>
        {children}
        {error && (
          <div className="mt-0.5 text-[12px] leading-tight text-[#ff4d4f]">
            {error}
          </div>
        )}
      </div>
    );
  }

  const columns: ColumnsType<Row> = [
    {
      title: "Packs",
      dataIndex: "name",
      width: 130,
      render: (_, r) => (
        <Cell error={errors?.[r._index]?.name}>
          <AutoComplete
            className="w-full"
            value={r.name}
            options={sizeSuggestions.map((v) => ({ value: v }))}
            placeholder="e.g. 250"
            status={errors?.[r._index]?.name ? "error" : undefined}
            onChange={(v) => update(r._index, { name: v })}
            filterOption={(input, opt) =>
              (opt?.value ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Cell>
      ),
    },
    // {
    //   title: "SKU",
    //   dataIndex: "sku",
    //   width: 150,
    //   render: (_, r) =>
    //     r.sku ? (
    //       <span className="font-mono text-[12px]">{r.sku}</span>
    //     ) : (
    //       <span className="text-[12px] text-neutral-400">Auto</span>
    //     ),
    // },
    {
      title: "Price (USD)",
      dataIndex: "price",
      width: 120,
      render: (_, r) => (
        <Cell error={errors?.[r._index]?.price}>
          <Input
            type="number"
            min={0}
            step="any"
            className="w-full"
            value={r.price}
            placeholder="0.00"
            status={errors?.[r._index]?.price ? "error" : undefined}
            onChange={(e) => update(r._index, { price: e.target.value })}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </Cell>
      ),
    },
    {
      title: "Offer",
      dataIndex: "salePrice",
      width: 110,
      render: (_, r) =>
        r.salePrice !== "" ? (
          <span className="text-[13px] font-medium text-[#389e0d]">
            ${r.salePrice}
          </span>
        ) : (
          <span className="text-[12px] text-neutral-400">No offer</span>
        ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      width: 90,
      render: (_, r) => (
        <Cell error={errors?.[r._index]?.stock}>
          <Input
            type="number"
            min="0"
            step="1"
            // precision={0}
            // controls={false}
            className="w-full"
            value={r.stock}
            status={errors?.[r._index]?.stock ? "error" : undefined}
            onChange={(e) => update(r._index, { stock: e.target.value })}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </Cell>
      ),
    },
    {
      title: "Weight (g)",
      dataIndex: "weight",
      width: 100,
      render: (_, r) => (
        <Cell error={errors?.[r._index]?.weight}>
          <InputNumber
            stringMode
            min="0"
            step="1"
            controls={false}
            className="w-full"
            value={r.weight === "" ? null : r.weight}
            placeholder="Optional"
            status={errors?.[r._index]?.weight ? "error" : undefined}
            onChange={(v) => update(r._index, { weight: v ?? "" })}
          />
        </Cell>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (_, r) => (
        <Select
          value={r.status}
          className="w-full"
          onChange={(status) => update(r._index, { status })}
          options={[
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 48,
      fixed: "right",
      align: "center",
      render: (_, r) => (
        <Tooltip
          title={
            canRemove ? "Remove variant" : "At least one variant is required"
          }
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            aria-label={`Remove variant ${r._index + 1}`}
            onClick={() => remove(r._index)}
          />
        </Tooltip>
      ),
    },
  ];

  const dataSource: Row[] = value.map((v, i) => ({ ...v, _index: i }));

  return (
    <div>
      <Table<Row>
        size="small"
        bordered
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowKey={(r) => r.id ?? `new-${r._index}`}
        scroll={{ x: 900 }}
        locale={{ emptyText: "No variants yet" }}
      />

      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={add}
        className="mt-3"
      >
        Add variant
      </Button>

      {value.length === 0 && (
        <Typography.Text type="danger" className="mt-2 block text-[13px]">
          Add at least one variant. Every product needs a price and stock count.
        </Typography.Text>
      )}
    </div>
  );
}

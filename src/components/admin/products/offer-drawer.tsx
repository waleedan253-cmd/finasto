"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  InputNumber,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import {
  STORE_TZ_LABEL,
  isoToStoreWallClock,
  storeWallClockToIso,
} from "@/lib/store-time";
import type { VariantDraft } from "./variant-repeater";

// Right-side drawer for setting a scheduled offer on a product.
//
// It only edits the form's draft state: nothing is saved to the database
// until the admin clicks Create / Save on the product form. Offer prices
// are per pack (variant); the start/end window is shared by all packs.

type Row = { index: number; name: string; regular: string };

export function OfferDrawer({
  open,
  onClose,
  productName,
  category,
  imageUrl,
  variants,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  category: string | null;
  imageUrl: string | null;
  variants: VariantDraft[];
  onApply: (next: VariantDraft[]) => void;
}) {
  const [prices, setPrices] = useState<string[]>([]);
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the current draft each time the drawer opens.
  useEffect(() => {
    if (!open) return;
    setPrices(variants.map((v) => v.salePrice));
    const withDates = variants.find((v) => v.saleStartsAt && v.saleEndsAt);
    setRange(
      withDates
        ? [
            isoToStoreWallClock(withDates.saleStartsAt),
            isoToStoreWallClock(withDates.saleEndsAt),
          ]
        : null,
    );
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Per-row validation: offer must be a number below the regular price.
  const rowErrors = useMemo(() => {
    const errs: Record<number, string> = {};
    variants.forEach((v, i) => {
      const raw = prices[i] ?? "";
      if (raw === "") return;
      const offer = Number(raw);
      const regular = Number(v.price);
      if (v.price.trim() === "" || Number.isNaN(regular)) {
        errs[i] = "Set the regular price first";
      } else if (Number.isNaN(offer) || offer < 0) {
        errs[i] = "Invalid price";
      } else if (offer >= regular) {
        errs[i] = "Must be below regular price";
      }
    });
    return errs;
  }, [prices, variants]);

  const hasAnyOffer = prices.some((p) => p !== "");
  const hadOffer = variants.some((v) => v.salePrice !== "");

  function setPrice(index: number, value: string) {
    setPrices((prev) => prev.map((p, i) => (i === index ? value : p)));
    if (error) setError(null);
  }

  function handleApply() {
    if (Object.keys(rowErrors).length > 0) {
      setError("Fix the highlighted offer prices.");
      return;
    }

    if (hasAnyOffer) {
      const start = range?.[0];
      const end = range?.[1];
      if (!start || !end) {
        setError("Choose when the offer starts and ends.");
        return;
      }
      if (!end.isAfter(start)) {
        setError("The offer must end after it starts.");
        return;
      }
      if (Date.parse(storeWallClockToIso(end)) <= Date.now()) {
        setError("The end date must be in the future.");
        return;
      }
    }

    onApply(
      variants.map((v, i) => {
        const has = (prices[i] ?? "") !== "";
        return {
          ...v,
          salePrice: has ? prices[i] : "",
          saleStartsAt: has && range?.[0] ? storeWallClockToIso(range[0]) : "",
          saleEndsAt: has && range?.[1] ? storeWallClockToIso(range[1]) : "",
        };
      }),
    );
    onClose();
  }

  function handleRemove() {
    onApply(
      variants.map((v) => ({
        ...v,
        salePrice: "",
        saleStartsAt: "",
        saleEndsAt: "",
      })),
    );
    onClose();
  }

  const columns: ColumnsType<Row> = [
    {
      title: "Pack",
      dataIndex: "name",
      render: (name: string) => name || <em className="text-neutral-400">—</em>,
    },
    {
      title: "Regular (USD)",
      dataIndex: "regular",
      width: 110,
      render: (regular: string) =>
        regular !== "" ? (
          `$${regular}`
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      title: "Offer price",
      width: 130,
      render: (_, r) => (
        <div>
          <InputNumber
            stringMode
            min="0"
            step="0.01"
            controls={false}
            className="w-full"
            placeholder="No offer"
            disabled={r.regular === ""}
            status={rowErrors[r.index] ? "error" : undefined}
            value={(prices[r.index] ?? "") === "" ? null : prices[r.index]}
            onChange={(v) => setPrice(r.index, v ?? "")}
          />
          {rowErrors[r.index] && (
            <div className="mt-0.5 text-[12px] leading-tight text-[#ff4d4f]">
              {rowErrors[r.index]}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Off",
      width: 70,
      align: "center",
      render: (_, r) => {
        const raw = prices[r.index] ?? "";
        const regular = Number(r.regular);
        const offer = Number(raw);
        if (raw === "" || rowErrors[r.index] || !(regular > 0)) return "—";
        return (
          <Tag color="green">-{Math.round((1 - offer / regular) * 100)}%</Tag>
        );
      },
    },
  ];

  const dataSource: Row[] = variants.map((v, i) => ({
    index: i,
    name: v.name,
    regular: v.price,
  }));

  return (
    <Drawer
      title="Set offer"
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          <Button
            danger
            disabled={!hadOffer && !hasAnyOffer}
            onClick={handleRemove}
          >
            Remove offer
          </Button>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleApply}>
              Apply offer
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" size={20} className="w-full">
        {/* Product summary (read-only) */}
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-14 w-14 rounded-md bg-neutral-100 object-contain"
            />
          ) : (
            <div className="h-14 w-14 rounded-md bg-neutral-100" />
          )}
          <div className="min-w-0">
            <Typography.Text strong className="block truncate">
              {productName.trim() || "Untitled product"}
            </Typography.Text>
            <Typography.Text type="secondary" className="text-[13px]">
              {category || "No category"}
            </Typography.Text>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            closable
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div>
          <p className="mb-2 font-medium">Offer price per pack</p>
          <Table<Row>
            size="small"
            bordered
            pagination={false}
            columns={columns}
            dataSource={dataSource}
            rowKey="index"
            locale={{ emptyText: "Add a pack in Variants first" }}
          />
          <p className="mt-2 text-[12px] text-neutral-500">
            Leave a pack empty to keep its regular price. Offer prices are in
            USD and are converted for each market automatically.
          </p>
        </div>

        <div>
          <p className="mb-2 font-medium">Offer period</p>
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            format="DD MMM YYYY, HH:mm"
            className="w-full"
            value={range as [Dayjs, Dayjs] | null}
            disabledDate={(d) =>
              d.isBefore(
                isoToStoreWallClock(new Date().toISOString()).startOf("day"),
              )
            }
            onChange={(v) => {
              setRange(v as [Dayjs | null, Dayjs | null] | null);
              if (error) setError(null);
            }}
          />
          <p className="mt-2 text-[12px] text-neutral-500">
            Times are in {STORE_TZ_LABEL}, the same for every country. After the
            end time the shop goes back to the regular price automatically.
          </p>
        </div>
      </Space>
    </Drawer>
  );
}

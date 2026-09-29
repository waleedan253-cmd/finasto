"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  ColorPicker,
  Collapse,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/admin/product-actions";
import type { Country, ProductDetail } from "@/lib/admin/product-queries";
import { ProductStatusBadge } from "./product-status-badge";
import {
  ProductImageUploader,
  type ProductImageDraft,
} from "./product-image-uploader";
import {
  VariantRepeater,
  emptyVariant,
  type VariantDraft,
} from "./variant-repeater";
import {
  CountryPriceRepeater,
  type CountryPriceDraft,
} from "./country-price-repeater";

// Shared create/edit form (admin/products/new and admin/products/[id]).
//
// Layout: one page, two columns. Left = what the product IS (name,
// description, images, variants). Right = how it's PUBLISHED (status,
// featured, category, save) and stays in view while the admin scrolls.
// Rarely-used settings (country pricing, SEO) live in a collapsed
// "Advanced" panel so they never get in the way.
//
// Validation: Ant Design <Form> rules handle the basic fields; variants
// are checked client-side before submit, so most mistakes are caught
// without a server round-trip. The server (zod) stays the source of truth.

type Status = "active" | "disabled" | "draft";

type FormValues = {
  name: string;
  description: string;
  shortDescription: string;
  tagline: string[];
  features: string[];
  origin: string;
  tastingNote: string;
  accentColor: string;
  category: string;
  status: Status;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
};

type VariantErrors = Record<
  number,
  Partial<Record<keyof VariantDraft, string>>
>;

/* ------------------------------------------------------------------ */
/* Mapping helpers                                                     */
/* ------------------------------------------------------------------ */

function toVariantDraft(v: ProductDetail["variants"][number]): VariantDraft {
  return {
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: String(v.price),
    salePrice: v.salePrice != null ? String(v.salePrice) : "",
    stock: String(v.stock),
    weight: v.weight != null ? String(v.weight) : "",
    status: v.status,
  };
}

function toCountryPriceDraft(
  cp: ProductDetail["countryPrices"][number],
): CountryPriceDraft {
  return {
    id: cp.id,
    countryId: cp.countryId,
    price: String(cp.price),
    salePrice: cp.salePrice != null ? String(cp.salePrice) : "",
    active: cp.active,
  };
}

function toImageDraft(img: ProductDetail["images"][number]): ProductImageDraft {
  return {
    id: img.id,
    url: img.url,
    path: img.path,
    alt: img.alt,
    isPrimary: img.isPrimary,
  };
}

const emptyToNull = (s: string): number | null =>
  s.trim() === "" ? null : Number(s);
const emptyToZero = (s: string): number => (s.trim() === "" ? 0 : Number(s));

/* ------------------------------------------------------------------ */
/* Client-side variant validation                                      */
/* ------------------------------------------------------------------ */

function validateVariants(variants: VariantDraft[]): VariantErrors {
  const errors: VariantErrors = {};
  const seenSkus = new Map<string, number>();

  variants.forEach((v, i) => {
    const e: Partial<Record<keyof VariantDraft, string>> = {};

    if (!v.name.trim()) e.name = "Required";

    const sku = v.sku.trim().toLowerCase();
    if (!sku) e.sku = "Required";
    else if (seenSkus.has(sku)) e.sku = "Duplicate SKU";
    else seenSkus.set(sku, i);

    const price = v.price.trim() === "" ? NaN : Number(v.price);
    if (Number.isNaN(price)) e.price = "Required";
    else if (price < 0) e.price = "Must be 0 or more";

    if (v.salePrice.trim() !== "") {
      const sale = Number(v.salePrice);
      if (Number.isNaN(sale) || sale < 0) e.salePrice = "Invalid";
      else if (!Number.isNaN(price) && sale >= price)
        e.salePrice = "Must be below price";
    }

    if (v.stock.trim() !== "") {
      const stock = Number(v.stock);
      if (!Number.isInteger(stock) || stock < 0) e.stock = "Whole number";
    }

    if (Object.keys(e).length > 0) errors[i] = e;
  });

  return errors;
}

/* ------------------------------------------------------------------ */
/* Build the payload for the server action                             */
/* ------------------------------------------------------------------ */

function buildInput(state: {
  values: FormValues;
  variants: VariantDraft[];
  countryPrices: CountryPriceDraft[];
  images: ProductImageDraft[];
  originalVariantIds: string[];
  originalCountryPriceIds: string[];
}): ProductInput {
  const { values } = state;

  const currentVariantIds = state.variants
    .map((v) => v.id)
    .filter(Boolean) as string[];
  const currentCountryPriceIds = state.countryPrices
    .map((c) => c.id)
    .filter(Boolean) as string[];
  const currentImageIds = state.images
    .map((i) => i.id)
    .filter(Boolean) as string[];

  const trimOrNull = (s?: string) => (s && s.trim() !== "" ? s.trim() : null);

  return {
    name: values.name,
    description: values.description ?? "",
    shortDescription: values.shortDescription ?? "",
    tagline: values.tagline ?? [],
    features: values.features ?? [],
    origin: trimOrNull(values.origin),
    tastingNote: trimOrNull(values.tastingNote),
    accentColor: values.accentColor,
    category: trimOrNull(values.category),
    status: values.status,
    featured: !!values.featured,
    metaTitle: trimOrNull(values.metaTitle),
    metaDescription: trimOrNull(values.metaDescription),
    variants: state.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: emptyToZero(v.price),
      salePrice: emptyToNull(v.salePrice),
      stock: emptyToZero(v.stock),
      weight: emptyToNull(v.weight),
      status: v.status,
    })),
    countryPrices: state.countryPrices.map((c) => ({
      id: c.id,
      countryId: c.countryId,
      price: emptyToZero(c.price),
      salePrice: emptyToNull(c.salePrice),
      active: c.active,
    })),
    images: state.images.map((img) => ({
      id: img.id,
      url: img.url,
      path: img.path,
      alt: img.alt,
      isPrimary: img.isPrimary,
    })),
    deletedVariantIds: state.originalVariantIds.filter(
      (id) => !currentVariantIds.includes(id),
    ),
    deletedCountryPriceIds: state.originalCountryPriceIds.filter(
      (id) => !currentCountryPriceIds.includes(id),
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const FORM_FIELDS: (keyof FormValues)[] = [
  "name",
  "description",
  "shortDescription",
  "tagline",
  "features",
  "origin",
  "tastingNote",
  "accentColor",
  "category",
  "status",
  "featured",
  "metaTitle",
  "metaDescription",
];

export function ProductForm({
  mode,
  product,
  countries,
}: {
  mode: "create" | "edit";
  product: ProductDetail | null;
  countries: Country[];
}) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();

  // Basic fields live in the antd Form. Repeaters keep their own state
  // because they are custom controlled components.
  const [variants, setVariants] = useState<VariantDraft[]>(
    product ? product.variants.map(toVariantDraft) : [emptyVariant()],
  );
  const [countryPrices, setCountryPrices] = useState<CountryPriceDraft[]>(
    product ? product.countryPrices.map(toCountryPriceDraft) : [],
  );
  const [images, setImages] = useState<ProductImageDraft[]>(
    product ? product.images.map(toImageDraft) : [],
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [variantErrors, setVariantErrors] = useState<VariantErrors>({});

  // Live status for the badge in the sidebar.
  const status = Form.useWatch("status", form) ?? product?.status ?? "draft";

  // Stable identity for the Storage upload path: the real id when
  // editing, a client-generated id when creating.
  const folderId = useMemo(
    () => product?.id ?? crypto.randomUUID(),
    [product?.id],
  );

  const originalVariantIds = useMemo(
    () => (product ? product.variants.map((v) => v.id) : []),
    [product],
  );
  const originalCountryPriceIds = useMemo(
    () => (product ? product.countryPrices.map((c) => c.id) : []),
    [product],
  );

  const initialValues: FormValues = {
    name: product?.name ?? "",
    description: product?.description ?? "",
    shortDescription: product?.shortDescription ?? "",
    tagline: product?.tagline ?? [],
    features: product?.features ?? [],
    origin: product?.origin ?? "",
    tastingNote: product?.tastingNote ?? "",
    accentColor: product?.accentColor ?? "#2f855a",
    category: product?.category ?? "",
    status: product?.status ?? "draft",
    featured: product?.featured ?? false,
    metaTitle: product?.metaTitle ?? "",
    metaDescription: product?.metaDescription ?? "",
  };

  // Editing a variant clears stale errors (they are index-based, so a
  // removed row would otherwise leave errors on the wrong row).
  function handleVariantsChange(next: VariantDraft[]) {
    setVariants(next);
    if (Object.keys(variantErrors).length > 0) setVariantErrors({});
  }

  function handleFinish(values: FormValues) {
    setFormError(null);

    const errors = validateVariants(variants);
    if (variants.length === 0 || Object.keys(errors).length > 0) {
      setVariantErrors(errors);
      setFormError(
        variants.length === 0
          ? "Add at least one variant."
          : "Some variants need attention. Check the highlighted fields.",
      );
      document
        .getElementById("product-variants")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setVariantErrors({});

    const input = buildInput({
      values,
      variants,
      countryPrices,
      images,
      originalVariantIds,
      originalCountryPriceIds,
    });

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(input)
          : await updateProduct(product!.id, input);

      if (result.success) {
        router.push("/admin/products");
        router.refresh();
        return;
      }

      setFormError(result.error);

      // Show server-side field errors inline under the matching field.
      const serverErrors = result.fieldErrors ?? {};
      const mapped = Object.entries(serverErrors)
        .filter(([key]) => (FORM_FIELDS as string[]).includes(key))
        .map(([key, messages]) => ({
          name: key as keyof FormValues,
          errors: messages,
        }));
      if (mapped.length > 0) form.setFields(mapped);

      // Array-level errors (e.g. "Add at least one variant") have no
      // field to attach to, so surface them in the alert.
      const other = Object.entries(serverErrors)
        .filter(([key]) => !(FORM_FIELDS as string[]).includes(key))
        .flatMap(([, messages]) => messages);
      if (other.length > 0) setFormError(other.join(" "));
    });
  }

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={initialValues}
      onFinish={handleFinish}
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
      disabled={isPending}
    >
      {formError && (
        <Alert
          type="error"
          showIcon
          closable
          message={formError}
          onClose={() => setFormError(null)}
          className="mb-4"
        />
      )}

      <Row gutter={[16, 16]} align="top">
        {/* ─────────── Main column ─────────── */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} className="w-full">
            <Card title="Product details">
              <Form.Item
                label="Product name"
                name="name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Enter a product name",
                  },
                  { max: 120, message: "Keep it under 120 characters" },
                ]}
              >
                <Input size="large" placeholder="e.g. Velvet Wellness Tea" />
              </Form.Item>

              <Form.Item
                label="Short description (shown on the card)"
                name="shortDescription"
                rules={[{ max: 160, message: "Max 160 characters" }]}
              >
                <Input.TextArea rows={2} showCount maxLength={160} />
              </Form.Item>

              <Form.Item label="Tagline (up to 3 words)" name="tagline">
                <Select
                  mode="tags"
                  maxCount={3}
                  open={false}
                  placeholder="Balance, Calm, Restore"
                />
              </Form.Item>

              <Form.Item label="Features" name="features">
                <Select
                  mode="tags"
                  maxCount={6}
                  open={false}
                  placeholder="100% Natural, 20 Tea Bags"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Origin" name="origin">
                    <Input placeholder="Kintamani, Bali" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tasting note" name="tastingNote">
                    <Input placeholder="Chocolate, citrus, soft floral" />
                  </Form.Item>
                </Col>
              </Row>

              {/* <Form.Item
                label="Short description (shown on the card)"
                name="shortDescription"
                rules={[{ max: 160, message: "Max 160 characters" }]}
                className="!rounded-none"
              >
                <Input.TextArea rows={2} showCount maxLength={160} />
              </Form.Item>

              <Form.Item label="Tagline (up to 3 words)" name="tagline">
                <Select
                  mode="tags"
                  maxCount={3}
                  open={false}
                  placeholder="Balance, Calm, Restore"
                />
              </Form.Item>

              <Form.Item label="Features" name="features">
                <Select
                  mode="tags"
                  maxCount={6}
                  open={false}
                  placeholder="100% Natural, 20 Tea Bags"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Origin" name="origin">
                    <Input placeholder="Kintamani, Bali" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tasting note" name="tastingNote">
                    <Input placeholder="Chocolate, citrus, soft floral" />
                  </Form.Item>
                </Col>
              </Row> */}

              {/* <Form.Item
                label="Description"
                name="description"
                rules={[
                  { max: 5000, message: "Keep it under 5000 characters" },
                ]}
                className="!mb-0"
              >
                <Input.TextArea
                  rows={6}
                  showCount
                  maxLength={5000}
                  placeholder="What makes this product special?"
                  className="!rounded-none"
                />
              </Form.Item> */}
            </Card>

            <Card
              title="Images"
              extra={
                <span className="text-[13px] text-neutral-500">
                  {images.length}/8
                </span>
              }
            >
              <ProductImageUploader
                folderId={folderId}
                value={images}
                onChange={setImages}
              />
            </Card>

            <div id="product-variants">
              <Card
                title="Variants"
                extra={
                  <span className="text-[13px] text-neutral-500">
                    Size or pack options, each with its own price and stock
                  </span>
                }
              >
                <VariantRepeater
                  value={variants}
                  onChange={handleVariantsChange}
                  errors={variantErrors}
                />
              </Card>
            </div>

            {/* <Collapse
              ghost={false}
              items={[
                {
                  key: "advanced",
                  label: "Advanced: country pricing and SEO",
                  children: (
                    <Space direction="vertical" size={24} className="w-full">
                      <div>
                        <p className="mb-1 font-medium">Country pricing</p>
                        <p className="mb-3 text-[13px] text-neutral-500">
                          Optional. Leave empty to auto-convert the base USD
                          price for each market.
                        </p>
                        <CountryPriceRepeater
                          value={countryPrices}
                          onChange={setCountryPrices}
                          countries={countries}
                        />
                      </div>

                      <div>
                        <p className="mb-1 font-medium">Search appearance</p>
                        <p className="mb-3 text-[13px] text-neutral-500">
                          Shown in search results, not on the product page.
                        </p>
                        <Form.Item
                          label="Meta title"
                          name="metaTitle"
                          rules={[{ max: 70, message: "Max 70 characters" }]}
                        >
                          <Input
                            showCount
                            maxLength={70}
                            placeholder="Defaults to the product name"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Meta description"
                          name="metaDescription"
                          rules={[{ max: 160, message: "Max 160 characters" }]}
                          className="!mb-0"
                        >
                          <Input.TextArea
                            rows={2}
                            showCount
                            maxLength={160}
                            placeholder="A short, honest summary for search results"
                          />
                        </Form.Item>
                      </div>
                    </Space>
                  ),
                },
              ]}
            /> */}
          </Space>
        </Col>

        {/* ─────────── Sticky sidebar ─────────── */}
        <Col xs={24} lg={8}>
          <div className="lg:sticky lg:top-4">
            <Space direction="vertical" size={16} className="w-full">
              <Card
                title="Publish"
                extra={<ProductStatusBadge status={status as Status} />}
              >
                <Form.Item label="Status" name="status">
                  <Select
                    options={[
                      { value: "draft", label: "Draft (hidden from the shop)" },
                      {
                        value: "active",
                        label: "Active (visible in the shop)",
                      },
                      {
                        value: "disabled",
                        label: "Disabled (hidden, not deleted)",
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="featured"
                  valuePropName="checked"
                  className="!mb-4"
                >
                  <Switch /> <span className="ml-2">Feature on homepage</span>
                </Form.Item>

                <Space.Compact block>
                  <Button
                    onClick={() => router.push("/admin/products")}
                    disabled={isPending}
                    style={{ width: "35%" }}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    style={{ width: "65%" }}
                    size="large"
                  >
                    {mode === "create" ? "Create product" : "Save changes"}
                  </Button>
                </Space.Compact>
              </Card>

              <Card title="Organization">
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ max: 60, message: "Max 60 characters" }]}
                >
                  <Input placeholder="e.g. Wellness Tea" />
                </Form.Item>

                <Form.Item
                  label="Card color"
                  name="accentColor"
                  getValueFromEvent={(c) => c.toHexString()}
                  className="!mb-0"
                >
                  <ColorPicker showText disabledAlpha />
                </Form.Item>
              </Card>
            </Space>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

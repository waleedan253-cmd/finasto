export type Role = "admin" | "affiliate" | "stockist";

export const roleHome: Record<Role, string> = {
  admin: "/admin",
  affiliate: "/affiliate",
  stockist: "/stockist",
};

// Flip to true as each portal gets built
export const portalEnabled: Record<Role, boolean> = {
  admin: true,
  affiliate: true,
  stockist: false,
};

export function isRole(v: unknown): v is Role {
  return v === "admin" || v === "affiliate" || v === "stockist";
}

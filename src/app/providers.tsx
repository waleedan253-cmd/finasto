// app/providers.tsx
"use client";
import { ConfigProvider } from "antd";

export function AntdTheme({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3B2A24",
          colorText: "#3B2A24",
          colorBorder: "#3B2A24",
          colorBgContainer: "#FBF7F0",
          borderRadius: 9999,
          fontFamily: "inherit",
        },
        components: {
          DatePicker: { activeBorderColor: "#B87333" },
          Button: { controlHeight: 40, paddingInline: 24 },
          Segmented: {
            itemSelectedBg: "#2E7D32", // selected tab background (green)
            itemSelectedColor: "#FFFFFF", // selected tab text
            itemColor: "#3b2a20", // unselected tab text
            itemHoverColor: "#3b2a20", // unselected tab text on hover
            trackBg: "#F1EBE1", // optional: the pill's background track
          },
          Tooltip: {
            colorBgSpotlight: "#FBF7F0",
            colorTextLightSolid: "#3B2A24",
            borderRadius: 8,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

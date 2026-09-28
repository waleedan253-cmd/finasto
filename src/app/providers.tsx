// app/providers.tsx
"use client";
import { ConfigProvider } from "antd";

export function AntdTheme({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3B2A24", // your --color-green
          colorText: "#3B2A24", // espresso
          colorBorder: "#3B2A24", // border
          colorBgContainer: "#FBF7F0", // cream
          borderRadius: 9999,
          fontFamily: "inherit",
        },
        components: {
          DatePicker: { activeBorderColor: "#B87333" /* copper */ },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

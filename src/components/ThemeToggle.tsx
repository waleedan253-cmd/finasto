"use client";

import { Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "@/components/ThemeProvider"; // adjust path

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="text"
      shape="circle"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      icon={
        resolvedTheme === "dark" ? (
          <SunOutlined className="text-lg" />
        ) : (
          <MoonOutlined className="text-lg" />
        )
      }
    />
  );
}

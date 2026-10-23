

"use client";

import type { ReactNode } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "@/components/ThemeProvider"; // adjust path to where you create it

const palettes = {
  light: {
    primary: "#3B2A24",
    primaryHover: "#4B362E",
    primaryActive: "#2A1D19",
    primaryText: "#FFFFFF",
    text: "#3B2A24",
    textSecondary: "#85766D",
    bgLayout: "#F5F0E8",
    bgContainer: "#FBF7F0",
    bgElevated: "#FFFFFF",
    border: "#E5DCD0",
    borderSecondary: "#EFE7DD",
    success: "#287A45",
    warning: "#B87333",
    error: "#C4473A",
    info: "#527C91",
    accent: "#B87333",
    field: "#FBF7F0",
    optionSelected: "#F1E7D8",
    tableHeader: "#F5F0E8",
    rowHover: "#F7F0E6",
    segTrack: "#F1E9DF",
    segSelectedBg: "#3B2A24",
    segSelectedText: "#FFFFFF",
    segText: "#5F5048",
    tooltipBg: "#3B2A24",
    tooltipText: "#FFFFFF",
  },

  dark: {
    primary: "#E0A56D",
    primaryHover: "#EDBB88",
    primaryActive: "#C98245",
    primaryText: "#171B16",
    text: "#F7F0E4",
    textSecondary: "#B9B5A6",
    bgLayout: "#171B16",
    bgContainer: "#222820",
    bgElevated: "#2B3228",
    border: "#4A4A3A",
    borderSecondary: "#363A2E",
    success: "#8FCB78",
    warning: "#E0A56D",
    error: "#EE7F74",
    info: "#8FBFD6",
    accent: "#E0A56D",
    field: "#1A1F19",
    optionSelected: "#363A2E",
    tableHeader: "#1C211B",
    rowHover: "#2B3228",
    segTrack: "#1C211B",
    segSelectedBg: "#34402E",
    segSelectedText: "#F7F0E4",
    segText: "#B9B5A6",
    tooltipBg: "#F7F0E4",
    tooltipText: "#171B16",
  },
};

export function AntdTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme(); // "light" | "dark"
  const isDark = resolvedTheme === "dark";
  const p = isDark ? palettes.dark : palettes.light;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: p.primary,
          colorPrimaryHover: p.primaryHover,
          colorPrimaryActive: p.primaryActive,

          colorText: p.text,
          colorTextSecondary: p.textSecondary,
          fontFamily: "inherit",
          fontSize: 14,
          fontSizeHeading1: 32,
          fontSizeHeading2: 26,
          fontSizeHeading3: 22,
          fontWeightStrong: 600,

          colorBgLayout: p.bgLayout,
          colorBgContainer: p.bgContainer,
          colorBgElevated: p.bgElevated,
          colorBorder: p.border,
          colorBorderSecondary: p.borderSecondary,

          colorSuccess: p.success,
          colorWarning: p.warning,
          colorError: p.error,
          colorInfo: p.info,
          colorLink: p.accent,
          colorLinkHover: p.primaryHover,
          colorLinkActive: p.primaryActive,

          borderRadius: 10,
          borderRadiusSM: 8,
          borderRadiusLG: 16,
          borderRadiusXS: 6,

          controlHeight: 42,
          controlHeightSM: 32,
          controlHeightLG: 48,
          wireframe: false,
        },

        components: {
          Card: {
            borderRadiusLG: 16,
            headerBg: "transparent",
            headerFontSize: 16,
            headerFontSizeSM: 14,
          },

          Button: {
            controlHeight: 42,
            controlHeightLG: 48,
            controlHeightSM: 32,
            paddingInline: 20,
            borderRadius: 10,
            fontWeight: 500,
            primaryShadow: "none",
            primaryColor: p.primaryText,
          },
          Input: {
            colorBgContainer: p.field,
            controlHeight: 42,
            borderRadius: 10,
            activeBorderColor: p.accent,
            hoverBorderColor: p.accent,
          },

          Select: {
            selectorBg: p.field,
            controlHeight: 42,
            borderRadius: 10,
            optionSelectedBg: p.optionSelected,
          },

          DatePicker: {
            colorBgContainer: isDark ? "#1A1F19" : "#FFFFFF",
            colorBgContainerDisabled: isDark ? "#1A1F19" : "#F5F0E8",
            colorTextLightSolid: p.primaryText,
            cellActiveWithRangeBg: p.optionSelected,
            cellHoverWithRangeBg: p.rowHover,
            controlHeight: 42,
            borderRadius: 10,
            activeBorderColor: p.accent,
            hoverBorderColor: p.accent,
          },

          Table: {
            headerBg: p.tableHeader,
            headerColor: p.text,
            borderColor: p.borderSecondary,
            rowHoverBg: p.rowHover,
            headerSplitColor: "transparent",
            cellPaddingBlock: 16,
            cellPaddingInline: 16,
          },

          Segmented: {
            itemSelectedBg: p.segSelectedBg,
            itemSelectedColor: p.segSelectedText,
            itemColor: p.segText,
            itemHoverColor: p.text,
            trackBg: p.segTrack,
            borderRadius: 10,
          },

          Tooltip: {
            colorBgSpotlight: p.tooltipBg,
            colorTextLightSolid: p.tooltipText,
            borderRadius: 8,
          },

          Modal: {
            borderRadiusLG: 16,
          },

          Drawer: {
            borderRadiusLG: 16,
          },

          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

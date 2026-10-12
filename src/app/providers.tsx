// // // app/providers.tsx
// // "use client";
// // import { ConfigProvider } from "antd";

// // export function AntdTheme({ children }: { children: React.ReactNode }) {
// //   return (
// //     <ConfigProvider
// //       theme={{
// //         token: {
// //           colorPrimary: "#3B2A24",
// //           colorText: "#3B2A24",
// //           colorBorder: "#3B2A24",
// //           colorBgContainer: "#FBF7F0",
// //           borderRadius: 9999,
// //           fontFamily: "inherit",
// //         },
// //         components: {
// //           DatePicker: { activeBorderColor: "#B87333" },
// //           Button: { controlHeight: 40, paddingInline: 24 },
// //           Segmented: {
// //             itemSelectedBg: "#2E7D32", // selected tab background (green)
// //             itemSelectedColor: "#FFFFFF", // selected tab text
// //             itemColor: "#3b2a20", // unselected tab text
// //             itemHoverColor: "#3b2a20", // unselected tab text on hover
// //             trackBg: "#F1EBE1", // optional: the pill's background track
// //           },
// //           Tooltip: {
// //             colorBgSpotlight: "#FBF7F0",
// //             colorTextLightSolid: "#3B2A24",
// //             borderRadius: 8,
// //           },
// //         },
// //       }}
// //     >
// //       {children}
// //     </ConfigProvider>
// //   );
// // }
// "use client";

// import type { ReactNode } from "react";
// import { ConfigProvider } from "antd";

// export function AntdTheme({ children }: { children: ReactNode }) {
//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           // Finasto brand colors
//           colorPrimary: "#3B2A24",
//           colorPrimaryHover: "#4B362E",
//           colorPrimaryActive: "#2A1D19",

//           // Typography
//           colorText: "#3B2A24",
//           colorTextSecondary: "#85766D",
//           fontFamily: "inherit",
//           fontSize: 14,
//           fontSizeHeading1: 32,
//           fontSizeHeading2: 26,
//           fontSizeHeading3: 22,
//           fontWeightStrong: 600,

//           // Surfaces and borders
//           colorBgLayout: "#F5F0E8",
//           colorBgContainer: "#FBF7F0",
//           colorBgElevated: "#FFFFFF",
//           colorBorder: "#E5DCD0",
//           colorBorderSecondary: "#EFE7DD",

//           // Semantic colors
//           colorSuccess: "#287A45",
//           colorWarning: "#B87333",
//           colorError: "#C4473A",
//           colorInfo: "#527C91",

//           // Consistent geometry
//           borderRadius: 10,
//           borderRadiusSM: 8,
//           borderRadiusLG: 16,
//           borderRadiusXS: 6,

//           // Consistent controls
//           controlHeight: 42,
//           controlHeightSM: 32,
//           controlHeightLG: 48,
//           wireframe: false,
//         },

//         components: {
//           Card: {
//             borderRadiusLG: 16,
//             headerBg: "transparent",
//             headerFontSize: 16,
//             headerFontSizeSM: 14,
//           },

//           Button: {
//             controlHeight: 42,
//             controlHeightLG: 48,
//             controlHeightSM: 32,
//             paddingInline: 20,
//             borderRadius: 10,
//             fontWeight: 500,
//             primaryShadow: "none",
//           },

//           Input: {
//             controlHeight: 42,
//             borderRadius: 10,
//             activeBorderColor: "#B87333",
//             hoverBorderColor: "#B87333",
//           },

//           Select: {
//             controlHeight: 42,
//             borderRadius: 10,
//             optionSelectedBg: "#F1E7D8",
//           },

//           DatePicker: {
//             controlHeight: 42,
//             borderRadius: 10,
//             activeBorderColor: "#B87333",
//             hoverBorderColor: "#B87333",
//           },

//           Table: {
//             headerBg: "#F5F0E8",
//             headerColor: "#3B2A24",
//             borderColor: "#EFE7DD",
//             rowHoverBg: "#F7F0E6",
//             headerSplitColor: "transparent",
//             cellPaddingBlock: 16,
//             cellPaddingInline: 16,
//           },

//           Segmented: {
//             itemSelectedBg: "#3B2A24",
//             itemSelectedColor: "#FFFFFF",
//             itemColor: "#5F5048",
//             itemHoverColor: "#3B2A24",
//             trackBg: "#F1E9DF",
//             borderRadius: 10,
//           },

//           Tooltip: {
//             colorBgSpotlight: "#3B2A24",
//             colorTextLightSolid: "#FFFFFF",
//             borderRadius: 8,
//           },

//           Modal: {
//             borderRadiusLG: 16,
//           },

//           Drawer: {
//             borderRadiusLG: 16,
//           },

//           Tag: {
//             borderRadiusSM: 6,
//           },
//         },
//       }}
//     >
//       {children}
//     </ConfigProvider>
//   );
// }

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
    primaryText: "#14100E",
    text: "#F2E9DC",
    textSecondary: "#A89B8F",
    bgLayout: "#14100E",
    bgContainer: "#1C1613",
    bgElevated: "#261E1A",
    border: "#3D2E21",
    borderSecondary: "#281F18",
    success: "#6FB05A",
    warning: "#E0A56D",
    error: "#E06A5F",
    info: "#7FB0C7",
    accent: "#E0A56D",
    optionSelected: "#3D2E21",
    tableHeader: "#1C1613",
    rowHover: "#261E1A",
    segTrack: "#1C1613",
    segSelectedBg: "#E0A56D",
    segSelectedText: "#14100E",
    segText: "#A89B8F",
    tooltipBg: "#F2E9DC",
    tooltipText: "#14100E",
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
            controlHeight: 42,
            borderRadius: 10,
            activeBorderColor: p.accent,
            hoverBorderColor: p.accent,
          },

          Select: {
            controlHeight: 42,
            borderRadius: 10,
            optionSelectedBg: p.optionSelected,
          },

          DatePicker: {
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

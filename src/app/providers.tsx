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
    primary: "#E8B27C",
    primaryHover: "#F1C79B",
    primaryActive: "#D49C66",
    primaryText: "#0E1D16",
    text: "#F4EEE2",
    textSecondary: "#B9C7BC",
    bgLayout: "#0E1D16",
    bgContainer: "#162E22",
    bgElevated: "#1D3A2A",
    border: "#404834",
    borderSecondary: "#2F3E2D",
    success: "#8FD07A",
    warning: "#E8B27C",
    error: "#EE8A7E",
    info: "#8EBFD6",
    accent: "#E8B27C",
    optionSelected: "#254232",
    tableHeader: "#12261C",
    rowHover: "#1D3A2A",
    segTrack: "#12261C",
    segSelectedBg: "#E8B27C",
    segSelectedText: "#0E1D16",
    segText: "#B9C7BC",
    tooltipBg: "#F4EEE2",
    tooltipText: "#0E1D16",
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

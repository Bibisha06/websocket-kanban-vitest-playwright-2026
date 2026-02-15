import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },
    styles: {
        global: {
            body: {
                bg: "gray.900",
                color: "gray.50",
            },
        },
    },
    colors: {
        brand: {
            50: "#ffe5ff",
            100: "#ffb8ff",
            200: "#ff8aff",
            300: "#ff5cff",
            400: "#ff2eff",
            500: "#d000d0", // Darker Neon Magenta
            600: "#cc00cc",
            700: "#990099",
            800: "#660066",
            900: "#330033",
        },
        accent: {
            50: "#E9D8FD",
            100: "#D6BCFA",
            200: "#B794F4",
            300: "#9F7AEA",
            400: "#805AD5",
            500: "#6B46C1", // Neon Purple
            600: "#553C9A",
            700: "#44337A",
            800: "#322659",
            900: "#21193F",
        },
        gray: {
            50: "#f7fafc",
            100: "#edf2f7",
            200: "#e2e8f0",
            300: "#cbd5e0",
            400: "#a0aec0",
            500: "#718096",
            600: "#4a5568",
            700: "#2d3748",
            800: "#1a202c", // Standard dark card bg
            900: "#171923", // Standard dark app bg
        },
    },
    fonts: {
        heading: `'Inter', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: "brand",
            },
        },
        Modal: {
            baseStyle: {
                dialog: {
                    bg: "gray.800",
                },
            },
        },
        Menu: {
            baseStyle: {
                list: {
                    bg: "gray.800",
                    borderColor: "gray.700",
                },
                item: {
                    bg: "transparent",
                    _hover: {
                        bg: "whiteAlpha.100",
                    },
                    _focus: {
                        bg: "whiteAlpha.100",
                    },
                },
            },
        },
    },
});

export default theme;

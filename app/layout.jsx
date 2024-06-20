import "../app/global.css";
import { Raleway, Inter, Roboto_Serif } from "next/font/google";
import { AppProvider } from "./utils/Appcontext";
import { ChakraProvider } from "@chakra-ui/react";

const roboto_serif = Roboto_Serif({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto_serif.className}>
        <ChakraProvider>
          <AppProvider>{children}</AppProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}

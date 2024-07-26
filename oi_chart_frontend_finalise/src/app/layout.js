import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ weight: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ["latin"] });

export const metadata = {
  title: "OI Magic"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}

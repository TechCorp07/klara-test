// src/app/layout.jsx  (Server Component)
import { Inter } from "next/font/google";
import "@/styles/global.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Klararety Health Platform",
  description: "Secure healthcare platform for patients and providers",
  keywords: "healthcare, telemedicine, medical records, HIPAA compliant",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

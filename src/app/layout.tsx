import type { Metadata } from "next";

import { SITE_URL } from "@/lib/seo";



export const metadata: Metadata = {

  metadataBase: new URL(SITE_URL),

  title: "Rise of Kingdoms Calculators",

  description: "Free Rise of Kingdoms calculators for AP, speedups, gems, and more.",

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return children;

}


import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"PyCoach — Learn Python by doing",description:"Interactive Python practice with instant feedback and mastery-based recommendations."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

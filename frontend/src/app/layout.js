import "./globals.css";
import { AuthProvider } from "../../lib/auth";
import NavBar from '../../components/NavBar';

export const metadata = {
    title: "CTF Platform",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
            <body>
            <AuthProvider>
                <NavBar/>
                <main className="max-w-4xl mx-auto p-4">
                    {children}
                </main>
            </AuthProvider>
            </body>
        </html>
)
    ;
}

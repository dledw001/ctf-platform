import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from "../../lib/auth";
import NavBar from '../../components/NavBar';

export const metadata = {
    title: "CTF Platform",
};

export default function RootLayout({children}) {
    return (
        <html lang="en" data-bs-theme="dark">
        <body className="container-lg">
        <AuthProvider>
            <NavBar/>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}

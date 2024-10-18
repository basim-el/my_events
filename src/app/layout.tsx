import Appbar from "../../components/Appbar";
import Providers from "../../components/SessionProviderWrapper";
import "./globals.css";
import {Inter} from "next/font/google";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "My Events",
    description: "My Events",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body className={inter.className}>
        <Providers>
            <Appbar/>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <ToastContainer/>
            {children}
        </Providers>
        </body>
        </html>
    );
}
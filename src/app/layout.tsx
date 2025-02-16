import "./styles/globals.css";
import { UserProvider } from "../context/UserContext";
import Navbar from "../components/Navbar"; // Import Navbar

export const metadata = {
  title: "BookNGo",
  description: "Generated by BookNGo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <html lang="en">
        <body>
          <Navbar /> {/* Navbar is always visible */}
          <div>{children}</div>
        </body>
      </html>
    </UserProvider>
  );
}

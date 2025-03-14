"use client";

import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientLayout({ children }) {
  const { user } = useAuth();
  const contentClass = user ? "content" : "content-sinnavbar";

  return (
    <>
      {user && <AppNavbar />}

      <div className={`scroll-container ${contentClass}`}>
        <main>{children}</main>
        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

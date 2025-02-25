// components/ClientLayout.js
"use client";

import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientLayout({ children }) {
  const { user } = useAuth(); 

  return (
    <>
      {user && <AppNavbar />}

      <div className="content">
        <main>{children}</main>

        {user && <Footer />}
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
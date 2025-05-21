"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function publicPage(Component) {
  return function PublicRouteWrapper(props) {
    const { user, authChecked } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (authChecked && user) {
        router.replace("/dashboard");
      }
    }, [authChecked, user]);

    if (!authChecked) {
      return (
        <div className="loading-spinner">
          <i className="fa fa-circle-notch cargando" aria-hidden="true"></i>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
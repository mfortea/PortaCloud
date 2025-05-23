"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

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
      return <LoadingSpinner loading={loading} />;
    }

    return <Component {...props} />;
  };
}
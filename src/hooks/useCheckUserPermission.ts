import { useEffect } from "react";
import { UserAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useCheckUserPermissions = (pagePermission: string) => {
  const { session, loadingPage } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingPage) {
      const permissions = session?.user.user_metadata.permissions as
        | string[]
        | undefined;

      if (!permissions?.includes(pagePermission)) {
        navigate("/profile");
      }
    }
  }, [pagePermission, session, loadingPage, navigate]);
};

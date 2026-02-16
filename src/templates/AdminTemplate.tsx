import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { UserAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../components/LoadingPage";

const AdminTemplate: React.FC<PropsWithChildren> = ({ children }) => {
  const { session, loadingPage } = UserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(loadingPage);

  // console.log("session");
  // console.log(session);

  useEffect(() => {
    console.log("session");
    console.log(session);
    if (!loadingPage && !session) {
      navigate("/login");
    } else {
      setLoading(loadingPage);
    }
  }, [loadingPage, navigate, session]);

  return loading ? (
    <LoadingPage />
  ) : (
    <div className="flex w-full">
      <div className="flex-col w-full">
        <Header />
        <section className="flex w-full">
          <Sidebar className="flex max-w-64 w-1/5" />
          <div className="flex w-4/5 mt-10">{children}</div>
        </section>
      </div>
    </div>
  );
};

export default AdminTemplate;

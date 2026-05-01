import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { UserAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { SidebarProvider } from "../components/context/SidebarContext";

const AdminTemplate: React.FC<PropsWithChildren> = ({ children }) => {
  const { session, loadingPage } = UserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(loadingPage);

  useEffect(() => {
    if (!loadingPage && !session) {
      navigate("/login");
    } else {
      setLoading(loadingPage);
    }
  }, [loadingPage, navigate, session]);

  return loading ? (
    <LoadingScreen />
  ) : (
    <SidebarProvider>
      <div className="flex w-full h-auto">
        <div className="flex-col w-full h-auto">
          <Header />
          <section className="flex w-full min-h-screen h-auto">
            <Sidebar className="flex max-w-64 w-1/5 h-auto" />
            <div className="flex w-4/5 sm:mt-4">{children}</div>
          </section>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminTemplate;

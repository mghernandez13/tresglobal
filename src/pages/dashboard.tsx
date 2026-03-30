import { useCheckUserPermissions } from "../hooks/useCheckUserPermission";
import AdminTemplate from "../templates/AdminTemplate";

const Dashboard = () => {
  useCheckUserPermissions("View Admin Dashboard");

  return (
    <AdminTemplate>
      <></>
    </AdminTemplate>
  );
};

export default Dashboard;

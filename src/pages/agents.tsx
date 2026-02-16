import Headline from "../components/generic/Headline";
import AdminTemplate from "../templates/AdminTemplate";
import DataTable from "../components/generic/table";
import { supabase } from "../db/supabase";

const AgentsPage: React.FC = () => {
  // const {
  //   data: { users },
  //   error,
  // } = await supabase.auth.admin.listUsers();

  // console.log("users");
  // console.log(users);

  return (
    <AdminTemplate>
      <div className="flex-col w-full mx-10">
        <Headline>Agents</Headline>
        <DataTable />
      </div>
    </AdminTemplate>
  );
};

export default AgentsPage;

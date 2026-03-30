import React from "react";
import ConfigurationForm from "../../../components/settings/ConfigurationForm";
import AdminTemplate from "../../../templates/AdminTemplate";

const ConfigurationSettingsPage: React.FC = () => {
  return (
    <AdminTemplate>
      <div className="min-h-screen w-full py-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <ConfigurationForm />
        </div>
      </div>
    </AdminTemplate>
  );
};

export default ConfigurationSettingsPage;

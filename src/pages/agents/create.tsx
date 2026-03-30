import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Headline from "../../components/generic/Headline";
import AdminTemplate from "../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../db/supabase";
import Swal from "sweetalert2";
import AgentForm from "../../components/forms/AgentForm";
import type { AgentFormDataProps } from "../../types/generic";
import { useCheckUserPermissions } from "../../hooks/useCheckUserPermission";

const CreateAgentPage: React.FC = () => {
  useCheckUserPermissions("Create Agents");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgentFormDataProps>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    permissionId: null,
    avatarUrl: "",
    isQuotaBased: false,
    isActive: true,
    upline: null,
  });

  const formValidation = useCallback(() => {
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Create Agent",
        text: `Password and Confirm Password mismatch!`,
      });

      setLoading(false);

      return false;
    }

    return true;
  }, [formData.confirmPassword, formData.password]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (
    e: React.SubmitEvent,
    createAnother?: boolean,
  ) => {
    e.preventDefault();
    setLoading(true);

    if (!formValidation()) return;

    try {
      // 1. Create the user in Supabase Auth
      const { error } = await supabase.functions.invoke("create-user", {
        body: formData, // This sends all your form state
      });

      if (error) throw error;

      // 2. Success! Redirect to agents list
      Swal.fire({
        icon: "success",
        title: "Create Agent",
        text: `Agent successfully added!`,
      });
      if (createAnother) {
        window.location.reload();
      } else {
        navigate("/agents");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Swal.fire({
        icon: "error",
        title: "Create Agent",
        text: `Error occurred while trying to creating agent: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTemplate>
      <div className="flex-col w-full px-4 sm:mx-2 md:mx-10 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Headline>Create Agent</Headline>
        </div>
        <AgentForm
          action="add"
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleFormChange={handleChange}
          loading={loading}
        />
      </div>
    </AdminTemplate>
  );
};

export default CreateAgentPage;

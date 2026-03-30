import React, { useState } from "react";
import AdminTemplate from "../../../templates/AdminTemplate";
import Headline from "../../../components/generic/Headline";
import { useMutation } from "@apollo/client/react";
import { CREATE_ROLE } from "../../../graphql/queries/roles";
import Swal from "sweetalert2";
import RoleForm, { type RoleFormData } from "./RoleForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ADMIN_PERMISSIONS, USER_PERMISSIONS } from "../../../types/constants";

const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    permissions: [],
  });
  const [loading, setLoading] = useState(false);
  const [createRole] = useMutation(CREATE_ROLE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && name === "permissions") {
      setFormData((prev) => {
        const perms = prev.permissions.includes(value)
          ? prev.permissions.filter((p) => p !== value)
          : [...prev.permissions, value];
        return { ...prev, permissions: perms };
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRole({
        variables: {
          name: formData.name,
          permissions: formData.permissions,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Role Created",
        text: "Role has been created successfully!",
      });
      setFormData({ name: "", permissions: [] });
      navigate("/settings/roles");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: String(error),
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
          <Headline>Create Role</Headline>
        </div>
        <RoleForm
          formData={formData}
          adminPermissionsList={ADMIN_PERMISSIONS}
          userPermissionsList={USER_PERMISSIONS}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => {
            setFormData({ name: "", permissions: [] });
            navigate(-1);
          }}
        />
      </div>
    </AdminTemplate>
  );
};

export default CreateRolePage;

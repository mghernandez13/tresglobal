import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ROLE, UPDATE_ROLE } from "../../../graphql/queries/roles";
import RoleForm from "./RoleForm";
import { ADMIN_PERMISSIONS, USER_PERMISSIONS } from "../../../types/constants";
import Swal from "sweetalert2";
import type { RolesQueryData, GetRoleQueryVariables } from "../../../types/api";
import { ArrowLeft } from "lucide-react";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";

const UpdateRolePage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { data, loading: queryLoading } = useQuery<
    RolesQueryData,
    GetRoleQueryVariables
  >(GET_ROLE, {
    variables: { roleId },
    skip: !roleId,
    fetchPolicy: "network-only",
  });
  const [updateRole, { loading: mutationLoading }] = useMutation(UPDATE_ROLE);

  const [formData, setFormData] = useState<{
    name: string;
    permissions: string[];
  }>({ name: "", permissions: [] });

  useEffect(() => {
    if (data?.permissionsCollection?.edges?.[0]?.node) {
      const role = data.permissionsCollection.edges[0].node;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ name: role.name, permissions: role.permissions || [] });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (name === "permissions") {
      if (Array.isArray(value)) {
        setFormData((prev) => ({ ...prev, permissions: value }));
      } else if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
          ...prev,
          permissions: checked
            ? [...prev.permissions, value]
            : prev.permissions.filter((perm) => perm !== value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, permissions: [value] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRole({
        variables: {
          id: roleId,
          name: formData.name,
          permissions: formData.permissions,
        },
      });
      Swal.fire({ icon: "success", title: "Role updated successfully!" });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Update failed", text: error.message });
    }
  };

  const handleCancel = () => navigate("../settings/roles");

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
          <Headline>Update Role</Headline>
        </div>
        <RoleForm
          formData={formData}
          adminPermissionsList={ADMIN_PERMISSIONS}
          userPermissionsList={USER_PERMISSIONS}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={queryLoading || mutationLoading}
          onCancel={handleCancel}
        />
      </div>
    </AdminTemplate>
  );
};

export default UpdateRolePage;

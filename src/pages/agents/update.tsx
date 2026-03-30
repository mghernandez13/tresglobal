import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AdminTemplate from "../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import Headline from "../../components/generic/Headline";
import AgentForm from "../../components/forms/AgentForm";
import {
  GET_USER,
  UPDATE_USER,
  UPDATE_USER_EMAIL,
} from "../../graphql/queries/user";
import { useMutation, useQuery } from "@apollo/client/react";
import type { GetUserQueryVariables, UsersQueryData } from "../../types/api";
import type { AgentFormDataProps } from "../../types/generic";
import { useCheckUserPermissions } from "../../hooks/useCheckUserPermission";

const UpdateAgentPage: React.FC = () => {
  useCheckUserPermissions("Edit Agents");
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data } = useQuery<UsersQueryData, GetUserQueryVariables>(GET_USER, {
    variables: {
      userId: String(userId),
    },
  });

  const [updateUserEmail, { loading: updateUserEmailLoading }] =
    useMutation(UPDATE_USER_EMAIL);
  const [updateUser, { loading }] = useMutation(UPDATE_USER, {
    refetchQueries: [
      {
        query: GET_USER,
        variables: {
          userId: String(userId),
        },
      },
    ],
  });

  const [formData, setFormData] = useState<AgentFormDataProps>({
    firstName: "",
    lastName: "",
    email: "",
    permissionId: null,
    avatarUrl: "",
    isQuotaBased: false,
    isActive: true,
    upline: null,
  });

  useEffect(() => {
    setFormData({
      firstName: String(data?.profilesCollection.edges[0].node.first_name),
      lastName: String(data?.profilesCollection.edges[0].node.last_name),
      email: String(data?.profilesCollection.edges[0].node.email),
      permissionId:
        data?.profilesCollection.edges[0].node.permission_id ?? null,
      avatarUrl: String(data?.profilesCollection.edges[0].node.avatar_url),
      isQuotaBased: Boolean(
        data?.profilesCollection.edges[0].node.is_quota_based,
      ),
      isActive: Boolean(data?.profilesCollection.edges[0].node.status),
      ...(data?.profilesCollection.edges[0].node.upline !== null && {
        upline: String(data?.profilesCollection.edges[0].node.upline),
      }),
    });
  }, [data]);

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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      // 1. Create the user in Supabase Auth
      await updateUser({
        variables: {
          id: userId,
          ...formData,
        },
      });

      const { error } = await updateUserEmail({
        variables: {
          userId,
          email: formData.email,
        },
      });

      if (error) {
        throw error;
      }

      // 2. Success! Redirect to agents list
      Swal.fire({
        icon: "success",
        title: "Update Agent",
        text: `Agent successfully updated!`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Swal.fire({
        icon: "error",
        title: "Update Agent",
        text: `Error occurred while trying to updating agent: ${errorMessage}`,
      });
    }
  };

  return (
    <AdminTemplate>
      <div className="flex-col w-full px-4 sm:mx-2 md:mx-10 py-4">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Headline>Update Agent</Headline>
        </div>
        <AgentForm
          action="edit"
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleFormChange={handleChange}
          loading={loading || updateUserEmailLoading}
        />
      </div>
    </AdminTemplate>
  );
};

export default UpdateAgentPage;

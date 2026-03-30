import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_BET_TYPE,
  UPDATE_BET_TYPE,
} from "../../../graphql/queries/betTypes";
import Swal from "sweetalert2";
import BetTypeForm from "../../../components/forms/BetTypeForm";
import type { BetTypeFormData } from "../../../components/forms/BetTypeForm";
import type {
  BetTypesQueryData,
  GetBetTypeQueryVariables,
} from "../../../types/api";

const UpdateBetTypePage: React.FC = () => {
  const navigate = useNavigate();
  const { betTypeId } = useParams<{ betTypeId: string }>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BetTypeFormData>({
    gameType: "",
    drawTime: "",
    name: "",
    code: "",
    isActive: false,
  });

  const { data } = useQuery<BetTypesQueryData, GetBetTypeQueryVariables>(
    GET_BET_TYPE,
    {
      variables: { betTypeId: String(betTypeId) },
    },
  );

  useEffect(() => {
    const node = data?.bet_typesCollection?.edges?.[0]?.node;
    const raw = node?.draw_time || "";
    const normalizedTime = raw ? raw.split(":").slice(0, 2).join(":") : "";
    if (node) {
      setFormData({
        gameType: String(node.game_type || ""),
        drawTime: normalizedTime,
        name: String(node.name || ""),
        code: String(node.code || ""),
        isActive: Boolean(node.is_active),
      });
    }
  }, [data]);

  const [updateBetType] = useMutation(UPDATE_BET_TYPE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBetType({
        variables: {
          id: betTypeId,
          name: formData.name,
          code: formData.code,
          isActive: formData.isActive,
          gameType: formData.gameType,
          drawTime: formData.drawTime,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Update Bet Type",
        text: "Bet type successfully updated!",
      });
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Swal.fire({
        icon: "error",
        title: "Update Bet Type",
        text: `Error occurred: ${errorMessage}`,
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
          <Headline>Update Bet Type</Headline>
        </div>
        <BetTypeForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => navigate(-1)}
        />
      </div>
    </AdminTemplate>
  );
};

export default UpdateBetTypePage;

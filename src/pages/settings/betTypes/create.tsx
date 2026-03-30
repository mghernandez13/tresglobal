import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { CREATE_BET_TYPE } from "../../../graphql/queries/betTypes";
import Swal from "sweetalert2";
import BetTypeForm from "../../../components/forms/BetTypeForm";
import type { BetTypeFormData } from "../../../components/forms/BetTypeForm";

const CreateBetTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BetTypeFormData>({
    gameType: "",
    drawTime: "",
    name: "",
    code: "",
    isActive: true,
  });

  const [createBetType] = useMutation(CREATE_BET_TYPE);

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
      await createBetType({
        variables: {
          name: formData.name,
          code: formData.code,
          isActive: formData.isActive,
          gameType: formData.gameType,
          ...(formData.drawTime && { drawTime: formData.drawTime }),
        },
      });
      Swal.fire({
        icon: "success",
        title: "Create Bet Type",
        text: "Bet type successfully added!",
      });
      navigate("/settings/bet-types");
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Swal.fire({
        icon: "error",
        title: "Create Bet Type",
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
          <Headline>Create Bet Type</Headline>
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

export default CreateBetTypePage;

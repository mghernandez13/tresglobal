import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { CREATE_LOTTO_TYPE } from "../../../graphql/queries/lotto";
import Swal from "sweetalert2";
import LottoTypeForm, {
  type LottoFormData,
} from "../../../components/forms/LottoTypeForm";

const CreateLottoTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LottoFormData>({
    gameType: "",
    drawTime: "",
    name: "",
    daysActive: [],
    isActive: true,
    numberOfDigits: 0,
    minNumber: 0,
    maxNumber: 0,
  });

  // fields that should only accept numeric values
  const numericFields = [
    "daysActive",
    "numberOfDigits",
    "minNumber",
    "maxNumber",
  ];

  const [createLottoType] = useMutation(CREATE_LOTTO_TYPE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      if (name === "daysActive") {
        // toggle day in the daysActive array
        setFormData((prev) => {
          const updated = prev.daysActive.includes(value)
            ? prev.daysActive.filter((d) => d !== value)
            : [...prev.daysActive, value];
          return { ...prev, daysActive: updated };
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: target.checked }));
      }
    } else if (numericFields.includes(name)) {
      // allow empty string or digits only
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createLottoType({
        variables: {
          gameType: formData.gameType,
          drawTime: formData.drawTime,
          name: formData.name,
          daysActive: formData.daysActive,
          isActive: formData.isActive,
          numberOfDigits: String(formData.numberOfDigits),
          minNumber: String(formData.minNumber),
          maxNumber: String(formData.maxNumber),
        },
      });
      Swal.fire({
        icon: "success",
        title: "Create Lotto Type",
        text: "Lotto type successfully added!",
      });
      navigate("/settings/lotto-types");
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Swal.fire({
        icon: "error",
        title: "Create Lotto Type",
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
          <Headline>Create Lotto Type</Headline>
        </div>
        <LottoTypeForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          title="Lotto Type"
          onCancel={() => navigate(-1)}
        />
      </div>
    </AdminTemplate>
  );
};

export default CreateLottoTypePage;

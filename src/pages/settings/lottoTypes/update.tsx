import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_LOTTO_TYPE,
  UPDATE_LOTTO_TYPE,
} from "../../../graphql/queries/lotto";
import Swal from "sweetalert2";
import type {
  GetLottoTypeQueryVariables,
  LottoQueryData,
} from "../../../types/api";
import LottoTypeForm, {
  type LottoFormData,
} from "../../../components/forms/LottoTypeForm";

const UpdateLottoTypePage: React.FC = () => {
  const navigate = useNavigate();
  const { lottoTypeId } = useParams<{ lottoTypeId: string }>();
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
    logo_image: "",
  });

  const numericFields = [
    "daysActive",
    "numberOfDigits",
    "minNumber",
    "maxNumber",
  ];

  const { data } = useQuery<LottoQueryData, GetLottoTypeQueryVariables>(
    GET_LOTTO_TYPE,
    {
      variables: { lottoTypeId: String(lottoTypeId) },
      fetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    const node = data?.lotto_typesCollection?.edges?.[0]?.node;
    if (node) {
      // draw_time comes back as "HH:MM:SS" from database; our select options expect "HH:MM"
      const raw = node.draw_time || "";
      const normalizedTime = raw ? raw.split(":").slice(0, 2).join(":") : "";
      setFormData({
        gameType: node.game_type || "",
        drawTime: normalizedTime,
        name: node.name || "",
        daysActive: node.days_active ?? [],
        isActive: Boolean(node.is_active),
        numberOfDigits: Number(node.number_of_digits || 0),
        minNumber: Number(node.min_number || 0),
        maxNumber: Number(node.max_number || 0),
        logo_image: node.logo_image || "",
      });
    }
  }, [data]);

  const [updateLottoType] = useMutation(UPDATE_LOTTO_TYPE);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      if (name === "daysActive") {
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
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logo_image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLottoType({
        variables: {
          id: lottoTypeId,
          gameType: formData.gameType,
          drawTime: formData.drawTime,
          name: formData.name,
          daysActive: formData.daysActive,
          isActive: formData.isActive,
          numberOfDigits: formData.numberOfDigits,
          minNumber: formData.minNumber,
          maxNumber: formData.maxNumber,
          logoImage: formData.logo_image,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Update Lotto Type",
        text: "Lotto type successfully updated!",
      });
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Swal.fire({
        icon: "error",
        title: "Update Lotto Type",
        text: `Error occurred: ${message}`,
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
          <Headline>Update Lotto Type</Headline>
        </div>
        <LottoTypeForm
          formData={formData}
          onChange={handleChange}
          onLogoChange={handleLogoChange}
          onSubmit={handleSubmit}
          loading={loading}
          title="Lotto Type"
          onCancel={() => navigate(-1)}
        />
      </div>
    </AdminTemplate>
  );
};

export default UpdateLottoTypePage;

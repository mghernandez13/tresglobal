import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Headline from "../../../components/generic/Headline";
import AdminTemplate from "../../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_BET_PRIZE } from "../../../graphql/queries/betPrizes";
import { GET_LOTTO_TYPES } from "../../../graphql/queries/lotto";
import Swal from "sweetalert2";
import BetPrizeForm, {
  type BetPrizeFormData,
} from "../../../components/forms/BetPrizeForm";
import type { LottoQueryData, LottoQueryVariables } from "../../../types/api";
import { useCheckUserPermissions } from "../../../hooks/useCheckUserPermission";

const CreateBetPrizePage: React.FC = () => {
  useCheckUserPermissions("Add Bet Prizes");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BetPrizeFormData>({
    lottoTypeId: "",
    betAmount: "",
    prize: "",
    isActive: true,
  });

  const { data: lottoData } = useQuery<LottoQueryData, LottoQueryVariables>(
    GET_LOTTO_TYPES,
    {
      variables: {
        first: 100,
        offset: 0,
        searchTerm: "%",
        filter: { and: [{ is_archive: { eq: false } }] },
        sortOrder: [{ name: "AscNullsFirst" }],
      },
    },
  );

  const [createBetPrize] = useMutation(CREATE_BET_PRIZE);

  const numericFields = ["betAmount", "prize"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
      return;
    }

    if (numericFields.includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBetPrize({
        variables: {
          lottoTypeId: formData.lottoTypeId,
          betAmount: Number(formData.betAmount),
          prize: Number(formData.prize),
          superJackpot: formData.super_jackpot,
          superJackpotMultiplier: Number(formData.super_jackpot_multiplier),
          isActive: formData.isActive,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Create Bet Prize",
        text: "Bet prize successfully added!",
      });
      navigate("/settings/bet-prizes");
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Swal.fire({
        icon: "error",
        title: "Create Bet Prize",
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
          <Headline>Create Bet Prize</Headline>
        </div>
        <BetPrizeForm
          formData={formData}
          lottoTypes={
            lottoData?.lotto_typesCollection?.edges
              ?.map((e) => ({
                id: e.node?.id ?? "",
                name: e.node?.name ?? "",
                gameType: e.node?.game_type ?? "",
                drawTime: e.node?.draw_time ?? "",
              }))
              .filter((item) => item.id !== "") ?? []
          }
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => navigate(-1)}
        />
      </div>
    </AdminTemplate>
  );
};

export default CreateBetPrizePage;

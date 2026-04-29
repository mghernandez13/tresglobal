import React, { useCallback, useEffect, useRef } from "react";
import Label from "../generic/Label";
import Input from "../generic/Input";
import SelectWithSearch from "../generic/SelectWithSearch";
import { useQuery } from "@apollo/client/react";
import { GET_LOTTO_TYPES } from "../../graphql/queries/lotto";
import type { LottoQueryData, LottoQueryVariables } from "../../types/api";
import type { SearchableSelectOption } from "../../types/generic";
import { formatDrawDate, isValueNumberic } from "../../utils/helper";
import Swal from "sweetalert2";
import { supabase } from "../../db/supabase";
import { UserAuth } from "../context/AuthContext";
import { useExtendedState } from "../../hooks/state";

interface ResultFormProps {
  initialValues?: {
    draw_date: string;
    draw_type: string;
    combination: string;
    password?: string;
  };
  onSubmit: (values: {
    draw_date: string;
    draw_type: string;
    combination: string;
    refresh?: boolean;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ResultForm: React.FC<ResultFormProps> = ({
  initialValues,
  onSubmit,
  loading,
}) => {
  const { session } = UserAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [createAnother, setCreateAnother, getLatestCreateAnother] =
    useExtendedState(false);
  const [form, setForm] = React.useState({
    draw_date: initialValues?.draw_date || "",
    draw_type: initialValues?.draw_type || "",
    combination: initialValues?.combination || "",
    password: initialValues?.password || "",
  });
  const [combInputs, setCombInputs] = React.useState<string[]>([]);

  const { data: lottoTypesData } = useQuery<
    LottoQueryData,
    LottoQueryVariables
  >(GET_LOTTO_TYPES, {
    variables: {
      first: 100,
      offset: 0,
      filter: { is_archive: { eq: false } },
      sortOrder: [{ name: "AscNullsFirst" }],
    },
    fetchPolicy: "network-only",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCombInputChange = (idx: number, value: string) => {
    if (!isValueNumberic(value) && value !== "") return;
    // Validate min/max if draw type is selected
    if (selectedLottoType && value !== "") {
      const num = Number(value);
      if (
        num < selectedLottoType.min_number ||
        num > selectedLottoType.max_number
      ) {
        Swal.fire({
          icon: "error",
          title: "Invalid Combination Value",
          text: `Each number must be between ${selectedLottoType.min_number} and ${selectedLottoType.max_number}.`,
        });
        return;
      }
    }
    const newInputs = [...combInputs];
    newInputs[idx] = value;
    setCombInputs(newInputs);
    setForm((prev) => ({ ...prev, combination: newInputs.join("-") }));
  };

  const handleSelectChange = (option: SearchableSelectOption) => {
    setForm((prev) => ({ ...prev, draw_type: option.value ?? "" }));
  };

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      // Show confirmation modal with details
      const lottoType = lottoTypesData?.lotto_typesCollection?.edges.find(
        (edge) => edge.node.id === form.draw_type,
      )?.node;
      const confirm = await Swal.fire({
        icon: "question",
        title: "Confirm Results Submission",
        html: `
          <div style="text-align:left">
            <b>Draw Date:</b> ${formatDrawDate(form.draw_date)}<br/>
            <b>Draw Type:</b> ${lottoType ? lottoType.name : form.draw_type}<br/>
            <b>Combination:</b> ${form.combination}
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;

      const { error } = await supabase.auth.signInWithPassword({
        email: session?.user.email || "",
        password: form.password,
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Invalid Password",
          text: "Invalid password. Please enter the correct Supabase password.",
        });
        return;
      }
      const latestCreateAnother = await getLatestCreateAnother();

      onSubmit({
        draw_date: form.draw_date,
        draw_type: form.draw_type,
        combination: form.combination,
        refresh: createAnother || latestCreateAnother,
      });
      // Reset form
      setForm({
        draw_date: "",
        draw_type: "",
        combination: "",
        password: "",
      });
      setCombInputs([]);
      setCreateAnother(false);
    },
    [
      lottoTypesData,
      form,
      session?.user.email,
      getLatestCreateAnother,
      onSubmit,
      createAnother,
      setCreateAnother,
    ],
  );

  const handleSaveAndAddAnother = useCallback(async () => {
    setCreateAnother(true);
    formRef.current?.requestSubmit();
  }, [setCreateAnother]);

  const selectedLottoType = lottoTypesData?.lotto_typesCollection?.edges.find(
    (edge) => edge.node.id === form.draw_type,
  )?.node;

  const lottoTypeOptions: SearchableSelectOption[] = (
    lottoTypesData?.lotto_typesCollection?.edges || []
  ).map(({ node }) => ({
    id: node.id,
    value: node.id,
    label: `${node.name} (${node.game_type})`,
    level: 0,
  }));

  useEffect(() => {
    if (selectedLottoType?.number_of_digits) {
      if (form.combination) {
        setCombInputs(form.combination.split("-"));
      } else {
        setCombInputs(Array(selectedLottoType.number_of_digits).fill(""));
      }
    } else {
      setCombInputs([]);
    }
  }, [form, selectedLottoType, lottoTypesData]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-[#1f2937] p-8 rounded-lg border border-gray-700 shadow-2xl w-full"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Draw Date</Label>
          <Input
            name="draw_date"
            type="date"
            value={form.draw_date}
            onChange={handleChange}
            placeholder="Draw Date"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Draw Type</Label>
          <SelectWithSearch
            data={lottoTypeOptions}
            name="draw_type"
            preSelectedOption={
              lottoTypeOptions.find((opt) => opt.value === form.draw_type) ||
              null
            }
            handleFormChange={handleSelectChange}
          />
        </div>
        {/* Combination input and label are only shown if a draw type is selected */}
        {selectedLottoType?.number_of_digits && form.draw_type ? (
          <div className="flex flex-col gap-2">
            <Label>Combination</Label>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(2.5rem, 1fr))`,
                maxWidth: "100%",
              }}
            >
              {Array.from({ length: selectedLottoType.number_of_digits }).map(
                (_, idx) => (
                  <Input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    className="text-center"
                    value={combInputs[idx] || ""}
                    onChange={(e) => handleCombInputChange(idx, e.target.value)}
                    required
                  />
                ),
              )}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveAndAddAnother}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md active:scale-95"
          >
            Save and Add Another
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-10 rounded-md transition-all shadow-md active:scale-95"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ResultForm;

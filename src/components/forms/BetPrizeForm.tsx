import React from "react";
import Label from "../generic/Label";
import Input from "../generic/Input";
import SearchableSelect from "../generic/SelectWithSearch";
import { formatTo12h } from "../../utils/helper";
export interface BetPrizeFormData {
  lottoTypeId: string;
  betAmount: string;
  prize: string;
  isActive: boolean;
}

export interface LottoTypeOption {
  id: string;
  name: string;
  gameType: string;
  drawTime: string;
}

interface BetPrizeFormProps {
  formData: BetPrizeFormData;
  lottoTypes: LottoTypeOption[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onCancel: () => void;
}

const BetPrizeForm: React.FC<BetPrizeFormProps> = ({
  formData,
  lottoTypes,
  onChange,
  onSubmit,
  loading,
  onCancel,
}) => {
  const selectedType = lottoTypes.find((lt) => lt.id === formData.lottoTypeId);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#1f2937] p-8 rounded-lg border border-gray-700 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <Label>Lotto Type</Label>
          <SearchableSelect
            name="lottoTypeId"
            data={lottoTypes.map((type) => ({
              id: type.id,
              label: type.name,
              level: 0,
            }))}
            preSelectedOption={
              lottoTypes
                .map((type) => ({
                  id: type.id,
                  label: type.name,
                  level: 0,
                }))
                .find((option) => option.id === formData.lottoTypeId) ?? null
            }
            handleFormChange={(option) =>
              onChange({
                target: {
                  name: "lottoTypeId",
                  value: option.id,
                  type: "select",
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
          />
        </div>

        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Game Type</Label>
            <Input
              name="gameType"
              value={selectedType?.gameType ?? ""}
              disabled
              readOnly
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Draw Time</Label>
            <Input
              name="drawTime"
              value={
                selectedType?.drawTime ? formatTo12h(selectedType.drawTime) : ""
              }
              disabled
              readOnly
            />
          </div>
        </div>

        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Bet Amount</Label>
            <Input
              name="betAmount"
              type="text"
              value={formData.betAmount}
              onChange={onChange}
              required
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Prize</Label>
            <Input
              name="prize"
              type="text"
              value={formData.prize}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={onChange}
            className="w-5 h-5 accent-yellow-500 bg-[#16191d] border-gray-600 rounded cursor-pointer"
          />
          <label className="text-gray-300 font-medium cursor-pointer">
            Active
          </label>
        </div>
      </div>
      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-all shadow-md active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-10 rounded-md transition-all shadow-md active:scale-95"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default BetPrizeForm;

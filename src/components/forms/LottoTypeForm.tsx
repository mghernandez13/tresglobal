import React from "react";
import { ChevronDown } from "lucide-react";
import { getTimes } from "../../utils/helper";
import { DAYS_OF_WEEK } from "../../types/constants";
import Label from "../generic/Label";
import Input from "../generic/Input";

export interface LottoFormData {
  gameType: string;
  drawTime: string;
  name: string;
  daysActive: string[];
  isActive: boolean;
  numberOfDigits: number;
  minNumber: number;
  maxNumber: number;
}

interface LottoTypeFormProps {
  formData: LottoFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  loading: boolean;
  title: string; // "Create" or "Update"
  onCancel: () => void;
}

const LottoTypeForm: React.FC<LottoTypeFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading,
  onCancel,
}) => {
  const times = getTimes();

  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#1f2937] p-8 rounded-lg border border-gray-700 shadow-2xl"
    >
      <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Game Type</Label>
            <div className="relative">
              <select
                name="gameType"
                value={formData.gameType}
                onChange={onChange}
                className="bg-[#16191d] border border-gray-600 text-white w-full p-2 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>
                  Select game type
                </option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="LP3">LP3</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDown />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Draw Time</Label>
            <div className="relative">
              <select
                name="drawTime"
                value={formData.drawTime}
                onChange={onChange}
                className="bg-[#16191d] border border-gray-600 text-white w-full p-2 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select time
                </option>
                {times.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Digits</Label>
            <Input
              type="text"
              name="numberOfDigits"
              value={
                formData.numberOfDigits !== 0 ? formData.numberOfDigits : ""
              }
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Min #</Label>
            <Input
              type="text"
              name="minNumber"
              value={formData.minNumber !== 0 ? formData.minNumber : ""}
              onChange={onChange}
              required
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Max #</Label>
            <Input
              type="text"
              name="maxNumber"
              value={formData.maxNumber !== 0 ? formData.maxNumber : ""}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <Label>Days Active</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="daysActive"
                    value={day}
                    checked={formData.daysActive.includes(day)}
                    onChange={onChange}
                    className="w-4 h-4 accent-yellow-500 bg-[#16191d] border-gray-600 rounded cursor-pointer"
                  />
                  <label className="text-gray-300 font-medium cursor-pointer">
                    {day.slice(0, 3)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-1/2">
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
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-10 rounded-md transition-all shadow-md active:scale-95 disabled:opacity-60"
        >
          {loading ? `Saving...` : `Save`}
        </button>
      </div>
    </form>
  );
};

export default LottoTypeForm;

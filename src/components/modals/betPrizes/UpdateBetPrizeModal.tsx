import React, { useState, useEffect } from "react";
import type { BetPrizesQueryData } from "../../../types/api";
import { X } from "lucide-react";
import Input from "../../generic/Input";
import Label from "../../generic/Label";

interface UpdateBetPrizeModalProps {
  open: boolean;
  onClose: () => void;
  prize: BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"] | null;
  onUpdate: (fields: {
    bet_amount: number;
    prize: number;
    is_active: boolean;
    super_jackpot?: boolean;
    super_jackpot_multiplier?: number | "";
  }) => void;
}

const UpdateBetPrizeModal: React.FC<UpdateBetPrizeModalProps> = ({
  open,
  onClose,
  prize,
  onUpdate,
}) => {
  const [betAmount, setBetAmount] = useState(prize?.bet_amount ?? 0);
  const [prizeValue, setPrizeValue] = useState(prize?.prize ?? 0);
  const [isActive, setIsActive] = useState(prize?.is_active ?? true);
  const [superJackpot, setSuperJackpot] = useState(
    prize?.super_jackpot ?? false,
  );
  const [superJackpotMultiplier, setSuperJackpotMultiplier] = useState(
    prize?.super_jackpot_multiplier ?? "",
  );

  useEffect(() => {
    if (open && prize) {
      setBetAmount(prize.bet_amount);
      setPrizeValue(prize.prize);
      setIsActive(prize.is_active);
      setSuperJackpot(prize.super_jackpot ?? false);
      setSuperJackpotMultiplier(prize.super_jackpot_multiplier ?? "");
    }
  }, [open, prize]);

  if (!open || !prize) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      bet_amount: betAmount,
      prize: prizeValue,
      is_active: isActive,
      super_jackpot: superJackpot,
      super_jackpot_multiplier: superJackpot
        ? Number(superJackpotMultiplier)
        : "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1f2937] border border-gray-700 w-full max-w-md p-8 rounded-lg shadow-2xl z-[70]">
        <button
          className="absolute top-3 right-3 text-white hover:text-gray-400"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-6 text-white">Update Bet Prize</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex w-full gap-5">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Bet Amount</Label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                placeholder="Bet Amount"
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Prize</Label>
              <Input
                type="number"
                value={prizeValue}
                onChange={(e) => setPrizeValue(Number(e.target.value))}
                placeholder="Prize"
                min={0}
                step={0.01}
                required
              />
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="flex items-center gap-2 mt-2 w-full md:w-1/2 pt-6">
              <input
                type="checkbox"
                checked={!!superJackpot}
                onChange={(e) => setSuperJackpot(e.target.checked)}
                className="w-5 h-5 accent-blue-500 bg-[#16191d] border-gray-600 rounded cursor-pointer"
              />
              <label className="text-gray-300 font-medium cursor-pointer">
                Enable Super Jackpot
              </label>
            </div>
            {superJackpot && (
              <div className="flex flex-col gap-2 w-full md:w-1/2 mt-2">
                <Label>Super Jackpot Multiplier</Label>
                <Input
                  name="super_jackpot_multiplier"
                  type="number"
                  step="0.01"
                  min="0"
                  value={superJackpotMultiplier}
                  onChange={(e) => {
                    // Prevent e, +, - and multiple dots
                    const val = e.target.value;
                    if (
                      /^(?![eE\+\-])\d*(\.\d{0,2})?$/.test(val) ||
                      val === ""
                    ) {
                      setSuperJackpotMultiplier(val);
                    }
                  }}
                  required={!!superJackpot}
                  pattern="^\\d+(\\.\\d{1,2})?$"
                  placeholder="0.00"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (
                      ["e", "E", "+", "-"].includes(e.key) ||
                      (e.key === "." &&
                        (String(superJackpotMultiplier).includes(".") ||
                          e.currentTarget.selectionStart === 0))
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Active</Label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 accent-yellow-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-yellow-500 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-600"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBetPrizeModal;

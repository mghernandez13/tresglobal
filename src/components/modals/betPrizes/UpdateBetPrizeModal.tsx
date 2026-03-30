import React, { useState, useEffect } from "react";
import type { BetPrizesQueryData } from "../../../types/api";
import { X } from "lucide-react";
import Input from "../../generic/Input";
import Label from "../../generic/Label";

interface UpdateBetPrizeModalProps {
  open: boolean;
  onClose: () => void;
  prize: BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"] | null;
  onUpdate: (fields: { bet_amount: number; prize: number; is_active: boolean }) => void;
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

  useEffect(() => {
    if (open && prize) {
      setBetAmount(prize.bet_amount);
      setPrizeValue(prize.prize);
      setIsActive(prize.is_active);
    }
  }, [open, prize]);

  if (!open || !prize) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ bet_amount: betAmount, prize: prizeValue, is_active: isActive });
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
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <Label>Active</Label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
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

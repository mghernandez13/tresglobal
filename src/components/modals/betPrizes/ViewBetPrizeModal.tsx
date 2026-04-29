import React from "react";
import type { BetPrizesQueryData } from "../../../types/api";
import { X } from "lucide-react";
import Input from "../../generic/Input";
import Label from "../../generic/Label";
import { formatCurrency } from "../../../utils/currency";
import { formatTo12h } from "../../../utils/helper";

interface ViewBetPrizeModalProps {
  open: boolean;
  onClose: () => void;
  prize: BetPrizesQueryData["bet_prizesCollection"]["edges"][0]["node"] | null;
}

const ViewBetPrizeModal: React.FC<ViewBetPrizeModalProps> = ({
  open,
  onClose,
  prize,
}) => {
  if (!open || !prize) return null;
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
        <h2 className="text-xl font-bold mb-6 text-white">View Bet Prize</h2>
        <div className="flex flex-col gap-6">
          <div className="flex w-full gap-5">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Game Type</Label>
              <Input
                type="text"
                disabled={true}
                value={prize.lotto_types.game_type}
                placeholder="Game Type"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Draw Name</Label>
              <Input
                type="text"
                disabled={true}
                value={prize.lotto_types.name}
                placeholder="Draw Name"
              />
            </div>
          </div>
          <div className="flex w-full gap-5">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Draw Time</Label>
              <Input
                type="text"
                disabled={true}
                value={formatTo12h(prize.lotto_types.draw_time)}
                placeholder="Draw Time"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Bet Amount</Label>
              <Input
                type="text"
                disabled={true}
                value={formatCurrency(prize.bet_amount)}
                placeholder="Bet Amount"
              />
            </div>
          </div>
          <div className="flex w-full gap-5">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Super Jackpot Enabled</Label>
              <Input
                type="text"
                disabled={true}
                value={prize.super_jackpot ? "Yes" : "No"}
                placeholder="Super Jackpot Enabled"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Super Jackpot Multiplier</Label>
              <Input
                type="text"
                disabled={true}
                value={prize.super_jackpot_multiplier ?? 0}
                placeholder="Super Jackpot Multiplier"
              />
            </div>
          </div>
          <div className="flex w-full gap-5">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Prize</Label>
              <Input
                type="text"
                disabled={true}
                value={formatCurrency(prize.prize)}
                placeholder="Prize"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <Label>Active</Label>
              <Input
                type="text"
                disabled={true}
                value={prize.is_active ? "Yes" : "No"}
                placeholder="Active"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBetPrizeModal;

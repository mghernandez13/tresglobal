import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_BETS } from "../../../graphql/queries/bets";
import { GET_LOTTO_TYPES } from "../../../graphql/queries/lotto";
import { CREATE_BETS } from "../../../graphql/queries/bets";
import PrimaryButton from "../../generic/buttons/Primary";
import SelectWithSearch from "../../generic/SelectWithSearch";
import Select from "../../generic/Select";
import Input from "../../generic/Input";
import Label from "../../generic/Label";
import { formatTo12h } from "../../../utils/helper";
import type {
  LottoQueryData,
  LottoQueryVariables,
  QueryParamsVariables,
} from "../../../types/api";
import type { UploadDummyBetModalProps } from "../../../types/bets";
import * as XLSX from "xlsx";
import Loading from "../../generic/icons/Loading";
import Swal from "sweetalert2";
import { UserAuth } from "../../context/AuthContext";

interface UploadDummyBetModalWithVarsProps extends UploadDummyBetModalProps {
  betsQueryVariables: QueryParamsVariables;
}

const UploadDummyBetModal: React.FC<UploadDummyBetModalWithVarsProps> = ({
  isOpen,
  onClose,
  agentOptions,
  betsQueryVariables,
}) => {
  const { session } = UserAuth();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;
  const [date, setDate] = useState(defaultDate);
  const [file, setFile] = useState<File | null>(null);
  const [drawType, setDrawType] = useState("");
  const [gameType, setGameType] = useState("");
  const [drawTime, setDrawTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<string>("");
  const [isFileValid, setIsFileValid] = useState(true);
  const [isAgentValid, setIsAgentValid] = useState(true);

  const { data: lottoTypesData, loading: lottoTypesLoading } = useQuery<
    LottoQueryData,
    LottoQueryVariables
  >(GET_LOTTO_TYPES, {
    variables: { first: 100, offset: 0 },
  });
  const [createBets] = useMutation(CREATE_BETS, {
    refetchQueries: [
      {
        query: GET_BETS,
        variables: betsQueryVariables,
      },
    ],
    awaitRefetchQueries: true,
  });

  const lottoTypes = useMemo(
    // Setup CREATE_BETS mutation
    () =>
      lottoTypesData?.lotto_typesCollection?.edges?.map((e) => e.node) || [],
    [lottoTypesData],
  );

  const modalReset = useCallback(() => {
    setFile(null);
    setAgent("");
    setDrawType("");
    setGameType("");
    setDrawTime("");
    setIsFileValid(false);
    setIsAgentValid(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setIsFileValid(true);
    } else {
      setIsFileValid(false);
    }
  };

  // Move file reading and parsing logic here
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      setIsLoading(true);
      e.preventDefault();
      if (!agent || agent.trim() === "") {
        setIsAgentValid(false);
        setIsLoading(false);
        return;
      } else {
        setIsAgentValid(true);
      }
      if (!file) {
        setIsFileValid(false);
        setIsLoading(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const arrayBuffer = ev.target?.result;
        if (!arrayBuffer) return;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });
        const errorDetails = {
          hasError: false,
          message: "",
        };

        // Skip header row if present
        for (let i = 0; i < jsonData.length; i++) {
          const row: string[] = jsonData[i] as string[];
          const bettor = row[0];
          const combinationAndAmount = row[1].split("=");
          const combination = combinationAndAmount[0];
          const amount = combinationAndAmount[1];
          if (!row[0] || !row[1] || !combination || !amount) continue;

          // Call CREATE_BETS mutation for each row
          try {
            const { error } = await createBets({
              variables: {
                lottoTypeId: drawType,
                bettor,
                betAmount: Number(amount),
                combination,
                isDummy: true,
                agent,
                createdBy: session?.user?.id || "",
              },
            });

            if (error) throw error;
          } catch (err) {
            errorDetails.hasError = true;
            errorDetails.message = String(err);

            break;
          }
        }

        Swal.fire({
          icon: errorDetails.hasError ? "error" : "success",
          title: "Upload Dummy Bet",
          text: errorDetails.hasError
            ? `Error occurred while uploading dummy bets: ${errorDetails.message}`
            : "Dummy bets uploaded successfully!",
        });

        modalReset();
        onClose();
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    },
    [agent, file, modalReset, onClose, createBets, drawType, session?.user?.id],
  );

  useEffect(() => {
    if (!drawType) return;
    const selected = lottoTypes.find((lt) => lt.id === drawType);
    if (selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameType(selected.game_type || "");
      setDrawTime(formatTo12h(selected.draw_time || ""));
    }
  }, [drawType, lottoTypes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#232b38] rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <h2 className="text-lg font-semibold mb-4 text-white">
          UPLOAD DUMMY BETS
        </h2>
        <p className="mb-6 text-gray-300">
          Are you sure you want to run this action?
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div
              className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-blue-400 rounded-lg bg-gray-800 hover:border-blue-500 transition-colors duration-150 mb-2"
              style={{ minHeight: 80 }}
            >
              <input
                type="file"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                id="dummy-bet-upload-input"
                onChange={handleFileChange}
              />
              <label
                htmlFor="dummy-bet-upload-input"
                className="flex flex-col items-center cursor-pointer w-full"
              >
                <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2">
                  Choose File
                </span>
                {!file && (
                  <span className="text-gray-400">
                    Drop file or click to choose
                  </span>
                )}
                {file && (
                  <span className="mt-2 text-green-400 text-xs">
                    {file.name}
                  </span>
                )}
                {!isFileValid && (
                  <span className="mt-2 text-red-400 text-xs">
                    Please upload a valid Excel file.
                  </span>
                )}
              </label>
            </div>
          </div>
          <div className="mb-4">
            <Label isRequired>Date</Label>
            <Input
              type="date"
              required
              className="block w-full text-sm p-1 text-gray-300 border border-gray-600 rounded-lg bg-gray-700 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label isRequired>Draw Type</Label>
            <Select
              required
              value={drawType}
              onChange={(e) => setDrawType(e.target.value)}
              disabled={lottoTypesLoading}
            >
              <option value="">Select Draw Type</option>
              {lottoTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="mb-4">
            <Label isRequired>Game Type</Label>
            <Input
              required
              value={gameType}
              readOnly
              className="block w-full text-sm p-1 text-gray-300 border border-gray-600 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <Label isRequired>Draw Time</Label>
            <Input
              required
              value={drawTime}
              readOnly
              className="block w-full text-sm p-1 text-gray-300 border border-gray-600 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <Label isRequired>Agent</Label>
            <SelectWithSearch
              data={agentOptions.map((opt) => ({
                id: opt.value || opt.id || "",
                value: opt.value || "",
                label: opt.label,
                level: 0,
              }))}
              name="agent"
              preSelectedOption={
                agentOptions.find((opt) => opt.value === agent)
                  ? {
                      id: agent,
                      value: agent,
                      label:
                        agentOptions.find((opt) => opt.value === agent)
                          ?.label || "",
                      level: 0,
                    }
                  : null
              }
              handleFormChange={(option) => {
                const newAgent = option.value || option.id || "";
                setAgent(newAgent);
                setIsAgentValid(!!newAgent && newAgent.trim() !== "");
              }}
            />
            {!isAgentValid && (
              <span className="mt-2 text-red-400 text-xs block">
                Please select an agent.
              </span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-600 text-gray-200 hover:bg-gray-700"
              onClick={onClose}
              disabled={isLoading}
            >
              {isLoading ? <Loading /> : "Cancel"}
            </button>
            <PrimaryButton type="submit">
              {isLoading ? <Loading /> : "Run Action"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDummyBetModal;

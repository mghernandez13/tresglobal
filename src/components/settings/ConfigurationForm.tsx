import React, { useCallback, useEffect, useState } from "react";
import Label from "../../components/generic/Label";
import Input from "../../components/generic/Input";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_SETTINGS, UPDATE_SETTING } from "../../graphql/queries/settings";
import type { SettingsQueryData } from "../../types/api";
import Swal from "sweetalert2";
import { betMainConfigs, betTimeConfigs } from "./configs";

const ConfigurationForm: React.FC = () => {
  const { data } = useQuery<SettingsQueryData>(GET_SETTINGS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });
  const [updateSettings, { loading }] = useMutation(UPDATE_SETTING);

  const [betTimeConfigForm, setBetTimeConfigForm] = useState(betTimeConfigs);
  const [form, setForm] = useState<{ [k: string]: number | string }>(
    () =>
      Object.fromEntries(betMainConfigs.map((c) => [c.value, c.default])) as {
        [k: string]: number;
      },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleBetTimeConfigChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { name, checked, value } = e.target;
    setBetTimeConfigForm((prev) => {
      const newConfig = [...prev];
      let key: keyof (typeof newConfig)[number] | null = null;
      if (name.endsWith("_draw_time")) key = "drawTime";
      else if (name.endsWith("_cutoff_time")) key = "cutoffTime";
      else if (name.endsWith("_is_active")) key = "isActive";
      if (key) {
        newConfig[index] = {
          ...newConfig[index],
          [key]: key === "isActive" ? Boolean(checked) : value,
        };
      }
      return newConfig;
    });
  };

  const handleSubmit = useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();

      const updatePromises = Object.entries(form).map(([name, value]) =>
        updateSettings({
          variables: { name, value: String(value) },
        }),
      );
      betTimeConfigForm.forEach((cfg) => {
        updatePromises.push(
          updateSettings({
            variables: {
              name: `${cfg.name}_draw_time`,
              value: cfg.drawTime,
            },
          }),
          updateSettings({
            variables: {
              name: `${cfg.name}_cutoff_time`,
              value: cfg.cutoffTime,
            },
          }),
          updateSettings({
            variables: {
              name: `${cfg.name}_is_active`,
              value: String(cfg.isActive),
            },
          }),
        );
      });

      Promise.all(updatePromises)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Settings Updated",
            text: "Settings have been successfully updated!",
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to update settings: ${error.message}`,
          });
        });
    },
    [betTimeConfigForm, form, updateSettings],
  );

  useEffect(() => {
    if (data?.settingsCollection?.edges) {
      const settingsMap = Object.fromEntries(
        data.settingsCollection.edges.map(({ node }) => [
          node.name,
          node.value,
        ]),
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => {
        const updated = { ...prev };
        betMainConfigs.forEach((cfg) => {
          if (settingsMap[cfg.value]) {
            updated[cfg.value] = Number(settingsMap[cfg.value]);
          } else {
            updated[cfg.value] = cfg.default;
          }
        });
        return updated;
      });

      setBetTimeConfigForm((prev) => {
        return prev.map((cfg) => ({
          ...cfg,
          drawTime: settingsMap[`${cfg.name}_draw_time`] || "",
          cutoffTime: settingsMap[`${cfg.name}_cutoff_time`] || "",
          isActive: settingsMap[`${cfg.name}_is_active`] === "true",
        }));
      });
    }
  }, [data]);

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="bg-[#232b3b] rounded-lg p-8 border border-gray-700">
        <h2 className="text-lg font-bold mb-6 text-white">
          Max Bet Per Combination
        </h2>
        <div className="flex flex-col gap-6">
          {betMainConfigs.map((cfg) => (
            <div key={cfg.value} className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="flex w-1/3 items-center gap-2">
                  <Label className="min-w-[12rem]">{cfg.label}</Label>
                </div>
                <div className="flex-col w-2/3 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-700 text-white px-2 py-1 rounded-l">
                      PHP
                    </span>
                    <Input
                      name={cfg.value}
                      type="number"
                      min={0}
                      value={form[cfg.value]}
                      onChange={handleChange}
                      className="w-32 rounded-l-none"
                    />
                  </div>
                  <span className="text-xs text-gray-400">{cfg.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {betTimeConfigForm.map((cfg, index) => (
        <div
          key={cfg.name}
          className="bg-[#232b3b] rounded-lg p-8 border border-gray-700"
        >
          <h2 className="text-lg font-bold mb-6 text-white">{cfg.label}</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex w-1/3 items-center gap-2">
                <Label className="w-56 min-w-[12rem]">
                  {cfg.label} Draw Time
                </Label>
              </div>
              <div className="flex-col w-2/3 items-center gap-2">
                <Input
                  type="time"
                  name={`${cfg.name}_draw_time`}
                  value={cfg.drawTime}
                  onChange={(e) => handleBetTimeConfigChange(e, index)}
                  className="w-32"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex w-1/3 items-center gap-2">
                <Label className="w-56 min-w-[12rem]">
                  {cfg.label} Cut-off Time
                </Label>
              </div>
              <div className="flex-col w-2/3 items-center gap-2">
                <Input
                  type="time"
                  name={`${cfg.name}_cutoff_time`}
                  value={cfg.cutoffTime}
                  onChange={(e) => handleBetTimeConfigChange(e, index)}
                  className="w-32"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Label className="w-56 min-w-[12rem]">Activate</Label>
              <input
                type="checkbox"
                name={`${cfg.name}_is_active`}
                checked={cfg.isActive}
                onChange={(e) => handleBetTimeConfigChange(e, index)}
                className="w-4 h-4 accent-yellow-500 bg-[#16191d] border-gray-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4 flex justify-end space-x-4">
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

export default ConfigurationForm;

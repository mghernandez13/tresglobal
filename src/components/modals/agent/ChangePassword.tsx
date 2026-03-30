import React, { useCallback, useState } from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import Label from "../../generic/Label";
import Input from "../../generic/Input";
import { useMutation } from "@apollo/client/react";
import { RESET_USER_PASSWORD } from "../../../graphql/queries/user";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../../generic/icons/Loading";
import { AnimatePresence, motion } from "framer-motion";

const ChangePasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    newPasswordError: false,
    confirmPasswordError: false,
    newPasswordErrorMessage: "",
    confirmPasswordErrorMessage: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [resetPassword, { loading }] = useMutation(RESET_USER_PASSWORD);

  const formValidation = useCallback(() => {
    if (formData.newPassword === "") {
      setFormData({
        ...formData,
        newPasswordErrorMessage: "Password is required",
        newPasswordError: true,
      });
      return false;
    }
    if (formData.confirmPassword === "") {
      setFormData({
        ...formData,
        newPasswordError: false,
        confirmPasswordErrorMessage: "Confirm Password is required",
        confirmPasswordError: true,
      });
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setFormData({
        ...formData,
        newPasswordError: false,
        confirmPasswordErrorMessage: "Password and Confirm Password mismatch!",
        confirmPasswordError: true,
      });
      return false;
    }

    setFormData({
      ...formData,
      newPasswordError: false,
      confirmPasswordError: false,
      newPasswordErrorMessage: "",
      confirmPasswordErrorMessage: "",
    });

    return true;
  }, [formData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async () => {
    if (!formValidation()) return;

    const { error } = await resetPassword({
      variables: {
        userId,
        password: formData.newPassword,
      },
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Change Password",
        text: `Error occurred while updating password: ${error.message}`,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Change Password",
        text: `Password successfully updated!`,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            className="relative bg-[#1f2937] border border-gray-700 w-full max-w-md p-8 rounded-lg shadow-2xl z-[70]"
          >
            <div>
              <button
                onClick={onClose}
                className="absolute bg-transparent top-4 right-4 text-white hover:border-none hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Change Password
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 relative">
                  <Label>New Password</Label>
                  <div className="relative w-full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent border-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.newPasswordError && (
                    <span className="text-red-500 italic text-xs">
                      {formData.newPasswordErrorMessage}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <Label>Confirm Password</Label>
                  <div className="relative w-full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => !showPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent border-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPasswordError && (
                    <span className="text-red-500 italic text-xs">
                      {formData.confirmPasswordErrorMessage}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-600 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
                  >
                    {loading ? <Loading /> : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;

import { useMutation } from "@apollo/client/react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { CREATE_RESULT } from "../../graphql/queries/results";
import ResultForm from "./ResultForm";
import AdminTemplate from "../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import Headline from "../../components/generic/Headline";

const CreateResultPage: React.FC = () => {
  const [createResult] = useMutation(CREATE_RESULT);
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    draw_date: string;
    draw_type: number | null;
    combination: string;
    refresh?: boolean;
  }) => {
    try {
      await createResult({ variables: values });
      Swal.fire({
        icon: "success",
        title: "Create Result",
        text: "Result successfully created!",
      });
      if (values.refresh) {
        window.location.reload();
      } else {
        navigate("/results");
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Create Result",
        text: `Error occurred while creating: ${e}`,
      });
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
          <Headline>Create Result</Headline>
        </div>
        <ResultForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/results")}
        />
      </div>
    </AdminTemplate>
  );
};

export default CreateResultPage;

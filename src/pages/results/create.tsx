import { useMutation } from "@apollo/client/react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { CREATE_RESULT } from "../../graphql/queries/results";
import ResultForm from "../../components/forms/ResultForm";
import AdminTemplate from "../../templates/AdminTemplate";
import { ArrowLeft } from "lucide-react";
import Headline from "../../components/generic/Headline";
import { CREATE_DRAW_RESULTS_LOG } from "../../graphql/queries/resultsLogs";
import { UserAuth } from "../../components/context/AuthContext";

// Types for createResult mutation
export interface CreateResultVariables {
  draw_date: string;
  draw_type: number;
  combination: string;
  refresh?: boolean;
}

export interface CreateResultResponse {
  insertIntodraw_resultsCollection: {
    records: Array<{
      id: number;
      draw_date: string;
      draw_type: number;
      combination: string;
      created_at: string;
    }>;
  };
}

const CreateResultPage: React.FC = () => {
  const [createResult] = useMutation<
    CreateResultResponse,
    CreateResultVariables
  >(CREATE_RESULT);
  const [createResultLog] = useMutation(CREATE_DRAW_RESULTS_LOG);
  const navigate = useNavigate();
  const { session } = UserAuth();

  const handleSubmit = async (values: {
    draw_date: string;
    draw_type: string;
    combination: string;
    refresh?: boolean;
  }) => {
    try {
      // Convert draw_type to number for type safety
      const variables: CreateResultVariables = {
        ...values,
        draw_type: Number(values.draw_type),
      };
      const { data } = await createResult({ variables });
      const insertedId =
        data?.insertIntodraw_resultsCollection?.records?.[0]?.id;
      if (insertedId) {
        await createResultLog({
          variables: {
            name: `CREATE`,
            status: "FINISHED",
            created_by: session?.user?.id, // Replace with actual user ID
            draw_result_id: insertedId,
          },
        });
      }
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

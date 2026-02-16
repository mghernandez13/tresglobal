import { AlertColors } from "../types/constants";
import { capitalizeFirstLetter } from "../utils/helper";

type NotificationAlertProps = {
  type: "error" | "success" | "info" | "warning";
  message: string;
  toggleDismiss: () => void;
};

const NotificationAlert: React.FC<NotificationAlertProps> = (props) => {
  const { type, message, toggleDismiss } = props;

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 text-sm text-${AlertColors[type]}-400 rounded-lg bg-${AlertColors[type]}-900/30 border border-${AlertColors[type]}-900/50`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="font-medium mr-1">{capitalizeFirstLetter(type)}!</span>
        {message}
      </div>

      <button
        type="button"
        onClick={toggleDismiss}
        className={`ml-4 -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-md text-${AlertColors[type]}-400 hover:bg-${AlertColors[type]}-900/50 focus:outline-none focus:ring-2 focus:ring-${AlertColors[type]}-800 transition-colors`}
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationAlert;

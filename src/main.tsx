import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.tsx";
import { AuthContextProvider } from "./components/context/AuthContext";
import ApolloWrapper from "./graphql/client.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <ApolloWrapper>
        <RouterProvider router={router} />
      </ApolloWrapper>
    </AuthContextProvider>
  </StrictMode>,
);

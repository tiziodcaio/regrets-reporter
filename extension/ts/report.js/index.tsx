import * as React from "react";
import * as ReactDOM from "react-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReportRegretForm } from "./components/ReportRegretForm";

ReactDOM.render(
  <ErrorBoundary>
    <ReportRegretForm />
  </ErrorBoundary>,
  document.getElementById("app"),
);

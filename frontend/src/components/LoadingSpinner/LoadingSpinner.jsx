import React from "react";
import { Spinner } from "react-bootstrap";
import "./LoadingSpinner.css";
export const LoadingSpinner = () => {
  return (
    <div className="spinnerStyle">
      <Spinner animation="grow" variant="warning" />
    </div>
  );
};

export default LoadingSpinner;

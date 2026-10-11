import React from "react";
import "./route-loader.css";

// import your SVG (use the taxi yellow one)
import Logo from "../../assets/queens_logo_1.svg";

const RouteLoader = () => {
  return (
    <div className="route-loader">
      <img src={Logo} alt="Loading..." className="loader-logo" />
    </div>
  );
};

export default RouteLoader;
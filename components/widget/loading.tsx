"use client"
import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "public/assets/loading.json";

const Loading = ({ style = { width: 120, height: 120 } }) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-white z-[9999]"
    style={{ minHeight: "100vh" }}
  >
    <Lottie animationData={loadingAnimation} loop={true} style={style} />
  </div>
);

export default Loading;



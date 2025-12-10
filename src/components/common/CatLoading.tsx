import Lottie from "lottie-react";
import cats from "@/assets/lottie/cats.json";

const CatLoading = () => {
  return <Lottie animationData={cats} className="lottie-loader w-full mx-auto" />;
};

export default CatLoading;

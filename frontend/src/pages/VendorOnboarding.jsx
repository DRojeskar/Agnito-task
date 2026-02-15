import { useEffect } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function VendorOnboarding() {
  const navigate = useNavigate();

//   const handleComplete = async () => {
//     try {
//       await api.completeOnboarding();
//       alert("Thank you! Your onboarding is completed.");
//       navigate("/vendor/dashboard");
//     } catch (err) {
//       alert(err.message);
//     }
//   };




const handleComplete = async () => {
  try {
    await api.completeOnboarding();
navigate("/vendor/dashboard");

    alert("Thank you! Your onboarding is completed.");

    
    window.location.href = "/vendor/dashboard";

  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Vendor Onboarding Page</h2>
      <p>Click below to complete onboarding.</p>
      <button onClick={handleComplete}>
        Complete Onboarding
      </button>
    </div>
  );
}

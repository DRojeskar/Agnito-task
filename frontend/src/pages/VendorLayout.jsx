import { Outlet, Link } from "react-router-dom";

export default function VendorLayout() {
  return (
    <div>
      <h1>Vendor Panel</h1>

      <nav style={{ marginBottom: "1rem" }}>
        <Link to="">Dashboard</Link> |{" "}
        <Link to="onboarding">Onboarding</Link>
      </nav>

      <Outlet />
    </div>
  );
}

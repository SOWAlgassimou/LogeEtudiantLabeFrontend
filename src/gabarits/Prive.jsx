import { Outlet } from "react-router-dom";

function Prive() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
}

export default Prive;


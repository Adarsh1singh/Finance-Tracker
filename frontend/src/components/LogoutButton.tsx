import { useNavigate } from "react-router";
import { logout } from "../services/authService";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    localStorage.setItem('isLoggenIn', 'false');
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </>
  );
};

export default LogoutButton;

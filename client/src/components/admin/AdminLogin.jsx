import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // For now, no authentication check
    navigate("/admin/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Login
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to the Job Portal Admin Panel. Click below to continue.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white text-lg py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}

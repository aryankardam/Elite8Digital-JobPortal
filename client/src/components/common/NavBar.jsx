import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = {
    user: [
      { name: "Jobs", path: "/" },
      // { name: "Careers", path: "/careers" },
      // { name: "Apply", path: "/apply" },
    ],
    admin: [
      { name: "Admin Login", path: "/admin/login" },
      // { name: "Dashboard", path: "/admin/dashboard" },
    ],
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            Elite8 Digital
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            <div className="flex space-x-6">
              {navLinks.user.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-blue-600 transition ${
                      isActive ? "font-semibold text-blue-600" : ""
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            <div className="border-l h-6 mx-4"></div>
            <div className="flex space-x-6">
              {navLinks.admin.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-blue-600 transition ${
                      isActive ? "font-semibold text-blue-600" : ""
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-4 py-3 space-y-2">
            <p className="text-sm font-semibold text-gray-500">User Portal</p>
            {navLinks.user.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="block text-gray-700 py-1 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
            <hr className="my-2" />
            <p className="text-sm font-semibold text-gray-500">Admin Portal</p>
            {navLinks.admin.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="block text-gray-700 py-1 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

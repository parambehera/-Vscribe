import React from "react";
// import HeroImage from "../assets/hero-image.png"; // replace with your image path
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const { user, login, isAuthenticated } = useKindeAuth();
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200">
  
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center justify-between min-h-screen px-6 py-20">
        {/* Left: Text Content */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 drop-shadow-lg">
            Collaborate. Create. Connect.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg">
            A modern platform to collaborate, create, and connect in real time.
            Experience seamless teamwork like never before.
          </p>
          <button 
            onClick={isAuthenticated ? () => navigate('/docs') : login}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 via-indigo-100 to-purple-100 text-black font-semibold rounded-3xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-300 cursor-pointer"
          >
            {isAuthenticated ? "Try Now" : "🔑 Sign In"}
          </button>
        </div>

        {/* Right: Image */}
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
          <img
            src="/photo1.webp"
            alt="Collaboration Illustration"
            className="w-full max-w-md rounded-3xl shadow-2xl"
          />
        </div>
      </div>

      {/* Optional decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300 rounded-full opacity-25 blur-3xl animate-pulse"></div>
    </div>
  );
};

export default Landing;

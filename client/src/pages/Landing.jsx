import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const Landing = () => {
  const { user, login, isAuthenticated } = useKindeAuth();
  const navigate = useNavigate();

  return (
    <>

      {/* <NavBar /> */}
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 text-center px-6 relative overflow-hidden">
      
      {/* Decorative blurred circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300 rounded-full opacity-25 blur-3xl animate-pulse"></div>

      {/* Main Content */}
      <div className="z-10 max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
         Collaborate. Create. <br />Connect.
        </h1>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
       A modern platform to collaborate, create, and connect in <br />
      real time. Experience seamless teamwork like never before.
        </p>

        <button
          onClick={isAuthenticated ? () => navigate("/docs") : login}
          className="mt-6 px-8 py-3 bg-black text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
        >
          {isAuthenticated ? "Start now" : "Start for free"}
        </button>
      </div>
    </div>
     </>
  );
};

export default Landing;

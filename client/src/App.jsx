import { useState } from "react";

import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";
import NavBar from "./components/NavBar";
import Sdocs from "./pages/Sdocs";
import AuthCallback from "./pages/AuthCallback";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <NavBar />
        <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/callback" element={<AuthCallback />} /> */}
        <Route path="/docs/:id" element={<Sdocs />} />
        <Route path="/docs" element={<Docs />} />
        {/* <Route path="/land" element={<Landing />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;

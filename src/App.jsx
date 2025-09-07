import React from "react";
import {  Routes ,Route } from "react-router-dom";
import { StartingPage } from "./components/startingpage.jsx";
import { StartGame } from "./components/gamepage.jsx";



function App() {
    return (
        <Routes>
            <Route path="/" element={<StartingPage />} />
            <Route path="/game" element={<StartGame />} />
        </Routes>
  );
}

export default App;

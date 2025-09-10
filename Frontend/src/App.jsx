// // import { Routes, Route } from "react-router-dom";
// import Landing from "./Pages/Landing/Landing.jsx";
// import Home from "./Pages/Home/Home.jsx";
// import LoginSignup from "./Pages/Login/LoginSignup.jsx";
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// function App() {
//   return (
//     <Router>

//     <Routes>
//       <Route path="/" element={<Landing />} />
//       {/* Later add Home, Login, etc. */}
//       <Route path="/home" element={<Home />} />
//     </Routes>
//     </Router>

//   );
// }

// export default App;
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import LoginModal from "./Pages/Home/LoginModal";
import Landing from "./Pages/Landing/Landing.jsx";
import Chatbox from "./Pages/Home/Chatbox.jsx";
import Dashboard from "./Pages/Home/Dashboard.jsx";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/login" element={<LoginModal />} />
       <Route path="/" element={<Landing />} />
     {/* Later add Home, Login, etc. */}
     <Route path="/home" element={<Home />} />
     <Route path="/chat" element={<Chatbox />} />
     <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  );
}

export default App;

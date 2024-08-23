import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/index";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";
import AddExpense from "./scenes/AddExpenses/AddExpenses";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Rota from "./scenes/Rota/Rota"; 
import ExpenseGroup from "./scenes/ExpenseGroup/ExpenseGroup";
import ManagePeoples from "./scenes/ManagePeople/ManagePeople";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <MainContent isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

const MainContent = ({ isSidebar, setIsSidebar }) => {
  const { currentUser } = useAuth();



  return (
    <div className="app">
      {currentUser && isSidebar && <Sidebar />}
      <main className="content">
        {currentUser && <Topbar setIsSidebar={setIsSidebar} />}
        <Routes>
        
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/manage-people" element={<ManagePeoples />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/form" element={<Form />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/pie" element={<Pie />} />
            <Route path="/line" element={<Line />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/group/:groupId" element={<ExpenseGroup />} />
            <Route path="/rota" element={<Rota />} /> 
            

          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;

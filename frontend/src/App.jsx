import React from "react";
import Home from "./Home";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import CreateEvent from "./CreateEvent";
import EditProfile from "./EditProfile";
import AdminDashboard from "./AdminDashboard";
import EventPage from "./EventPage";
import EventDirectory from "./EventDirectory";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/event/:slug" element={<EventPage />} />
          <Route
            path="/event/:eventId/directory"
            element={
              <ProtectedRoute>
                <EventDirectory />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'SUPER_ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
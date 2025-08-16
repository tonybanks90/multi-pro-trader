import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./services/themes/ThemeContext";
import { LanguageProvider } from "./services/i18n/LanguageContext";
import Dashboard from "./pages/Dashboard";
import "./index.css"; 

// 🧪 Test Component
function TestPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600">This is a Test Page ✅</h1>
      <p>You're seeing this because /test route is working.</p>
    </div>
  );
}

// Create a QueryClient instance
const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/test" component={TestPage} /> {/* 👈 Add test route */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

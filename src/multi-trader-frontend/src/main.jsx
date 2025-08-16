import React from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // adjust path if needed

import Header from "./components/shared/Header";
import { ThemeProvider } from "./services/themes/ThemeContext";
import { LanguageProvider } from "./services/i18n/LanguageContext";

import "./index.css";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Footer from "./components/layout/Footer";
import Try from "./pages/Try";
import TokenDetail from "./pages/TokenDetail";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <Header />
            <div className="p-4">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/portfolio" component={Portfolio} />
                <Route path="/token/:id" component={TokenDetail} />
                <Route path="/token" component={TokenDetail} />
                <Route path="/test" component={Try} />
                {/* Add more routes as needed */}
                <Route>404: Page not found</Route>
              </Switch>
            </div>
            <Footer />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

import React from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";

import Header from "./components/shared/Header";
import { ThemeProvider } from "./services/themes/ThemeContext";
import { LanguageProvider } from "./services/i18n/LanguageContext";

import "./index.css";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider>
    <LanguageProvider>
      <Router>
        <Header />
        <div className="p-4">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/portfolio" component={Portfolio} />
            <Route>404: Page not found</Route>
          </Switch>
        </div>
      </Router>
    </LanguageProvider>
  </ThemeProvider>
);

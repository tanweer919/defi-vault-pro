"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDemoMode } from "@/lib/hooks/useDemoMode";
import { DEMO_CONFIG } from "@/lib/config/demo";
import { Eye, EyeOff, Settings, AlertTriangle } from "lucide-react";

// This is a development helper component for quickly toggling demo functionality
// You can add this to any page during development to easily control demo availability
export const DemoToggle: React.FC = () => {
  const { isDemoMode, enableDemoMode, disableDemoMode, isDemoAvailable } =
    useDemoMode();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="p-4 border-dashed border-2 border-gray-300 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              Demo Controls (Dev Only)
            </h3>
            <p className="text-sm text-gray-600">
              Demo Available:{" "}
              <span
                className={isDemoAvailable ? "text-green-600" : "text-red-600"}
              >
                {isDemoAvailable ? "Yes" : "No"}
              </span>
              {" | "}
              Demo Active:{" "}
              <span
                className={isDemoMode ? "text-orange-600" : "text-gray-600"}
              >
                {isDemoMode ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isDemoAvailable && (
            <>
              {isDemoMode ? (
                <Button variant="outline" size="sm" onClick={disableDemoMode}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Exit Demo
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={enableDemoMode}>
                  <Eye className="w-4 h-4 mr-2" />
                  Enable Demo
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {!isDemoAvailable && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Demo functionality is disabled. Change <code>isDemoAllowed</code>{" "}
              to <code>true</code> in <code>src/lib/config/demo.ts</code> to
              enable it.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>
          <strong>Config:</strong> isDemoAllowed ={" "}
          {DEMO_CONFIG.isDemoAllowed.toString()}, showDemoInProduction ={" "}
          {DEMO_CONFIG.showDemoInProduction.toString()}
        </p>
      </div>
    </Card>
  );
};

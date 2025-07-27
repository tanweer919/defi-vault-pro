// Demo Configuration
// Set this to true to enable demo functionality for users
// Set this to false to completely disable demo mode
export const DEMO_CONFIG = {
  isDemoAllowed: process.env.NEXT_PUBLIC_IS_DEMO_ALLOWED === "true", // Change this to false to disable demo functionality
  // Demo data configuration
  showDemoInProduction: process.env.NEXT_PUBLIC_SHOW_DEMO_IN_PRODUCTION === "true", // Set to true if you want demo in production

  // Environment-based demo availability
  get isAvailable() {
    // Demo is only available if explicitly allowed AND either in development or showDemoInProduction is true
    return (
      this.isDemoAllowed &&
      (process.env.NODE_ENV === "development" || this.showDemoInProduction)
    );
  },
};

// Quick helper function to check if demo is available
export const isDemoAvailable = () => DEMO_CONFIG.isAvailable;

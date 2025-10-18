# Fix Hydration and Convex Errors in Dashboard

## Tasks
- [x] Modify useQuery condition in Dashboard.tsx to skip query until both isLoaded and isSignedIn are true
- [x] Add mounted state in DashboardInner to prevent rendering changes during hydration
- [x] Update rendering logic to show loading until component is mounted and plans are loaded
- [x] Test the changes to ensure hydration errors are resolved and Convex errors are avoided

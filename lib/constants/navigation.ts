type NavigationRoute = {
  href: string;
  translationKey: string;
};

type NavigationRoutes = {
  PUBLIC: NavigationRoute[];
  AUTHENTICATED: NavigationRoute[];
  ADMIN: NavigationRoute[];
};

export const NAVIGATION_ROUTES: NavigationRoutes = {
  PUBLIC: [],
  AUTHENTICATED: [
    {
      href: "/upload",
      translationKey: "upload.title",
    },
  ],
  ADMIN: [
    {
      href: "/admin",
      translationKey: "admin.title",
    },
  ],
};

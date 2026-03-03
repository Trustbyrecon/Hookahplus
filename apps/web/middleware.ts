import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/api/integrations/square/oauth/start",
    "/api/integrations/square/disconnect",
  ],
};


// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ... add other providers if needed
  ],
  // Optional: Add callbacks, database configuration, etc.
  callbacks: {
    async signIn({ user, account, profile }) { //removed email and credentials
      // You can control who can sign in here
      // Return true to allow sign in, false to deny
      console.log("signIn callback:", { user, account, profile }); // Debugging
      return true;
    },
    async session({ session, token }) {
        // Add custom properties to the session object here if needed
        if (token) {
            session.user = session.user || {}; //Ensure user object exists
            session.user.id = token.sub as string;  // VERY IMPORTANT. Cast to string
        }
        return session;
    },
    async jwt({ token, user }) { //removed unused parameters
        // Add custom properties to the JWT token here if needed
        if (user) {
            token.id = user.id;
        }
        return token;
    },
  },
    secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
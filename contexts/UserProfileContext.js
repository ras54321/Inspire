import { createContext, useContext } from "react";

const UserProfileContext = createContext({
  userProfile: null,
  refreshProfile: () => {},
  isLoading: false,
});

export const UserProfileProvider = UserProfileContext.Provider;

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};

export default UserProfileContext;

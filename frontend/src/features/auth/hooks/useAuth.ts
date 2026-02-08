import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { getToken, setToken, clearToken } from "../token";
import type { LoginData, RegisterData, ApiError } from "@/api/services/auth";
import type { AxiosError } from "axios";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const token = getToken();

  if (token) {
    api.setAccessToken(token);
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.auth.getUser(),
    enabled: Boolean(token),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => api.auth.login(data),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["user"], data.user);
      navigate("/dashboard", { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => api.auth.register(data),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["user"], data.user);
      navigate("/dashboard", { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      clearToken();
      queryClient.setQueryData(["user"], null);
      navigate("/login", { replace: true });
    },
  });

  const loginError = loginMutation.error as AxiosError<ApiError> | null;
  const registerError = registerMutation.error as AxiosError<ApiError> | null;

  return {
    user: user ?? null,
    isLoading: Boolean(token) && isLoading,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    loginError: loginError?.response?.data?.message,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    registerError: registerError?.response?.data?.message,
    registerFieldErrors: registerError?.response?.data?.errors,
    logout: () => logoutMutation.mutate(),
  };
}

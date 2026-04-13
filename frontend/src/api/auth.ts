import request from '../utils/request';

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
  };
}

export interface VerifyResponse {
  user: {
    id: string;
    name: string;
  };
}

export const authApi = {
  login: (password: string) => {
    return request.post<LoginResponse>('/auth/login', { password });
  },

  verify: () => {
    return request.get<VerifyResponse>('/auth/verify');
  },
};

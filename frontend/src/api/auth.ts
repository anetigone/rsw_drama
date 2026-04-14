import request from '../utils/request';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

export interface VerifyResponse {
  user: {
    id: string;
    username: string;
    name: string;
  };
}

export const authApi = {
  login: (username: string, password: string) => {
    return request.post<LoginResponse>('/auth/login', { username, password });
  },

  verify: () => {
    return request.get<VerifyResponse>('/auth/verify');
  },
};

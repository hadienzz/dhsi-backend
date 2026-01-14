export interface APIResponse {
  status: "success" | "error";
  message: string;
  data?: any;
  errors?: any;
}

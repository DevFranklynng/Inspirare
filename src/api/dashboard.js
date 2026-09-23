import { request } from "./client";

// Single role-aware summary endpoint. Shape differs for student vs
// instructor profiles — see AuthContext / Dashboard page for branching.
export async function fetchDashboard() {
  return request("/dashboard");
}

export function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "restaurant") return "/dashboard/restaurant";
  if (role === "delivery") return "/dashboard/delivery";
  return "/menu";
}

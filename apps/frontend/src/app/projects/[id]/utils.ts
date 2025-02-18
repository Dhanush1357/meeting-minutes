import { MoMStatus } from "./types";

export const getMoMStatusBadgeColor = (status: MoMStatus): string => {
  switch (status) {
    case MoMStatus.CREATED:
      return "bg-gray-100 text-gray-800";
    case MoMStatus.IN_REVIEW:
      return "bg-blue-100 text-blue-800";
    case MoMStatus.AWAITING_APPROVAL:
      return "bg-yellow-100 text-yellow-800";
    case MoMStatus.APPROVED:
      return "bg-green-100 text-green-800";
    case MoMStatus.NEEDS_REVISION:
      return "bg-red-100 text-red-800";
    case MoMStatus.CLOSED:
      return "bg-red-400 text-black";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

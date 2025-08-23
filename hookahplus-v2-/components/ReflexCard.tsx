import React from "react";
import Link from "next/link";

interface ReflexCardProps {
  id: string;
  title: string;
  description: string;
  status: "idle" | "active" | "completed" | "error";
  href?: string;
}

const ReflexCard: React.FC<ReflexCardProps> = ({
  id,
  title,
  description,
  status,
  href,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-blue-500 bg-blue-50";
      case "completed":
        return "border-green-500 bg-green-50";
      case "error":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const content = (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getStatusColor(
        status
      )}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-2">{description}</p>
      <span
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          status === "active"
            ? "bg-blue-100 text-blue-800"
            : status === "completed"
            ? "bg-green-100 text-green-800"
            : status === "error"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export default ReflexCard;

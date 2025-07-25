import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationBubbleProps {
  type: "success" | "error" | "info" | "loading";
  message: string;
  show?: boolean;
  position?: "top" | "bottom" | "right";
  className?: string;
}

export function ValidationBubble({ 
  type, 
  message, 
  show = true, 
  position = "right",
  className 
}: ValidationBubbleProps) {
  if (!show || !message) return null;

  const baseClasses = "absolute z-50 px-3 py-2 text-xs font-medium rounded-lg shadow-lg border transition-all duration-200 ease-in-out transform";
  
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2", 
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  const typeClasses = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    loading: "bg-gray-50 border-gray-200 text-gray-700"
  };

  const iconClasses = {
    success: "text-green-500",
    error: "text-red-500", 
    info: "text-blue-500",
    loading: "text-gray-500 animate-spin"
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    loading: AlertCircle
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      baseClasses,
      positionClasses[position],
      typeClasses[type],
      show ? "animate-in fade-in-0 zoom-in-95 scale-100 opacity-100" : "animate-out fade-out-0 zoom-out-95 scale-95 opacity-0",
      className
    )}>
      <div className="flex items-center space-x-2">
        <Icon className={cn("h-3 w-3", iconClasses[type])} />
        <span>{message}</span>
      </div>
      
      {/* Arrow/pointer */}
      <div className={cn(
        "absolute w-2 h-2 rotate-45 border",
        typeClasses[type],
        position === "right" && "left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-r-0 border-b-0",
        position === "top" && "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-b-0 border-l-0",
        position === "bottom" && "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-t-0 border-r-0"
      )} />
    </div>
  );
}
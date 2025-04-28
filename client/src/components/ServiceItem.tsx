import { LucideIcon } from "lucide-react";

interface ServiceItemProps {
  icon: LucideIcon;
  label: string;
  color: "blue" | "green" | "purple" | "orange";
}

export default function ServiceItem({ icon: Icon, label, color }: ServiceItemProps) {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-500 dark:text-blue-300"
        };
      case "green":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-500 dark:text-green-300"
        };
      case "purple":
        return {
          bg: "bg-purple-100 dark:bg-purple-900",
          text: "text-purple-500 dark:text-purple-300"
        };
      case "orange":
        return {
          bg: "bg-orange-100 dark:bg-orange-900",
          text: "text-orange-500 dark:text-orange-300"
        };
    }
  };
  
  const colors = getColorClasses();
  
  return (
    <div className="bg-muted p-3 rounded-lg flex items-center">
      <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center mr-2`}>
        <Icon className={colors.text} size={16} />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

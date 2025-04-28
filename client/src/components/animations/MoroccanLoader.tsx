import { motion } from "framer-motion";

interface MoroccanLoaderProps {
  className?: string;
}

export default function MoroccanLoader({ className }: MoroccanLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-16 h-16">
        {/* Outer octagon pattern */}
        <motion.div 
          className="absolute inset-0 border-2 border-primary"
          style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner star pattern */}
        <motion.div 
          className="absolute inset-2 bg-primary/10"
          style={{ clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ 
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        
        {/* Center circle */}
        <motion.div 
          className="absolute w-6 h-6 rounded-full bg-primary top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </div>
  );
}
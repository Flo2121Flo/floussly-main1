import { motion } from "framer-motion";

interface DecorativeBorderProps {
  className?: string;
}

export default function DecorativeBorder({ className }: DecorativeBorderProps) {
  // Generate a Moroccan-inspired pattern of decorative elements
  const cornerPattern = (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M1 1h20c5.523 0 10 4.477 10 10v10c0 5.523 4.477 10 10 10h18"
        stroke="url(#moroccan-gradient)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M59 59h-20c-5.523 0-10-4.477-10-10v-10c0-5.523-4.477-10-10-10H1"
        stroke="url(#moroccan-gradient)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M10 1l5 5-5 5M50 59l-5-5 5-5"
        stroke="url(#moroccan-gradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="moroccan-gradient" x1="1" y1="1" x2="59" y2="59" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E83151" />
          <stop offset="0.5" stopColor="#F6AE2D" />
          <stop offset="1" stopColor="#E83151" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top-left corner */}
      <motion.div 
        className="absolute top-0 left-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {cornerPattern}
      </motion.div>
      
      {/* Top-right corner (rotated) */}
      <motion.div 
        className="absolute top-0 right-0 rotate-90"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {cornerPattern}
      </motion.div>
      
      {/* Bottom-right corner (rotated) */}
      <motion.div 
        className="absolute bottom-0 right-0 rotate-180"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {cornerPattern}
      </motion.div>
      
      {/* Bottom-left corner (rotated) */}
      <motion.div 
        className="absolute bottom-0 left-0 -rotate-90"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {cornerPattern}
      </motion.div>
      
      {/* Decorative line animation across the border */}
      <motion.div
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      />
      
      <motion.div
        className="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      />
      
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      />
      
      <motion.div
        className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      />
    </div>
  );
}
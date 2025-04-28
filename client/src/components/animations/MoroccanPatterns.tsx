import { motion } from "framer-motion";

interface CornerAccentsProps {
  className?: string;
}

export const CornerAccents: React.FC<CornerAccentsProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top-left corner */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40"
        className="absolute top-0 left-0"
        fill="none"
      >
        <path 
          d="M0 8C0 3.58172 3.58172 0 8 0H40V8C40 12.4183 36.4183 16 32 16H0V8Z" 
          fill="url(#paint0_radial)" 
        />
        <path 
          d="M1 8C1 4.13401 4.13401 1 8 1H39V8C39 11.866 35.866 15 32 15H1V8Z" 
          stroke="currentColor"
          strokeOpacity="0.2" 
        />
        <defs>
          <radialGradient 
            id="paint0_radial" 
            cx="0" 
            cy="0" 
            r="1" 
            gradientUnits="userSpaceOnUse" 
            gradientTransform="translate(20 8) rotate(90) scale(16 40)"
          >
            <stop stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Top-right corner */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40"
        className="absolute top-0 right-0 rotate-90"
        fill="none"
      >
        <path 
          d="M0 8C0 3.58172 3.58172 0 8 0H40V8C40 12.4183 36.4183 16 32 16H0V8Z" 
          fill="url(#paint0_radial)" 
        />
        <path 
          d="M1 8C1 4.13401 4.13401 1 8 1H39V8C39 11.866 35.866 15 32 15H1V8Z" 
          stroke="currentColor"
          strokeOpacity="0.2" 
        />
        <defs>
          <radialGradient 
            id="paint0_radial" 
            cx="0" 
            cy="0" 
            r="1" 
            gradientUnits="userSpaceOnUse" 
            gradientTransform="translate(20 8) rotate(90) scale(16 40)"
          >
            <stop stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Bottom-right corner */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40"
        className="absolute bottom-0 right-0 rotate-180"
        fill="none"
      >
        <path 
          d="M0 8C0 3.58172 3.58172 0 8 0H40V8C40 12.4183 36.4183 16 32 16H0V8Z" 
          fill="url(#paint0_radial)" 
        />
        <path 
          d="M1 8C1 4.13401 4.13401 1 8 1H39V8C39 11.866 35.866 15 32 15H1V8Z" 
          stroke="currentColor"
          strokeOpacity="0.2" 
        />
        <defs>
          <radialGradient 
            id="paint0_radial" 
            cx="0" 
            cy="0" 
            r="1" 
            gradientUnits="userSpaceOnUse" 
            gradientTransform="translate(20 8) rotate(90) scale(16 40)"
          >
            <stop stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Bottom-left corner */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40"
        className="absolute bottom-0 left-0 -rotate-90"
        fill="none"
      >
        <path 
          d="M0 8C0 3.58172 3.58172 0 8 0H40V8C40 12.4183 36.4183 16 32 16H0V8Z" 
          fill="url(#paint0_radial)" 
        />
        <path 
          d="M1 8C1 4.13401 4.13401 1 8 1H39V8C39 11.866 35.866 15 32 15H1V8Z" 
          stroke="currentColor"
          strokeOpacity="0.2" 
        />
        <defs>
          <radialGradient 
            id="paint0_radial" 
            cx="0" 
            cy="0" 
            r="1" 
            gradientUnits="userSpaceOnUse" 
            gradientTransform="translate(20 8) rotate(90) scale(16 40)"
          >
            <stop stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export { default as MoroccanLoader } from './MoroccanLoader';
export { default as DecorativeBorder } from './DecorativeBorder';
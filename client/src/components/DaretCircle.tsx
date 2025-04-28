import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../lib/i18n';
import { Daret, DaretMember, User } from '@shared/schema';

interface DaretCircleProps {
  daret: Daret;
  members: Array<DaretMember & { user: User }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function DaretCircle({ 
  daret, 
  members, 
  className = '', 
  size = 'md' 
}: DaretCircleProps) {
  const { t } = useTranslation();
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  
  // Calculate sizes based on the size prop
  const circleSize = size === 'sm' ? 160 : size === 'md' ? 240 : 320;
  const innerCircleSize = circleSize * 0.4;
  const centerX = circleSize / 2;
  const centerY = circleSize / 2;
  const radius = (circleSize - 60) / 2; // Adjust radius to leave room for avatars
  const avatarSize = size === 'sm' ? 36 : size === 'md' ? 48 : 60;
  
  // Function to calculate position on the circle
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle - Math.PI/2); // Start from top (subtract PI/2)
    const y = centerY + radius * Math.sin(angle - Math.PI/2);
    return { x, y };
  };
  
  // Current cycle indicator
  const currentCycle = daret.currentCycle || 0;
  const totalCycles = daret.totalMembers || 0;
  const progress = (currentCycle / totalCycles) * 100;
  
  // Find the current member in rotation
  const currentMember = members.find(member => member.order === currentCycle);
  
  return (
    <Card className={`${className} hover:shadow-lg transition-shadow duration-300 overflow-hidden`}>
      <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-xl mb-2 text-primary">{daret.name}</h3>
          <Badge 
            variant={daret.status === 'active' ? 'default' : 
                    daret.status === 'payment_due' ? 'destructive' : 'outline'}
            className="rounded-full px-3 font-medium"
          >
            {t(`daret.status.${daret.status}`)}
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm mb-5 flex gap-2 items-center">
          <span className="px-3 py-1 bg-primary/10 rounded-full">{daret.amount} {daret.currency}</span>
          <span className="px-3 py-1 bg-secondary/10 rounded-full">{t("daret.members")}: {members.length}/{daret.totalMembers}</span>
        </div>
        
        <div className="relative" style={{ 
          width: circleSize, 
          height: circleSize,
          margin: '0 auto'
        }}>
          {/* Progress circle */}
          <svg className="absolute inset-0" viewBox={`0 0 ${circleSize} ${circleSize}`}>
            {/* Decorative elements */}
            <defs>
              <linearGradient id="circleGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Background circle with a subtle pattern */}
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius + 2} 
              fill="none" 
              stroke="hsl(var(--muted))" 
              strokeWidth="6"
              strokeDasharray="1,6"
              opacity="0.3"
            />
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius} 
              fill="none" 
              stroke="hsl(var(--muted))" 
              strokeWidth="4"
              strokeOpacity="0.4"
            />
            
            {/* Progress indicator with gradient and glow */}
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius}
              fill="none" 
              stroke="url(#circleGradient)" 
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * radius} 
              strokeDashoffset={2 * Math.PI * radius * (1 - progress / 100)}
              transform={`rotate(-90 ${centerX} ${centerY})`}
              strokeLinecap="round"
              filter="url(#glow)"
            />
            
            {/* Progress dots */}
            {progress > 0 && (
              <circle
                cx={centerX + radius * Math.cos(Math.PI * 2 * (progress / 100) - Math.PI / 2)}
                cy={centerY + radius * Math.sin(Math.PI * 2 * (progress / 100) - Math.PI / 2)}
                r="5"
                fill="white"
                filter="url(#glow)"
              />
            )}
          </svg>
          
          {/* Inner circle showing current cycle/total */}
          <div 
            className="absolute rounded-full flex flex-col items-center justify-center shadow-xl overflow-hidden"
            style={{ 
              width: innerCircleSize, 
              height: innerCircleSize,
              left: centerX - innerCircleSize/2,
              top: centerY - innerCircleSize/2,
            }}
          >
            {/* Gradient background with glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm"></div>
            
            {/* Shine effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-white/20 blur-sm rounded-full"></div>
            
            {/* Content with 3D-like effect */}
            <div className="flex flex-col items-center justify-center relative z-10 h-full w-full">
              <div className="relative">
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{currentCycle}/{totalCycles}</span>
                {/* Shadow for 3D effect */}
                <span className="text-2xl font-extrabold absolute -bottom-0.5 -right-0.5 text-black/10 blur-[0.5px]">{currentCycle}/{totalCycles}</span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mt-1">{t("daret.cycle")}</span>
            </div>
            
            {/* Border */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
          </div>
          
          {/* Members around the circle */}
          {members.map((member, index) => {
            const { x, y } = getPosition(index, members.length);
            const isCurrentTurn = member.order === currentCycle;
            const isNextTurn = member.order === currentCycle + 1;
            
            return (
              <div 
                key={member.id}
                className={`absolute transition-all duration-300 ${
                  hoveredMember === member.id ? 'scale-110 z-20' : ''
                }`}
                style={{ 
                  left: x - avatarSize/2, 
                  top: y - avatarSize/2,
                  width: avatarSize,
                  height: avatarSize
                }}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <Avatar 
                  className={`w-full h-full transition-all duration-300 ${
                    isCurrentTurn 
                      ? 'border-4 border-primary shadow-lg scale-110 z-10' 
                      : isNextTurn 
                        ? 'border-4 border-secondary shadow-md scale-105 z-5' 
                        : 'border-2 border-background shadow'
                  }`}
                >
                  <AvatarImage src={member.user.profileImage || ''} alt={member.user.name} />
                  <AvatarFallback className={`
                    text-white font-medium
                    ${isCurrentTurn 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : isNextTurn 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-primary/80 to-primary/60'}
                  `}>
                    {member.user.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Label that shows on hover */}
                {hoveredMember === member.id && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-popover backdrop-blur-sm border border-border rounded-full px-3 py-1 text-xs shadow-md z-20">
                    <span className="font-medium">{member.user.name}</span>
                    {isCurrentTurn && <span className="ml-1 text-primary font-medium">({t("daret.current")})</span>}
                    {isNextTurn && <span className="ml-1 text-secondary font-medium">({t("daret.next")})</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 space-y-3">
          {currentMember && (
            <div className="relative overflow-hidden backdrop-blur-sm rounded-xl border border-primary/20 shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
              <div className="p-3 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t("daret.currentTurn")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                    <AvatarImage src={currentMember.user.profileImage || ''} alt={currentMember.user.name} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      {currentMember.user.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-primary">{currentMember.user.name}</span>
                </div>
              </div>
            </div>
          )}
          
          {daret.nextPaymentDate && (
            <div className="relative overflow-hidden backdrop-blur-sm rounded-xl border border-secondary/20 shadow-md">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl -ml-8 -mb-8"></div>
              <div className="p-3 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t("daret.nextPayment")}</span>
                </div>
                <span className="px-3 py-1 bg-secondary/10 rounded-full text-xs font-semibold text-secondary">
                  {new Date(daret.nextPaymentDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
          
          <div className="pt-2 flex justify-center">
            <button className="text-xs font-medium text-primary/70 hover:text-primary flex items-center gap-1 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("daret.inviteFriends")}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
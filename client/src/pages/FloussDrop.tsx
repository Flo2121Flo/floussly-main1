import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '../lib/i18n';
import { ArrowLeft, MapPin, Coins, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import TreasureMap from '@/components/TreasureMap';
import { useTreasure } from '@/services/treasure';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Proximity indicator component
const ProximityIndicator = ({ distance }: { distance: number | null }) => {
  if (distance === null) return null;
  
  const getProximityStatus = (distance: number) => {
    if (distance <= 50) return { text: 'Hot', color: 'text-red-500' };
    if (distance <= 150) return { text: 'Warm', color: 'text-orange-500' };
    return { text: 'Cold', color: 'text-blue-500' };
  };

  const status = getProximityStatus(distance);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("text-sm font-medium", status.color)}
    >
      {status.text}
    </motion.div>
  );
};

export default function FloussDrop() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const {
    treasures,
    currentTreasure,
    loading,
    error,
    userLocation,
    fetchNearbyTreasures,
    unlockTreasure,
    claimTreasure,
    getDistanceToTreasure,
    isWithinTreasureRadius,
  } = useTreasure();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNearbyTreasures().catch((error) => {
      toast({
        title: t('treasure.errors.fetch_failed'),
        description: error.message,
        variant: 'destructive',
      });
    });
  }, [fetchNearbyTreasures, t]);

  const handleTreasureSelect = async (treasure: typeof treasures[0]) => {
    try {
      if (treasure.status === 'LOCKED') {
        if (!isWithinTreasureRadius(treasure)) {
          const distance = getDistanceToTreasure(treasure);
          toast({
            title: t('treasure.errors.too_far'),
            description: t('treasure.distance_away', { distance: Math.round(distance! / 1000) }),
            variant: 'default',
          });
          return;
        }

        await unlockTreasure(treasure.id);
        toast({
          title: t('treasure.unlocked'),
          description: t('treasure.unlocked_description', { amount: treasure.amount }),
          variant: 'default',
        });
      } else if (treasure.status === 'UNLOCKING') {
        if (!isWithinTreasureRadius(treasure)) {
          const distance = getDistanceToTreasure(treasure);
          toast({
            title: t('treasure.errors.too_far'),
            description: t('treasure.distance_away', { distance: Math.round(distance! / 1000) }),
            variant: 'default',
          });
          return;
        }

        await claimTreasure(treasure.id);
        toast({
          title: t('treasure.claimed'),
          description: t('treasure.claimed_description', { amount: treasure.amount }),
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: t('treasure.errors.action_failed'),
        description: error instanceof Error ? error.message : t('treasure.errors.unknown'),
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'UNLOCKING':
        return 'bg-blue-500/10 text-blue-500';
      case 'UNLOCKED':
        return 'bg-green-500/10 text-green-500';
      case 'EXPIRED':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNearbyTreasures();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="p-6 pt-12">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              className="flex items-center text-muted-foreground p-0 hover:bg-transparent"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("nav.back")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <Loader2 className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl mb-2">{t("floussdrop.title")}</h1>
          <p className="text-muted-foreground">{t("floussdrop.description")}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 pb-20">
        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <TreasureMap
            treasures={treasures}
            onTreasureSelect={handleTreasureSelect}
            className="h-[400px]"
          />
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("treasure.total_treasures")}</p>
                  <h3 className="text-2xl font-bold">{treasures.length}</h3>
                </div>
                <Coins className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("treasure.active_treasures")}</p>
                  <h3 className="text-2xl font-bold">
                    {treasures.filter(t => t.status === 'LOCKED' || t.status === 'UNLOCKING').length}
                  </h3>
                </div>
                <MapPin className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("treasure.total_value")}</p>
                  <h3 className="text-2xl font-bold">
                    {treasures.reduce((sum, t) => sum + t.amount, 0)} MAD
                  </h3>
                </div>
                <Clock className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Nearby Treasures List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {t("treasure.nearby")}
              </h3>
              
              {treasures.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    {t("treasure.no_treasures")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {treasures.map((treasure) => {
                      const distance = getDistanceToTreasure(treasure);
                      return (
                        <motion.div
                          key={treasure.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-all active:scale-[0.98]"
                          onClick={() => handleTreasureSelect(treasure)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-lg">
                                {treasure.amount} MAD
                              </h4>
                              <Badge variant="outline" className={getStatusColor(treasure.status)}>
                                {t(`treasure.status.${treasure.status.toLowerCase()}`)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {distance !== null && `${Math.round(distance)} m`}
                              <ProximityIndicator distance={distance} />
                            </div>
                          </div>
                          <Button
                            variant={treasure.status === 'LOCKED' ? 'outline' : 'default'}
                            size="sm"
                            disabled={!isWithinTreasureRadius(treasure)}
                            className="ml-4 min-w-[80px]"
                          >
                            {t(treasure.status === 'LOCKED' ? 'treasure.unlock' : 'treasure.claim')}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 
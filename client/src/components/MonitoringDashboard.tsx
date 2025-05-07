import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance';
import { errorTracker } from '@/utils/errorTracking';
import { networkMonitor } from '@/utils/networkMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricData {
  timestamp: number;
  value: number;
}

const MonitoringDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<MetricData[]>([]);
  const [errorData, setErrorData] = useState<MetricData[]>([]);
  const [networkData, setNetworkData] = useState<MetricData[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Performance metrics
      const perfMetrics = performanceMonitor.getMetrics();
      const perfData = perfMetrics.map(metric => ({
        timestamp: Date.now(),
        value: metric.value,
      }));
      setPerformanceData(prev => [...prev, ...perfData].slice(-50));

      // Error metrics
      const errorReports = errorTracker.getReports();
      const errorData = errorReports.map(report => ({
        timestamp: report.timestamp,
        value: 1,
      }));
      setErrorData(prev => [...prev, ...errorData].slice(-50));

      // Network metrics
      const networkReports = networkMonitor.getReports();
      const networkData = networkReports.map(report => ({
        timestamp: report.timestamp,
        value: networkMonitor.getAverageResponseTime(),
      }));
      setNetworkData(prev => [...prev, ...networkData].slice(-50));
    };

    const interval = setInterval(updateMetrics, 5000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoring Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {performanceMonitor.getMetrics().length} metrics
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {formatTimestamp(Date.now())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {errorTracker.getReports().length} errors
            </div>
            <div className="text-sm text-gray-500">
              Success rate: {networkMonitor.getSuccessRate().toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {networkMonitor.getAverageResponseTime().toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-500">
              Avg. response size: {(networkMonitor.getAverageResponseSize() / 1024).toFixed(1)}KB
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatTimestamp}
                      formatter={(value: number) => [`${value.toFixed(2)}ms`, 'Response Time']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={errorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatTimestamp}
                      formatter={(value: number) => [`${value}`, 'Errors']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={networkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatTimestamp}
                      formatter={(value: number) => [`${value.toFixed(2)}ms`, 'Response Time']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard; 
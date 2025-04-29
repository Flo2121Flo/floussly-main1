import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Tag, Alert, Statistic, Row, Col } from 'antd';
import { secureFetch } from '../lib/security';
import { useLanguage } from '../context/LanguageContext';

interface Alert {
  id: string;
  pattern: {
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  timestamp: number;
  details: Record<string, any>;
}

interface Pattern {
  type: string;
  count: number;
  lastDetected: string;
}

interface Stats {
  totalAlerts: number;
  totalPatterns: number;
  suspiciousTransactions: number;
  lastUpdated: string;
}

export const AMLDashboard: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsRes, patternsRes, statsRes] = await Promise.all([
          secureFetch(`/api/aml/users/${userId}/alerts`),
          secureFetch(`/api/aml/users/${userId}/patterns`),
          secureFetch(`/api/aml/users/${userId}/stats`)
        ]);

        setAlerts(alertsRes.alerts);
        setPatterns(patternsRes.patterns);
        setStats(statsRes.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const alertColumns = [
    {
      title: t('Type'),
      dataIndex: ['pattern', 'type'],
      key: 'type',
    },
    {
      title: t('Description'),
      dataIndex: ['pattern', 'description'],
      key: 'description',
    },
    {
      title: t('Severity'),
      dataIndex: ['pattern', 'severity'],
      key: 'severity',
      render: (severity: string) => {
        const color = severity === 'HIGH' ? 'red' : severity === 'MEDIUM' ? 'orange' : 'yellow';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: t('Date'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
  ];

  const patternColumns = [
    {
      title: t('Pattern Type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('Count'),
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: t('Last Detected'),
      dataIndex: 'lastDetected',
      key: 'lastDetected',
    },
  ];

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{t('AML Monitoring Dashboard')}</h1>
      
      {stats && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title={t('Total Alerts')}
                value={stats.totalAlerts}
                valueStyle={{ color: stats.totalAlerts > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('Suspicious Transactions')}
                value={stats.suspiciousTransactions}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('Patterns Detected')}
                value={stats.totalPatterns}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('Last Updated')}
                value={new Date(stats.lastUpdated).toLocaleString()}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={t('Recent Alerts')} className="mb-6">
        <Table
          columns={alertColumns}
          dataSource={alerts}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title={t('Detected Patterns')}>
        <Table
          columns={patternColumns}
          dataSource={patterns}
          loading={loading}
          rowKey="type"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}; 
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  FiTrendingUp, 
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';
import { IoStatsChart } from 'react-icons/io5';

const TelemetryChart = ({ data, deviceName }) => {
  const [chartType, setChartType] = useState('line'); // 'line', 'area', 'bar'
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: true,
    humidity: true,
    pressure: false,
    battery_level: false,
  });

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .slice()
      .reverse() // Show oldest to newest
      .map(item => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: item.temperature,
        humidity: item.humidity,
        pressure: item.pressure,
        battery_level: item.battery_level,
      }));
  }, [data]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const calcStats = (key) => {
      const values = data
        .filter(item => item[key] !== null && item[key] !== undefined)
        .map(item => item[key]);
      
      if (values.length === 0) return null;

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return { avg, min, max, count: values.length };
    };

    return {
      temperature: calcStats('temperature'),
      humidity: calcStats('humidity'),
      pressure: calcStats('pressure'),
      battery_level: calcStats('battery_level'),
    };
  }, [data]);

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold text-gray-900">
                {entry.value !== null && entry.value !== undefined
                  ? `${entry.value.toFixed(2)}${
                      entry.name === 'Temperature' ? '°C' :
                      entry.name === 'Humidity' ? '%' :
                      entry.name === 'Pressure' ? ' hPa' :
                      entry.name === 'Battery' ? '%' : ''
                    }`
                  : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <IoStatsChart className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No chart data available</p>
        <p className="text-gray-400 text-sm mt-1">
          Telemetry data is required to display charts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Chart Type Selector */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2 ${
              chartType === 'line'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiTrendingUp />
            Line Chart
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2 ${
              chartType === 'area'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiActivity />
            Area Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md transition text-sm font-medium flex items-center gap-2 ${
              chartType === 'bar'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiBarChart2 />
            Bar Chart
          </button>
        </div>

        {/* Metric Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 mr-2">Metrics:</span>
          {statistics?.temperature && (
            <button
              onClick={() => toggleMetric('temperature')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetrics.temperature
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              🌡️ Temperature
            </button>
          )}
          {statistics?.humidity && (
            <button
              onClick={() => toggleMetric('humidity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetrics.humidity
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              💧 Humidity
            </button>
          )}
          {statistics?.pressure && (
            <button
              onClick={() => toggleMetric('pressure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetrics.pressure
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              📊 Pressure
            </button>
          )}
          {statistics?.battery_level && (
            <button
              onClick={() => toggleMetric('battery_level')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetrics.battery_level
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              🔋 Battery
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statistics?.temperature && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-700">Temperature</span>
              <span className="text-2xl">🌡️</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-orange-600">Average:</span>
                <span className="font-bold text-orange-900">{statistics.temperature.avg.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">Min:</span>
                <span className="font-semibold text-orange-800">{statistics.temperature.min.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">Max:</span>
                <span className="font-semibold text-orange-800">{statistics.temperature.max.toFixed(2)}°C</span>
              </div>
            </div>
          </div>
        )}

        {statistics?.humidity && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-700">Humidity</span>
              <span className="text-2xl">💧</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600">Average:</span>
                <span className="font-bold text-blue-900">{statistics.humidity.avg.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Min:</span>
                <span className="font-semibold text-blue-800">{statistics.humidity.min.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Max:</span>
                <span className="font-semibold text-blue-800">{statistics.humidity.max.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {statistics?.pressure && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-700">Pressure</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-600">Average:</span>
                <span className="font-bold text-purple-900">{statistics.pressure.avg.toFixed(0)} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Min:</span>
                <span className="font-semibold text-purple-800">{statistics.pressure.min.toFixed(0)} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Max:</span>
                <span className="font-semibold text-purple-800">{statistics.pressure.max.toFixed(0)} hPa</span>
              </div>
            </div>
          </div>
        )}

        {statistics?.battery_level && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-700">Battery</span>
              <span className="text-2xl">🔋</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600">Average:</span>
                <span className="font-bold text-green-900">{statistics.battery_level.avg.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Min:</span>
                <span className="font-semibold text-green-800">{statistics.battery_level.min}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Max:</span>
                <span className="font-semibold text-green-800">{statistics.battery_level.max}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <IoStatsChart className="text-primary-500" />
            {deviceName || 'Device'} - Telemetry Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {chartData.length} data points
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              {selectedMetrics.temperature && statistics?.temperature && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Temperature"
                  activeDot={{ r: 5 }}
                />
              )}
              {selectedMetrics.humidity && statistics?.humidity && (
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Humidity"
                  activeDot={{ r: 5 }}
                />
              )}
              {selectedMetrics.pressure && statistics?.pressure && (
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Pressure"
                  activeDot={{ r: 5 }}
                />
              )}
              {selectedMetrics.battery_level && statistics?.battery_level && (
                <Line
                  type="monotone"
                  dataKey="battery_level"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Battery"
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              {selectedMetrics.temperature && statistics?.temperature && (
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  name="Temperature"
                />
              )}
              {selectedMetrics.humidity && statistics?.humidity && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorHumidity)"
                  name="Humidity"
                />
              )}
              {selectedMetrics.pressure && statistics?.pressure && (
                <Area
                  type="monotone"
                  dataKey="pressure"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorPressure)"
                  name="Pressure"
                />
              )}
              {selectedMetrics.battery_level && statistics?.battery_level && (
                <Area
                  type="monotone"
                  dataKey="battery_level"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorBattery)"
                  name="Battery"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              {selectedMetrics.temperature && statistics?.temperature && (
                <Bar
                  dataKey="temperature"
                  fill="#f97316"
                  name="Temperature"
                  radius={[8, 8, 0, 0]}
                />
              )}
              {selectedMetrics.humidity && statistics?.humidity && (
                <Bar
                  dataKey="humidity"
                  fill="#3b82f6"
                  name="Humidity"
                  radius={[8, 8, 0, 0]}
                />
              )}
              {selectedMetrics.pressure && statistics?.pressure && (
                <Bar
                  dataKey="pressure"
                  fill="#a855f7"
                  name="Pressure"
                  radius={[8, 8, 0, 0]}
                />
              )}
              {selectedMetrics.battery_level && statistics?.battery_level && (
                <Bar
                  dataKey="battery_level"
                  fill="#22c55e"
                  name="Battery"
                  radius={[8, 8, 0, 0]}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <IoStatsChart className="text-2xl text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Chart Information</p>
            <p>
              Displaying telemetry data for <strong>{deviceName || 'selected device'}</strong> with{' '}
              <strong>{chartData.length}</strong> data points. Use the controls above to switch between 
              chart types and toggle different metrics for comparison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryChart;

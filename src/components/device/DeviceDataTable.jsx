import React from 'react';
import { 
  FiWifi, 
  FiRadio, 
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';
import { IoSpeedometer } from 'react-icons/io5';


const DeviceDataTable = ({ data, type, formatDate, getSignalQuality }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FiLayers className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No data available</p>
        <p className="text-gray-400 text-sm mt-1">
          {type === 'telemetry' 
            ? 'No telemetry data found for the selected date range' 
            : 'No raw data records found for the selected date range'}
        </p>
      </div>
    );
  }


  if (type === 'telemetry') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary-50 to-blue-50 border-b-2 border-primary-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FiClock />
                  Timestamp
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                🌡️ Temperature
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                💧 Humidity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                📊 Pressure
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                🔋 Battery
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                📍 Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Custom Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, index) => (
              <tr key={row.telemetry_id || index} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {formatDate(row.timestamp)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.temperature !== null && row.temperature !== undefined ? (
                    <span className="font-semibold text-orange-600">
                      {row.temperature.toFixed(2)}°C
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.humidity !== null && row.humidity !== undefined ? (
                    <span className="font-semibold text-blue-600">
                      {row.humidity.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.pressure !== null && row.pressure !== undefined ? (
                    <span className="font-semibold text-purple-600">
                      {row.pressure.toFixed(0)} hPa
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.battery_level !== null && row.battery_level !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            row.battery_level > 60 ? 'bg-green-500' : 
                            row.battery_level > 30 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${row.battery_level}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-700">{row.battery_level}%</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.latitude !== null && row.longitude !== null ? (
                    <a
                      href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 font-mono text-xs underline"
                    >
                      {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.custom_data && Object.keys(row.custom_data).length > 0 ? (
                    <button
                      onClick={() => {
                        alert(JSON.stringify(row.custom_data, null, 2));
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      View JSON
                    </button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  // Raw Data Table
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiClock />
                Received At
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiLayers />
                Frame Counter
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiRadio />
                Port
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Payload
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Decoded
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiWifi />
                RSSI/SNR
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <IoSpeedometer />
                Frequency/DR
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Gateway
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Confirmed
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, index) => {
            const signalQuality = getSignalQuality ? getSignalQuality(row.rssi) : null;
            
            return (
              <tr key={row.data_id || index} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {formatDate(row.received_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold font-mono">
                    {row.fcnt}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                    FPort {row.fport}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                    {row.data_payload}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.decoded_payload && Object.keys(row.decoded_payload).length > 0 ? (
                    <button
                      onClick={() => {
                        alert(JSON.stringify(row.decoded_payload, null, 2));
                      }}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition"
                    >
                      View Decoded
                    </button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {signalQuality && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <FiWifi className={signalQuality.color} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${signalQuality.color} ${signalQuality.bgColor}`}>
                          {signalQuality.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-mono">RSSI: {row.rssi} dBm</span>
                        <br />
                        <span className="font-mono">SNR: {row.snr} dB</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-xs text-gray-600">
                    <span className="font-mono">{(row.frequency / 1000000).toFixed(2)} MHz</span>
                    <br />
                    <span className="font-semibold">DR{row.dr}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.gateway_name ? (
                    <div>
                      <div className="font-medium text-gray-900">{row.gateway_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{row.gateway_eui}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.confirmed ? (
                    <FiCheckCircle className="text-green-600 mx-auto text-lg" />
                  ) : (
                    <FiAlertCircle className="text-gray-400 mx-auto text-lg" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


export default DeviceDataTable;

export interface HourlyForecast {
  time: string; // e.g. "10 AM"
  temp: number;
  rainProb: number; // percentage 0-100
  code: number;
  emoji: string;
}

export interface DailyForecast {
  day: string; // e.g. "Today", "Thu", "Fri"
  maxTemp: number;
  minTemp: number;
  rainProb: number;
  condition: string;
  emoji: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  emoji: string;
  humidity: number;
  rainAmount: number; // mm
  windSpeed: number; // km/h
  rainProbabilityToday: number; // %
  advisory: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  locationLabel?: string;
  lastUpdated: string;
}

const WEATHER_CODES: Record<number, { condition: string; emoji: string }> = {
  0: { condition: 'Clear Sky', emoji: '☀️' },
  1: { condition: 'Mainly Clear', emoji: '🌤️' },
  2: { condition: 'Partly Cloudy', emoji: '⛅' },
  3: { condition: 'Overcast', emoji: '☁️' },
  45: { condition: 'Foggy', emoji: '🌫️' },
  48: { condition: 'Depositing Rime Fog', emoji: '🌫️' },
  51: { condition: 'Light Drizzle', emoji: '🌧️' },
  53: { condition: 'Moderate Drizzle', emoji: '🌧️' },
  55: { condition: 'Heavy Drizzle', emoji: '🌧️' },
  61: { condition: 'Slight Rain', emoji: '🌧️' },
  63: { condition: 'Moderate Rain', emoji: '🌧️' },
  65: { condition: 'Heavy Rain', emoji: '🌧️' },
  80: { condition: 'Rain Showers', emoji: '🌦️' },
  81: { condition: 'Moderate Rain Showers', emoji: '🌦️' },
  82: { condition: 'Violent Rain Showers', emoji: '⛈️' },
  95: { condition: 'Thunderstorm', emoji: '⛈️' },
  96: { condition: 'Thunderstorm with Hail', emoji: '⛈️' },
  99: { condition: 'Heavy Thunderstorm', emoji: '⛈️' },
};

export const weatherService = {
  /**
   * Fetch real-time weather and rain forecast from Open-Meteo API
   */
  async getLiveWeather(lat: number, lng: number, locationLabel?: string): Promise<WeatherData> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather service response error');
      const data = await res.json();

      const current = data.current || {};
      const hourlyData = data.hourly || {};
      const dailyData = data.daily || {};

      const code = current.weather_code ?? 0;
      const weatherMeta = WEATHER_CODES[code] || { condition: 'Partly Cloudy', emoji: '⛅' };

      // Parse hourly (next 12 hours starting from current hour)
      const currentHour = new Date().getHours();
      const hourly: HourlyForecast[] = [];
      if (hourlyData.time && Array.isArray(hourlyData.time)) {
        for (let i = currentHour; i < Math.min(currentHour + 12, hourlyData.time.length); i++) {
          const hourStr = new Date(hourlyData.time[i]).toLocaleTimeString([], { hour: 'numeric', hour12: true });
          const hCode = hourlyData.weather_code?.[i] ?? 0;
          hourly.push({
            time: hourStr,
            temp: Math.round(hourlyData.temperature_2m?.[i] ?? current.temperature_2m ?? 28),
            rainProb: hourlyData.precipitation_probability?.[i] ?? 0,
            code: hCode,
            emoji: (WEATHER_CODES[hCode] || weatherMeta).emoji,
          });
        }
      }

      // Parse daily (next 7 days)
      const daily: DailyForecast[] = [];
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (dailyData.time && Array.isArray(dailyData.time)) {
        for (let i = 0; i < Math.min(7, dailyData.time.length); i++) {
          const d = new Date(dailyData.time[i]);
          const dayName = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
          const dCode = dailyData.weather_code?.[i] ?? 0;
          const meta = WEATHER_CODES[dCode] || { condition: 'Clear', emoji: '☀️' };

          daily.push({
            day: dayName,
            maxTemp: Math.round(dailyData.temperature_2m_max?.[i] ?? 30),
            minTemp: Math.round(dailyData.temperature_2m_min?.[i] ?? 20),
            rainProb: dailyData.precipitation_probability_max?.[i] ?? 0,
            condition: meta.condition,
            emoji: meta.emoji,
          });
        }
      }

      const maxRainProbToday = daily[0]?.rainProb ?? 0;

      // Generate Agricultural Advisory based on rain forecast
      let advisory = 'Weather is favorable for routine farm activities.';
      if (maxRainProbToday > 70) {
        advisory = '🌧️ High probability of rain today (' + maxRainProbToday + '%). Avoid spraying pesticides and postpone harvesting.';
      } else if (maxRainProbToday > 40) {
        advisory = '⛅ Moderate chance of rain (' + maxRainProbToday + '%). Keep crops covered if harvesting.';
      } else if ((current.temperature_2m ?? 28) > 35) {
        advisory = '☀️ High temperature advisory (' + Math.round(current.temperature_2m) + '°C). Ensure adequate irrigation for crops.';
      }

      return {
        temp: Math.round(current.temperature_2m ?? 28),
        condition: weatherMeta.condition,
        emoji: weatherMeta.emoji,
        humidity: Math.round(current.relative_humidity_2m ?? 65),
        rainAmount: current.precipitation ?? 0,
        windSpeed: Math.round(current.wind_speed_10m ?? 10),
        rainProbabilityToday: maxRainProbToday,
        advisory,
        hourly,
        daily,
        locationLabel: locationLabel || 'Live Location',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (err) {
      console.warn('Fallback weather fetch error:', err);
      // Fallback mock weather if offline
      return {
        temp: 28,
        condition: 'Partly Cloudy',
        emoji: '⛅',
        humidity: 65,
        rainAmount: 0,
        windSpeed: 12,
        rainProbabilityToday: 20,
        advisory: 'Weather data is offline. Showing estimated forecast.',
        hourly: [
          { time: '10 AM', temp: 28, rainProb: 10, code: 0, emoji: '☀️' },
          { time: '1 PM', temp: 31, rainProb: 20, code: 2, emoji: '⛅' },
          { time: '4 PM', temp: 29, rainProb: 15, code: 1, emoji: '🌤️' },
          { time: '7 PM', temp: 26, rainProb: 5, code: 0, emoji: '🌙' },
        ],
        daily: [
          { day: 'Today', maxTemp: 31, minTemp: 22, rainProb: 20, condition: 'Partly Cloudy', emoji: '⛅' },
          { day: 'Tomorrow', maxTemp: 30, minTemp: 21, rainProb: 40, condition: 'Scattered Rain', emoji: '🌧️' },
          { day: 'Fri', maxTemp: 32, minTemp: 23, rainProb: 10, condition: 'Sunny', emoji: '☀️' },
        ],
        locationLabel: locationLabel || 'Mandya, Karnataka',
        lastUpdated: 'Just now',
      };
    }
  },
};

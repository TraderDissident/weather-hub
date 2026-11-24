/* Open-Meteo : prévisions, qualité de l'air, recherche de lieux. */
(function () {
  var BASE = 'https://api.open-meteo.com/v1/forecast';
  var AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  var GEO = 'https://geocoding-api.open-meteo.com/v1/search';

  // Seulement les grandeurs affichées : chaque colonne horaire en moins, ce sont 240 valeurs de moins à télécharger, lire et ranger.
  var CURRENT = 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
  var HOURLY = 'temperature_2m,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day,dew_point_2m,pressure_msl,snowfall';
  var DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant';
  var AIRQ = 'european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen';

  function coords(p) { return 'latitude=' + p.lat.toFixed(4) + '&longitude=' + p.lon.toFixed(4); }

  function columns(block, map) {
    var out = [];
    if (!block || !block.time) return out;
    for (var i = 0; i < block.time.length; i++) {
      var row = { t: block.time[i] };
      for (var k in map) { if (block[map[k]]) row[k] = block[map[k]][i]; }
      out.push(row);
    }
    return out;
  }

  function normalize(j) {
    var c = j.current || {};
    return {
      fetchedAt: Date.now(),
      tz: j.timezone,
      offset: j.utc_offset_seconds || 0,
      elevation: j.elevation,
      current: {
        t: c.time, temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m,
        isDay: c.is_day, precip: c.precipitation,
        code: c.weather_code, cloud: c.cloud_cover, pres: c.pressure_msl,
        wind: c.wind_speed_10m, dir: c.wind_direction_10m, gust: c.wind_gusts_10m
      },
      minutely: columns(j.minutely_15, { p: 'precipitation', code: 'weather_code' }),
      hourly: columns(j.hourly, {
        temp: 'temperature_2m', pop: 'precipitation_probability', precip: 'precipitation',
        code: 'weather_code', vis: 'visibility', wind: 'wind_speed_10m', dir: 'wind_direction_10m',
        gust: 'wind_gusts_10m', uv: 'uv_index', isDay: 'is_day', dew: 'dew_point_2m', pres: 'pressure_msl',
        snow: 'snowfall'
      }),
      daily: columns(j.daily, {
        code: 'weather_code', max: 'temperature_2m_max', min: 'temperature_2m_min', sunrise: 'sunrise', sunset: 'sunset',
        daylight: 'daylight_duration', uvMax: 'uv_index_max', precip: 'precipitation_sum', pop: 'precipitation_probability_max',
        windMax: 'wind_speed_10m_max', dir: 'wind_direction_10m_dominant'
      }),
      air: null,
      airAt: 0
    };
  }

  var A = {};

  A.forecastURL = function (p) {
    return BASE + '?' + coords(p) + '&timezone=auto&timeformat=unixtime&forecast_days=10&forecast_minutely_15=12' +
      '&wind_speed_unit=kmh&current=' + CURRENT + '&minutely_15=precipitation,weather_code&hourly=' + HOURLY + '&daily=' + DAILY;
  };

  A.forecast = function (p, timeout) {
    var t0 = Date.now();
    return SM.U.fetchJSON(A.forecastURL(p), timeout || 20000).then(function (j) {
      if (j.error) throw new Error(j.reason || 'invalid response');
      SM.diag.lastFetch = p.name + ' · ' + (Date.now() - t0) + ' ms · ' + new Date().toTimeString().slice(0, 8);
      SM.diag.info('forecast ok ' + p.name + ' · ' + (Date.now() - t0) + ' ms');
      SM.diag.beat('forecast ' + p.name);
      return normalize(j);
    });
  };

  A.air = function (p) {
    var t1 = Date.now();
    return SM.U.fetchJSON(AIR + '?' + coords(p) + '&timezone=auto&current=' + AIRQ, 15000).then(function (j) {
      SM.diag.info('air ok ' + p.name + ' · ' + (Date.now() - t1) + ' ms');
      SM.diag.beat('air ' + p.name);
      var c = j.current || {};
      return { aqi: c.european_aqi, pm10: c.pm10, pm25: c.pm2_5, no2: c.nitrogen_dioxide, o3: c.ozone,
        alder: c.alder_pollen, birch: c.birch_pollen, grass: c.grass_pollen };
    });
  };

  A.search = function (q) {
    var lang = SM.i18n.lang;
    return SM.U.fetchJSON(GEO + '?name=' + encodeURIComponent(q) + '&count=8&format=json&language=' + lang, 12000).then(function (j) {
      return (j.results || []).map(function (r) {
        return { id: 'g' + r.id, name: r.name, region: r.admin1 || '', country: r.country || '', lat: r.latitude, lon: r.longitude, tz: r.timezone };
      });
    });
  };

  SM.api = A;
})();

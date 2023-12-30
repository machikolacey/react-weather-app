import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import './styles.css';
import arrowRightIcon from '../images/icon-arrow-right.svg';


const api = {
  key: process.env.NEXT_PUBLIC_API_KEY, 
  url: process.env.NEXT_PUBLIC_ENDPOINT_URL
};

// Mapping of weather conditions to SVG file paths
const getWeatherIcon = (icon: string) => {
  const iconName = icon.replace(/[^\w-]/g, '-').toLowerCase();
  return `/images/${iconName}.svg`;
};

const formatTime = (timeString: string) => {
	if(timeString){
  	const [hour, minute, _] = timeString.split(":");
  	return `${hour}:${minute}`;
	}
	return timeString;
};
const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[date.getDay()];
  const dayOfMonth = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  return `${day}, ${dayOfMonth} ${month}`;
};

const todayDate = formatDate(new Date());
function convertConditionsToKeys(conditions) {
  const conditionKeys = conditions.toLowerCase().split(',').map((condition) => condition.trim());
  return conditionKeys;
}

function getSVGForCondition(icon) {
  return icon || null;
}



function Index() {
  const [search, setSearch] = useState("Brighton");
  const [weather, setWeather] = useState<any>(null); 
  const [forecast, setForecast] = useState([]);
	const [unit, setUnit] = useState("metric");
	const [timerId, setTimerId] = useState<number | null>(null);
	const [todayData, setTodayData] = useState<any>(null); 

	const handleFahrenheit = () => {
		setUnit("imperial");
	  fetchWeatherData(search, "imperial");
	};

	const handleCelsius = () => {
		setUnit("metric");
	  fetchWeatherData(search, "metric");
	};

  useEffect(() => {
    fetchWeatherData(search, unit); 
  }, []);

	const handleSearch = () => {
	  // Clear the previous timer
	  if (timerId) {
	    clearTimeout(timerId);
	  }

	  // Require at least 3 characters to trigger the search
	  if (search.length >= 3) {
	    // Set a new timer to trigger the search after 500ms (adjust the delay as needed)
	    const newTimerId = window.setTimeout(() => {
	      fetchWeatherData(search, unit);
	    }, 500);

	    setTimerId(newTimerId);
	  }
	};

	const formatAPIResponseDate = (dateString) => {
	  const [year, month, day] = dateString.split("-"); 
	  return `${day}/${month}/${year}`;
	};
 const fetchWeatherData = (location: string, unit: string | undefined = "") => {
    let url = `${api.url}${location}?key=${api.key}&elements=icon,address,conditions,humidity,cloudcover,sunrise,sunset,temp,datetime,tempmin,tempmax`;

    if (unit && unit === "metric") {
      // Append the unitGroup parameter only if unit is not "metric"
      url += `&unitGroup=${unit}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          // throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((result) => {
        const currentDate = new Date().toISOString().split("T")[0];
        const today = result?.days?.find((day) => day.datetime.startsWith(currentDate));
        setTodayData(today);
				setWeather(result);
      
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate());
        const nextFiveDaysForecast = result?.days?.filter((day) => {
          const forecastDate = new Date(day.datetime);
          return forecastDate >= tomorrow;
        });
    
        // Set the forecast for the next 5 days in state
        setForecast(nextFiveDaysForecast);
      })
      .catch((error) => {
         console.error("Error fetching weather data:", error.message);
      });
  };

  return (
    <>
      <Head>
        <title>Weather app</title>
      </Head>
      <div className="container-fluid">
			<div className="row h-100">
				<div className="col-lg-4 col-sm-12">
					<div className="left-column text-center">

						{/* Search Input */}
						<input
							type="text"
							className="d-inline search"
							placeholder="Enter area name..."
							value={search}
							onKeyUp={handleSearch}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<button 
							onClick={handleSearch}
							className="d-inline"
						>
							<img 
								src="/images/icon-arrow-right.svg" 
								className="icon-arrow-right" 
								alt="Submit" 
							/>
						</button>
						{/* ... */}

						{/* If today's weather data is available, display it */}
						{todayData  ? (
							<>
								{/* Location */}
								<h1 className="address">{weather?.address}</h1>
								<p  className="mt-3 mb-3 date">{formatDate(todayData.datetime)}</p>
								{/* Display today's data */}
								<img src={getWeatherIcon(todayData.icon)} 
									alt="Weather Icon" 
									className="weather-icon mt-3 mb-3" />

								{/* Current Temperature Celsius */}
								<p className="mt-3 mb-3 temp">
									 {todayData?.temp}
									<span className="unit">°{unit === "metric" ? "C" : "F"}</span>
								</p>
								<p className="mt-3 mb-3 conditions">
									{todayData.conditions}
								</p>
							</>
							) : (
								<p>Loading weather data...</p>
						)}
					</div>
				</div>
				<div className="col-lg-8 col-sm-12">
					<div className="float-left h-100">
						<div className="right-column mt-2 h-100">
							<div className="top-units text-right">
								<button onClick={handleCelsius}>
									<img 
										src="/images/icon-unit-c.svg" 
										className="icon-unit"
										alt="Change to celsius" 
										/>
								</button>
				      	<button onClick={handleFahrenheit}>
				      		<img 
				      			src="/images/icon-unit-f.svg" 
				      			className="icon-unit" 
				      			alt="Change to fahrenheit" 
				      			/>
				      	</button>

				      </div>
							<h2 className="mt-5 mb-5">Day overview</h2>

								{/* Humidity and cloud cover */}
								<div className="row">
									<div className="col-xl-6 col-lg-6 col-sm-6">
										<div className="box text-center">
											{/* Humidity */}
											<h3>Humidity</h3>
											<p className="data">{todayData?.humidity}%</p>
											<div className="progress-bar-wrapper">
												<div className="unit">%</div>
												<div className="progress-bar green">
													<div
													className="progress"
													style={{ width: `${todayData?.humidity}%` }}
													/>
													</div>
												</div>	
											</div>
										</div>
									<div className="col-xl-6 col-lg-6 col-sm-6">
										<div className="box text-center">
										{/* Cloud cover */}
										<h3>Cloud cover</h3> 
										<p className="data">{todayData?.cloudcover}%</p>
											<div className="progress-bar-wrapper">
												<div className="unit">%</div>
												<div className="progress-bar yellow">
													<div
													className="progress"
													style={{ width: `${todayData?.cloudcover}%` }}
													/>
													</div>
												</div>
											</div>
										</div>
								</div>

								{/* Min temp/ max temp/ sunrise/ sunset */}
								<div className="row">
									<div className="col-xl-3 col-lg-6 col-sm-6">
										<div className="box">
											<h3>Max temp</h3>
											<p className="data">{todayData?.tempmax}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
										</div>
									</div>
									<div className="col-xl-3 col-lg-6 col-sm-6">
										<div className="box">
											<h3>Min temp</h3>
											<p className="data">{todayData?.tempmin}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
										</div>
									</div>
									<div className="col-xl-3 col-lg-6 col-sm-6">
										<div className="box">
											<h3>Sunrise</h3>
											<p className="data">{formatTime(todayData?.sunrise)}</p>
										</div>
									</div>
									<div className="col-xl-3 col-lg-6 col-sm-6">
										<div className="box">
											<h3>Sunset:</h3>
											<p className="data">{formatTime(todayData?.sunset)}</p>
										</div>
									</div>
								</div>
								
								{/* 5 day forecast */}
								<div id="five-day-forcast-wrapper mt-5">
									<h2 className="mt-5 mb-3">5 day forecast</h2>
									{/* Display the 5-day forecast */}
									  {forecast.length > 0 ? (
						          <div className="row">
						            {/* The first element in forecast array is tomorrow's data */}
						            <div className="col-xl-20percent col-lg-4 col-sm-6" key={forecast[0].datetime}>
						              <div className="box">
						                <h3 className="date">{formatDate(forecast[0].datetime)}</h3>

						                {/* Display the weather icon */}
						                <img
						                  src={getWeatherIcon(forecast[0].icon)}
						                  alt="Weather Icon"
						                  className="weather-icon"
						                />
						                <p className="conditions data small">{forecast[0].conditions}</p>

						                <p className="small bottom left">{forecast[0].tempmin}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
						                <p className="small bottom right">{forecast[0].tempmax}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
						                {/* Add more weather information as needed */}
						              </div>
						            </div>

						            {/* The rest of the elements in forecast array are the next 4 days */}
						            {forecast.slice(1, 5).map((day) => (
						              <div className="col-xl-20percent col-lg-4 col-sm-6" key={day.datetime}>
						                <div className="box">
						                  <h3 className="date">{formatDate(day.datetime)}</h3>

						                  {/* Display the weather icon */}
						                  <div className="weather-icon-wrapper">
							                  <img
							                    src={getWeatherIcon(day.icon)}
							                    alt="Weather Icon"
							                    className="weather-icon"
							                  />
						                  </div>
						                  <p className="conditions data small">{day.conditions}</p>
						                  <p className="small bottom left">{day.tempmax}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
						                  <p className="small bottom right">{day.tempmin}<span className="unit">°{unit === "metric" ? "C" : "F"}</span></p>
						                 
						                  {/* Add more weather information as needed */}
						                </div>
						              </div>
						            ))}
						          </div>
						        ) : (
						          <p>Loading forecast...</p>
						        )}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

    </>
  );
}

export default Index;

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import cityNames from '../data/CityNames';
import airlineNames from '../data/AirlineNames';
import styles from '../styles/CheapestOnly.module.css';

function CheapestOnlyPage() {
  const router = useRouter();
  const {
    location1,
    location2,
    destinations = '',
    departureDate,
    adults,
    airlines,
  } = router.query;

  const destinationList =
    destinations && destinations.trim().length > 0
      ? destinations.split(',').map((destination) => destination.trim())
      : Object.keys(cityNames);

  const [flights, setFlights] = useState({});
  const [cheapestFlights, setCheapestFlights] = useState({});
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    if (location1 && location2 && departureDate && adults) {
      const apiKey = 'Z38kFL4gr2OGGPq6tG4ZOX7tayurhDfF';
      const apiSecret = '33r8UF8KI38pmuN0';
      const flightData = {};

      const fetchData = async () => {
        const tokenResponse = await fetch(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
          }
        );
        const { access_token } = await tokenResponse.json();

        let completedSearches = 0;

        for (const destination of destinationList) {
          const response1 = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${location1}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}`,
            {
              headers: {
                Authorization: 'Bearer ' + access_token,
              },
            }
          );
          const data1 = await response1.json();

          const response2 = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${location2}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}`,
            {
              headers: {
                Authorization: 'Bearer ' + access_token,
              },
            }
          );
          const data2 = await response2.json();

          if (data1.data && data1.data[0] && data2.data && data2.data[0]) {
            if (!flightData[destination]) flightData[destination] = {};
            flightData[destination].location1 = {
              total: parseFloat(data1.data[0].price.total),
              flight: data1.data[0],
            };
            flightData[destination].location2 = {
              total: parseFloat(data2.data[0].price.total),
              flight: data2.data[0],
            };
          }

          completedSearches++;
          setSearchProgress((completedSearches / destinationList.length) * 100);
        }

        const cheapestDestination = Object.entries(flightData).reduce(
          (cheapest, [destination, flightInfos]) => {
            const totalCost =
              flightInfos.location1.total + flightInfos.location2.total;
            return !cheapest || totalCost < cheapest.totalCost
              ? { destination, totalCost, ...flightInfos }
              : cheapest;
          },
          null
        );

        setFlights(flightData);
        setCheapestFlights(cheapestDestination);
      };

      fetchData();
    }
  }, [location1, location2, departureDate, adults, airlines]);

  return (
    <div className={styles.container}>
      <h1>Search Progress: {searchProgress.toFixed(2)}%</h1>
      {cheapestFlights &&
      cheapestFlights.location1 &&
      cheapestFlights.location2 ? (
        <div style={{ color: 'green' }}>
          <h2>Cheapest Destination: {cheapestFlights.destination}</h2>
          <h3>Total Cost: ${cheapestFlights.totalCost}</h3>
          <h3>Flight Details:</h3>
          <div>
            <h4>From {location1}:</h4>
            <p>
              Airline:{' '}
              {
                airlineNames[
                  cheapestFlights.location1.flight.validatingAirlineCodes
                ]
              }
            </p>
            <p>
              Departure:{' '}
              {
                cheapestFlights.location1.flight.itineraries[0].segments[0]
                  .departure.at
              }
            </p>
            <p>
              Arrival:{' '}
              {
                cheapestFlights.location1.flight.itineraries[0].segments[0]
                  .arrival.at
              }
            </p>
            <p>Price: ${cheapestFlights.location1.total}</p>
          </div>
          <div>
            <h4>From {location2}:</h4>
            <p>
              Airline:{' '}
              {
                airlineNames[
                  cheapestFlights.location2.flight.validatingAirlineCodes
                ]
              }
            </p>
            <p>
              Departure:{' '}
              {
                cheapestFlights.location2.flight.itineraries[0].segments[0]
                  .departure.at
              }
            </p>
            <p>
              Arrival:{' '}
              {
                cheapestFlights.location2.flight.itineraries[0].segments[0]
                  .arrival.at
              }
            </p>
            <p>Price: ${cheapestFlights.location2.total}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default CheapestOnlyPage;

// pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import cityNames from '../data/CityNames';
import airlineCodes from '../data/AirlineNames';

export default function HomePage() {
  const router = useRouter();
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [destinations, setDestinations] = useState(''); // Updated
  const [departureDate, setDepartureDate] = useState('');
  const [adults, setAdults] = useState('');
  const [cheapestOnly, setCheapestOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState(
    Object.keys(airlineCodes)
  );

  const handleAirlineSelection = (airline) => {
    setSelectedAirlines((prevSelectedAirlines) =>
      prevSelectedAirlines.includes(airline)
        ? prevSelectedAirlines.filter((a) => a !== airline)
        : [...prevSelectedAirlines, airline]
    );
  };

  const submitHandler = (event) => {
    event.preventDefault();
    router.push({
      pathname: cheapestOnly ? '/cheapestonly' : '/results',
      query: {
        location1,
        location2,
        destinations, // Updated
        departureDate,
        adults,
        airlines: selectedAirlines.join(','),
      },
    });
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <h1>Find Your Flight</h1>
        <input
          type="text"
          required
          placeholder="Location 1"
          value={location1}
          onChange={(e) => setLocation1(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Location 2"
          value={location2}
          onChange={(e) => setLocation2(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destinations (optional)" // Updated
          value={destinations}
          onChange={(e) => setDestinations(e.target.value)}
        />
        <input
          type="date"
          required
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />
        <input
          type="number"
          required
          placeholder="Number of Adults"
          value={adults}
          onChange={(e) => setAdults(e.target.value)}
        />
        <div>
          <label>Search for cheapest flight only</label>
          <input
            type="checkbox"
            checked={cheapestOnly}
            onChange={(e) => setCheapestOnly(e.target.checked)}
          />
        </div>
        <div>
          <label>Select Airlines</label>
          {Object.entries(airlineCodes).map(([code, name]) => (
            <div key={code}>
              <input
                type="checkbox"
                checked={selectedAirlines.includes(code)}
                onChange={() => handleAirlineSelection(code)}
              />
              <label>{name}</label>
            </div>
          ))}
        </div>
        <button type="submit">Search</button>
      </form>
    </div>
  );
}

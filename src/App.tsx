import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios'
import { Neows, NearEarthObject } from './types';
import { Container, Col, Row } from 'react-bootstrap'
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns'


function App() {

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [today, setToday] = useState<Date>()


  const startDateRange = format(startDate, 'yyyy-MM-dd')
  const endDateRange = format(endDate, 'yyyy-MM-dd')

  const todayDataUrl = `https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`
  const dateRangeUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateRange}&end_date=${endDateRange}&detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`

  const getData = async () => {

    const fetchedData = await axios.get(dateRangeUrl)
    return fetchedData.data
  }

  const { isLoading, isError, data } = useQuery<Neows, Error>('neob', getData, {
    enabled: Boolean(startDateRange && endDateRange)
  })

  console.log(data)

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Something went wrong!</h2>;


  const selectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: 'selection',
  }


  const handleSelect = (ranges: any) => {


    setStartDate(ranges.selection.startDate)
    setEndDate(ranges.selection.endDate)
    console.log(ranges)

  }


  return (

    <Container fluid>
      <Row>
        <Col md={10}>

          <DateRangePicker
            ranges={[selectionRange]}
            rangeColors={['#73B65C']}
            onChange={handleSelect}
          />
        </Col>
        {/* <Col md={2}>
          <button onClick={() => setToday(new Date())}>Today</button>
        </Col> */}
      </Row>


      <Row>
        <Col md={2}>
          <h5>Time/Date</h5>
        </Col>
        <Col md={2}>
          <h5>Asteroid name</h5>
        </Col>
        <Col md={2}>
          <h5>Potential Hazard</h5>
        </Col>
        <Col md={2}>
          <h5>Estimated Diameter (km)</h5>
        </Col>
        <Col md={2}>
          <h5>Miss distance (km)</h5>
        </Col>
        <Col md={2}>
          <h5>Velocity (km/h)</h5>
        </Col>

      </Row>


      {

        (Object as any).values(data?.near_earth_objects).flat()
          .slice(0, 10)
          .sort((a: any, b: any) => {
            const closestApproachDate = a.close_approach_data[0].close_approach_date_full
            const lastApproachDate = b.close_approach_data[0].close_approach_date_full

            return closestApproachDate.localeCompare(lastApproachDate);

          })
          .map((item: NearEarthObject) => (
            <Row key={item.id}>

              <Col md={2}>{
                item.close_approach_data[0].close_approach_date_full
              }</Col>
              <Col md={2}>{item.name}</Col>
              <Col md={2}>{
                item.is_potentially_hazardous_asteroid ? 'Yes' : 'No'
              }</Col>
              <Col md={2}>{item.estimated_diameter.meters.estimated_diameter_max}</Col>
              <Col md={2}>{item.close_approach_data[0].miss_distance.kilometers}</Col>
              <Col md={2}>{item.close_approach_data[0].relative_velocity.kilometers_per_hour}</Col>

            </Row>
          )
          )
      }


    </Container>
  );
}

export default App;

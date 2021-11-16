import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios'
import { Neows, NearEarthObject } from './types';
import { Container, Col, Row } from 'react-bootstrap'



function App() {


  const getData = async () => {

    const fetchedData = await axios(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`)
    return fetchedData.data
  }

  const { isLoading, isError, data } = useQuery<Neows, Error>('neob', getData)
  console.log(data)




  return (
    <Container fluid>
      <Row>
        <Col md={12}>

          {
            isLoading && <div><h4>Loading...</h4></div>
          }
          {
            isError && <div><h4>An error occured...</h4></div>

          }

        </Col>
      </Row>
      <Row>
        <Col md={2}>
          <h3>Time/Date</h3>
        </Col>
        <Col md={2}>
          <h3>Asteroid name</h3>
        </Col>
        <Col md={2}>
          <h3>Potential Hazard</h3>
        </Col>
        <Col md={2}>
          <h3>Estimated Diameter (km)</h3>
        </Col>
        <Col md={2}>
          <h3>Miss distance (km)</h3>
        </Col>
        <Col md={2}>
          <h3>Velocity (km/h)</h3>
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

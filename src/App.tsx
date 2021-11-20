import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios'
import { Neows, NearEarthObject } from './types';
import { Container, Col, Row } from 'react-bootstrap'
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns'

interface Notes {
  notes?: string;
}

interface InputNote {
  id: string;
  usernotes?: string;
}


function App() {

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startDateRange, setStartDateRange] = useState<string>('')
  const [endDateRange, setEndDateRange] = useState<string>('')
  const [notes, setNotes] = useState<Notes>({ notes: '' })
  const [userNotes, setUserNotes] = useState<InputNote[]>([])


  axios.defaults.baseURL = "https://api.nasa.gov/neo/rest/v1"
  const todayDataUrl = `/feed/today?detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`
  const dateRangeUrl = `/feed?start_date=${startDateRange}&end_date=${endDateRange}&detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`

  const getData = async () => {
    const fetchedData = await axios.get(startDateRange && endDateRange ? dateRangeUrl : todayDataUrl)
    return fetchedData.data
  }

  const { isLoading, isError, data } = useQuery<Neows, Error>(['neob', startDateRange, endDateRange], getData, {

    notifyOnChangeProps: 'tracked',
    cacheTime: Infinity,
    staleTime: 8000
  })


  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Something went wrong!</h2>;


  const selectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: 'selection',
  }


  console.log(notes.notes)

  const handleSelect = (ranges: any) => {

    setStartDate(ranges.selection.startDate)
    setEndDate(ranges.selection.endDate)

    setStartDateRange(format(startDate, 'yyyy-MM-dd'))
    setEndDateRange(format(endDate, 'yyyy-MM-dd'))

    console.log(ranges)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotes({ ...notes, [name]: value })

  }

  const handleAddNotes = (neob: NearEarthObject) => {
    if (notes.notes && notes.notes.length > 0 && data?.near_earth_objects && Object.values(data?.near_earth_objects).filter((item: NearEarthObject) => item.id === neob.id)) {
      setUserNotes([...userNotes, {
        id: neob.id,
        usernotes: notes.notes
      }])

      setNotes({ notes: '' })

    }

  }

  console.log(userNotes)

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

      </Row>


      <Row>
        <Col md={2}>
          <h5>Time/Date</h5>
        </Col>
        <Col md={1}>
          <h5>Asteroid name</h5>
        </Col>
        <Col md={1}>
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
        <Col md={2}>
          <h5>Add Notes</h5>
        </Col>

      </Row>


      {

        data?.near_earth_objects && Object.values(data?.near_earth_objects).flat()
          .slice(0, 50)
          .sort((a, b) => {
            const closestApproachDate = a.close_approach_data[0].close_approach_date_full
            const lastApproachDate = b.close_approach_data[0].close_approach_date_full

            return closestApproachDate.localeCompare(lastApproachDate);

          })
          .map((item: NearEarthObject) => (


            <Row key={item.id}>
              <Col md={2}>{
                item.close_approach_data[0].close_approach_date_full
              }</Col>
              <Col md={1}>{item.name}</Col>
              <Col md={1}>{
                item.is_potentially_hazardous_asteroid ? 'Yes' : 'No'
              }</Col>
              <Col md={2}>{item.estimated_diameter.meters.estimated_diameter_max}</Col>
              <Col md={2}>{item.close_approach_data[0].miss_distance.kilometers}</Col>
              <Col md={2}>{item.close_approach_data[0].relative_velocity.kilometers_per_hour}</Col>
              <Col md={2}>
                <span>{
                  userNotes.filter(neob => neob.id === item.id).map(neob => neob.usernotes)
                }</span>
                <input type="text"
                  name="notes"
                  onChange={handleInputChange}

                />
                <button onClick={() => handleAddNotes(item)}>Add</button>
              </Col>


            </Row>
          )
          )
      }


    </Container>
  );
}

export default App;

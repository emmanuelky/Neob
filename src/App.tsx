import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios'
import { Neows } from './types';



function App() {


  const getData = async () => {

    const fetchedData = await axios(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${process.env.REACT_APP_NASA_API_KEY}`)
    return fetchedData.data
  }

  const { isLoading, isError, data } = useQuery<Neows, Error>('neob', getData)
  console.log(data)




  return (
    <div className="">

    </div>
  );
}

export default App;

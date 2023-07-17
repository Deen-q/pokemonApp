import React, { useEffect, useState } from 'react';
import Card from './Card';
import PokeInfo from './PokeInfo';
import axios from 'axios';

export default function Main() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("https://pokeapi.co/api/v2/pokemon/");
  const [nextPageState, setNextPageState] = useState();
  const [prevPageState, setPrevPageState] = useState();


  useEffect(() => {
    let cancel // undefined, handled using the CancelToken
    const fetchData = async () => {
      try { // needed for error handling, below
        setLoading(true);

        // response -> overall data from initial API call
        const response = await axios.get(currentUrl, {
          cancelToken: new axios.CancelToken(c => cancel = c)
        });
       
        const results = response.data.results;
        const nextPage = response.data.next
        const prevPage = response.data.previous

    // 'async(p)=>' p for parameter, p = each element URL in 'results' array. Everything after => is executed for every .map iteration
        const entirePokemonArrayData = await Promise.all(results.map(async (p) => { 
          //map iterates over each URL + creates new array with corresponding promises
          
          // pokemonRes = response data for INDIVIDUAL Pokemon API call
          const pokemonRes = await axios.get(p.url); //p.url selects the url, instead of name (the only 2 available, 'url' or 'name')

          return pokemonRes.data;
        }));

        setLoading(false);
        setPokemon(entirePokemonArrayData); // !!! useState var 'pokemon' is now = to pokemonData
        setPrevPageState(prevPage)
        setNextPageState(nextPage)
        
      } catch (error) {
        console.error(error, "Uh-oh, useEffect Error");
        // Everything written in this error block is what code will be executed in the event there is an error.Good backup solution.
      }
    };

    fetchData();
    return () => cancel() //prevents old data from loading on top of newer data
  }, [currentUrl]); // end of useEffect

  if (loading) return "Loading...";

  return (
    <div className="Main_js_container">
      <div className="left-content">
        {pokemon.map((p, index) => (
          <Card key={index} pokemon={p} />
        ))} {/*.map creates a card per pokemon in the array
        ->for each element, in pokemon array --> execute the arrow function --> returns Card component with pokemon PROP
        ---> pokemon prop/pokemon data, symbolised as p for every iteration
        ----> p is a VARIABLE that holds value of the current pokemon data being processed by each iteration of .map function
        -> each card receives a different pokemon object as the pokemon prop*/}
        
        <div className="btn-div">
          {prevPageState && ( // prevPageState has a truthy value only when previous page URL is available. It does not on page 1. 
            <button onClick={()=> { setCurrentUrl(prevPageState)
          }} >Previous
          </button> )}

          <button
          onClick={()=> {
            setCurrentUrl(nextPageState)
          }} >Next</button>
        </div>
        
      </div>
      <div className="right-content">
        <PokeInfo />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchTerm } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)
    const [movies, setMovies] = useState([])
    const [trendingMovies, setTrendingMovies] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [debounceSearchTerm, setDebounceSearchTerm] = useState();

    useDebounce(() => setDebounceSearchTerm(searchTerm), 800, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const endpoint = query 
            ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
            : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            if(data.Response === "False") {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovies([]);
                return;
            }
            setMovies(data.results || []);
            if(query && data.results.length > 0) {
                await updateSearchTerm(query, data.results[0]);
            }
        }catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const trending = await getTrendingMovies();
            setTrendingMovies(trending);
        } catch (error) {
            console.error(`Error loading trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debounceSearchTerm);
    }, [debounceSearchTerm])

    useEffect(() => {
        loadTrendingMovies();
    }, [])

    return (
        <main>
            <div className="pattern"></div>
            <div className="wrapper">
                <header>
                <img src="./hero.png" alt="Hero Banner" />
                <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>
                {trendingMovies.length > 0 && (
                <section className='trending'>
                    <h2>Trending Movies</h2>
                    <ul>
                        {trendingMovies.map((movie, index) => (
                            <li key={movie.$id}>
                                <p>{index + 1}</p>
                                <img src={movie.poster_url ? movie.poster_url : './no-movie.png'} alt={movie.title} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

                <section className='all-movies'>
                    <h2 className='mt-[40px]'>All Movies</h2>
                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                            {movies.map((movie)=> (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App

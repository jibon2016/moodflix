import { Client, ID, Query, TablesDB } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
    .setProject(PROJECT_ID); 

const tablesDB = new TablesDB(client);

export const updateSearchTerm = async (searchTerm, movie) => {
    // 1. Use Appwrite SDK to check if the document exists
    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.equal('searchTerm', searchTerm)
            ]
        });
        
        // 2. If it exists, update the search term count
        if(result.total > 0) {
            const doc = result.rows[0];
            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: doc.$id,
                data: {
                    count: doc.count + 1,
                }
            });
        // 3. If it doesn't exist, create a new document with the search term count set to 1
        }else {
            await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'http://localhost:5173/no-movie.png',
                }
            });
        }
        
    } catch (error) {
        console.error('Error updating search term:', error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.limit(5),
                Query.orderDesc('count')
            ]
        });
        return result.rows;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}
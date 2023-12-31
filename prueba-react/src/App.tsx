import { useEffect, useState, useRef, useMemo } from "react";
import "./App.css";
import { UserList } from "./components/UserList";
import { SortBy, type User } from "./types.d";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [showColors, setShowColor] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<String | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const originalUsers = useRef<User[]>([]);
  // useRef --> para guardar un valor
  // que queremos que se comporta entre renderizados
  // pero que al cambiar, no vuelva a renderizar el componente

  const toggleColors = () => {
    setShowColor(!showColors);
  };
  //Este ordenaba por paieses pero hacemos el cambio
  // const toggleSortByCountry = () => {
  //   setSortByCountry((prevState) => !prevState);
  // };

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSortingValue);
  };

  const handleReset = () => {
    setUsers(originalUsers.current);
  };

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter((user) => user.email != email);
    setUsers(filteredUsers);
  };

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort);
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`https://randomuser.me/api/?results=10&seed=alex&page=${currentPage}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("error Forzado");
        return await res.json();
      })
      .then((res) => {
        setUsers(prevUsers =>  {
          const newUsers = prevUsers.concat(res.results)
          originalUsers.current = res.results;
          return newUsers
        })
      })
      .catch((err) => {
        setError(err);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  // const sortUsers = (users: User[]) => {
  //   console.log('sortUsers')
  //   return sortByCountry
  //     ? users.toSorted((a, b) => {
  //       return a.location.country.localeCompare(b.location.country);
  //     })
  //     : users;
  // }

  const filteredUsers = useMemo(() => {
    console.log("Calculeted filter Users");

    return filterCountry != null && filterCountry.length > 0
      ? users.filter((user) => {
          return user.location.country
            .toLowerCase()
            .includes(filterCountry.toLowerCase());
        })
      : users;
  }, [users, filterCountry]);

  const sortedUsers = useMemo(() => {
    console.log("Calculetd sortedUsers");
    //Una Forma de Hacerlo con Recod

    if (sorting === SortBy.NONE) return filteredUsers;

    const compareProperties: Record<string, (user: User) => any> = {
      [SortBy.COUNTRY]: (user) => user.location.country,
      [SortBy.NAME]: (user) => user.name.first,
      [SortBy.LAST]: (user) => user.name.last,
    };

    return filteredUsers.toSorted((a, b) => {
      const extractProperty = compareProperties[sorting];
      return extractProperty(a).localeCompare(extractProperty(b));
    });
  }, [filteredUsers, sorting]);
  //Es una forma de hacerlo con condicionales
  // if (sorting === SortBy.NONE) return filteredUsers

  // if (sorting === SortBy.NAME){
  //   return filteredUsers.toSorted(
  //     (a, b) => a.name.first.localeCompare(b.name.first)
  //   )
  // }
  // if (sorting === SortBy.LAST){
  //   return filteredUsers.toSorted(
  //     (a, b) => a.name.last.localeCompare(b.name.last)
  //   )
  // }
  // if (sorting === SortBy.COUNTRY){
  //   return filteredUsers.toSorted(
  //     (a, b) => a.location.country.localeCompare(b.location.country)
  //   )
  // }

  // const sortedUsers = sortByCountry
  //   ? filteredUsers.toSorted((a, b) => {
  //       return a.location.country.localeCompare(b.location.country);
  //     })
  //   : filteredUsers;

  return (
    <div className="App">
      <h1>Prueba React</h1>
      <header>
        <button onClick={toggleColors}>Colorear Fila</button>
        <button onClick={toggleSortByCountry}>
          {sorting === SortBy.COUNTRY
            ? "No ordenar por país"
            : "Ordenar por País"}
        </button>
        <button onClick={handleReset}>Resetear Estado</button>

        <input
          placeholder="Filtrar por país"
          onChange={(e) => {
            setFilterCountry(e.target.value);
          }}
        />
      </header>
      <main>
      {users.length > 0 && (
          <UserList
            changeSorting={handleChangeSort}
            deleteUser={handleDelete}
            showColors={showColors}
            users={sortedUsers}
          />
        )}
        {loading && <p>Cargando ...</p>}
        {!loading && error && <p>Lo siento habiedo un error</p>}
        {!loading && !error && users.length === 0 && <p>No hay Usuarios</p>}

        {!loading && !error && <button onClick={() => setCurrentPage(currentPage + 1)} >Cargar más resultados</button>}
      </main>
    </div>
  );
}

export default App;

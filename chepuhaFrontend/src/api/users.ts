import {User} from '../shared/types'

export async function fetchUser(): Promise <{users: User[]}>{
  const response = await fetch('https://jsonplaceholder.typicode.com/users');//поки тестовий апі
  if (!response.ok){
  throw new Error ("Error");
}
  const data: User[] = await response.json();
  return {users: data};
}

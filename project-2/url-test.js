import { URL } from "url";

const myUrl = new URL('http://localhost:3000/user?name=fathur&id=123');
console.log(myUrl.toString())
const name = myUrl.searchParams.get('name')
const id = myUrl.searchParams.get('id')

const newId = myUrl.searchParams.set('id', 456);
const newName = myUrl.searchParams.set('name', 'budi');
const sameKey = myUrl.searchParams.append('id', 789);

console.log(name)
console.log(newName)
console.log(id)
console.log(newId)
console.log(sameKey)
console.log(myUrl.href)

const newurl = new URL(myUrl.toString());
console.log(newurl.searchParams.getAll('id'))
console.log(newurl.searchParams.get('id'))
console.log(newurl.searchParams.delete('id'))
console.log(newurl.searchParams.getAll('id'))
console.log(newurl.href)
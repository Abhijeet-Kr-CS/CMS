import { redirect } from 'next/navigation';

export default function UserIndex() {
  redirect('/user/book');
  return null;
} 
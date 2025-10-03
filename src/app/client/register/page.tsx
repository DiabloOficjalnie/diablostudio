// This page redirects to the main login page
// Keeping only one login system at /login
import { redirect } from 'next/navigation'

export default function ClientRegisterPage() {
  redirect('/login')
}

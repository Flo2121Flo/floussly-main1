import { useQuery } from "@tanstack/react-query";
import { Contact } from "@/components/ContactItem";

export function useContacts() {
  const { 
    data: contacts = [], 
    isLoading,
    error
  } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // Recent contacts might be a subset or most frequently used contacts
  const recentContacts = contacts.slice(0, 5);
  
  return {
    contacts,
    recentContacts,
    isLoading,
    error
  };
}
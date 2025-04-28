import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  image?: string;
}

interface ContactItemProps {
  contact: Contact;
  onSelect?: (contact: Contact) => void;
  isSelected?: boolean;
}

export default function ContactItem({ 
  contact, 
  onSelect, 
  isSelected 
}: ContactItemProps) {
  const { name, image } = contact;
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(contact);
    }
  };
  
  const getFallbackInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div 
      className={`flex flex-col items-center ${onSelect ? 'cursor-pointer' : ''} ${isSelected ? 'opacity-100' : 'opacity-80'}`}
      onClick={handleClick}
    >
      <Avatar className="w-14 h-14 mb-2">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="bg-primary/20">
          {getFallbackInitials(name)}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs">{name}</p>
    </div>
  );
}

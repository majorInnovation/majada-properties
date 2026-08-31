export type Role = 'buyer' | 'seller'

export type Profile = {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial'
export type ListingType = 'sale' | 'rent'
export type PropertyStatus = 'draft' | 'active' | 'pending' | 'sold'

export type PropertyImage = {
  id: string
  property_id: string
  url: string
  sort_order: number
}

export type Property = {
  id: string
  owner_id: string
  title: string
  description: string
  property_type: PropertyType
  listing_type: ListingType
  price: number
  currency: 'ZMW' | 'USD'
  city: string
  location: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  amenities: string[]
  status: PropertyStatus
  views: number
  created_at: string
  updated_at: string
}

export type PropertyWithRelations = Property & {
  property_images: PropertyImage[]
  owner: Pick<Profile, 'id' | 'full_name' | 'phone' | 'avatar_url' | 'email'> | null
}

export type Conversation = {
  id: string
  property_id: string
  buyer_id: string
  seller_id: string
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

export type ConversationWithMeta = Conversation & {
  property: Pick<Property, 'id' | 'title'> | null
  buyer: Pick<Profile, 'id' | 'full_name'> | null
  seller: Pick<Profile, 'id' | 'full_name'> | null
  messages: Message[]
}

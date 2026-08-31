export type Role = 'buyer' | 'seller'

export type Preferences = {
  // seller notification toggles
  inquiry_email?: boolean
  weekly_summary?: boolean
  platform_news?: boolean
  // buyer notification toggles
  new_listing_alerts?: boolean
  price_drop_alerts?: boolean
  seller_messages?: boolean
  // buyer saved search
  search_city?: string
  search_min_price?: number | null
  search_max_price?: number | null
  search_property_type?: string
  search_min_beds?: number
}

export type Profile = {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  company: string | null
  bio: string | null
  preferences: Preferences
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

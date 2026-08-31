'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createProperty, type NewPropertyInput } from '@/app/actions/properties'

const BUCKET = 'property-images'
const inputClass =
  'w-full rounded-xl border border-border bg-background px-4 py-2.75 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

export function AddPropertyForm() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [pending, startTransition] = useTransition()

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  async function uploadPhotos(): Promise<string[]> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Your session expired. Please sign in again.')

    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setStatus(`Uploading photo ${i + 1} of ${files.length}…`)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || 'image/jpeg' })
      if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`)
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    }
    return urls
  }

  function submit(publish: boolean, formEl: HTMLFormElement) {
    setError('')
    const fd = new FormData(formEl)
    const val = (k: string) => String(fd.get(k) ?? '')

    if (!val('title').trim()) {
      setError('Give the property a title.')
      return
    }
    if (publish && files.length < 5) {
      setError('Please attach at least 5 photos before publishing.')
      return
    }

    startTransition(async () => {
      try {
        const imageUrls = files.length ? await uploadPhotos() : []
        setStatus('Saving listing…')
        const input: NewPropertyInput = {
          title: val('title'),
          description: val('description'),
          propertyType: val('propertyType'),
          listingType: val('listingType'),
          price: Number(val('price')),
          currency: val('currency'),
          city: val('city'),
          location: val('location'),
          bedrooms: Number(val('bedrooms')),
          bathrooms: Number(val('bathrooms')),
          area: Number(val('area')),
          amenities: val('amenities'),
          publish,
          imageUrls,
        }
        const res = await createProperty(input)
        if (res.error) {
          setError(res.error)
          setStatus('')
          return
        }
        router.push('/dashboard')
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
        setStatus('')
      }
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const publish =
          (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publish'
        submit(publish, e.currentTarget)
      }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8"
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}
      {pending && status && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 size={15} className="animate-spin" />
          {status}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
          <span>Property title</span>
          <input name="title" required placeholder="Modern 3-bedroom family home" className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Property type</span>
          <select name="propertyType" defaultValue="house" className={inputClass}>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Listing type</span>
          <select name="listingType" defaultValue="sale" className={inputClass}>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>City</span>
          <input name="city" defaultValue="Lusaka" className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Location / area</span>
          <input name="location" placeholder="Ibex Hill" className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Price</span>
          <input name="price" type="number" min={0} placeholder="3850000" className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Currency</span>
          <select name="currency" defaultValue="ZMW" className={inputClass}>
            <option value="ZMW">ZMW</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Bedrooms</span>
          <input name="bedrooms" type="number" min={0} defaultValue={3} className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Bathrooms</span>
          <input name="bathrooms" type="number" min={0} defaultValue={2} className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Area (m²)</span>
          <input name="area" type="number" min={0} defaultValue={180} className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
          <span>Amenities (comma separated)</span>
          <input name="amenities" placeholder="Double garage, Backup power, Secure compound" className={inputClass} />
        </label>

        <label className="space-y-2 text-sm font-medium text-foreground lg:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            rows={5}
            placeholder="Describe the property, features, and key highlights..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="lg:col-span-2">
          <label className="space-y-3 text-sm font-medium text-foreground">
            <span>Property photos (at least 5 to publish)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="w-full rounded-xl border border-dashed border-border bg-background px-4 py-4 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
            />
          </label>
          {previews.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {previews.map((p, i) => (
                <img key={i} src={p} alt={`Preview ${i + 1}`} className="h-24 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{files.length} photo(s) selected</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : 'Save as draft'}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
          Publish listing
        </button>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Check size={13} className="text-primary" />
        Photos upload straight to secure storage and the listing is tied to your seller account.
      </p>
    </form>
  )
}

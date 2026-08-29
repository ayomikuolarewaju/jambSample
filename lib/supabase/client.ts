import { createBrowserClient } from '@supabase/ssr'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'


export async function createClient(): Promise<SupabaseClient> {

const client = createBrowserClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

)


;(client as any).then = (onfulfilled: any, onrejected?: any) => {

try {

const res = onfulfilled ? onfulfilled(client) : client

return Promise.resolve(res)

} catch (err) {

return Promise.reject(err)

}

}


return client as unknown as Promise<SupabaseClient>

}

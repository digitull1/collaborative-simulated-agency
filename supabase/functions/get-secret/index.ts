import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 204 
    })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { secretName } = await req.json()
    
    if (!secretName) {
      throw new Error('Secret name is required')
    }

    const secret = Deno.env.get(secretName)
    if (!secret) {
      console.error(`Secret ${secretName} not found`)
      throw new Error(`Secret ${secretName} not found`)
    }

    return new Response(
      JSON.stringify({
        secret,
        status: 'success'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error.message)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      },
    )
  }
})
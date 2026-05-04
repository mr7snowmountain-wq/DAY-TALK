import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const secret  = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  // Vérification signature HMAC
  const signature = req.headers['x-signature']
  const hmac      = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (hmac !== signature) {
    console.error('[DayTalk webhook] Signature invalide')
    return res.status(401).json({ error: 'Signature invalide' })
  }

  const event = JSON.parse(rawBody.toString())
  const eventName = event?.meta?.event_name

  // On réagit uniquement aux commandes validées
  if (eventName === 'order_created' || eventName === 'subscription_created') {
    const userId = event?.meta?.custom_data?.user_id

    if (!userId) {
      console.error('[DayTalk webhook] user_id manquant dans custom_data')
      return res.status(400).json({ error: 'user_id manquant' })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase
      .from('dt_profiles')
      .update({ is_premium: true, premium_since: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.error('[DayTalk webhook] Erreur Supabase:', error.message)
      return res.status(500).json({ error: 'Erreur base de données' })
    }

    console.log('[DayTalk webhook] Premium activé pour', userId)
  }

  return res.status(200).json({ received: true })
}

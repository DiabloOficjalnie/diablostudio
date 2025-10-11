/**
 * Patch blog_posts.featured_image to a valid path for posts that have missing or invalid images.
 * Usage: node scripts/patch-blog-images.js
 */
const { createClient } = require('@supabase/supabase-js')

// WARNING: uses service role key present in local dev only. Do NOT commit secrets.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epujffkujstgprcamgpi.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

async function run() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const fallback = '/assets/hero-header.png'

  console.log('Patching blog_posts.featured_image to a valid path when missing/invalid...')

  // Fetch posts with missing/invalid images
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, featured_image')
    .or('featured_image.is.null,featured_image.eq.,featured_image.ilike./images/%')

  if (error) {
    console.error('Error selecting posts:', error)
    process.exit(1)
  }

  if (!posts || posts.length === 0) {
    console.log('No posts require patching.')
    process.exit(0)
  }

  // Update each post to fallback image
  for (const p of posts) {
    const { error: upErr } = await supabase
      .from('blog_posts')
      .update({ featured_image: fallback })
      .eq('id', p.id)

    if (upErr) {
      console.error(`Failed updating post ${p.slug}:`, upErr)
    } else {
      console.log(`Updated post ${p.slug} -> featured_image: ${fallback}`)
    }
  }

  console.log('Done.')
}

run().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/tmp-card')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { generateJobCardImage } = await import('@/lib/social-image.server')
        try {
          const png = await generateJobCardImage({
            title: 'Senior Naval Architect',
            department: 'Engineering',
            location: 'Piraeus, Greece',
            origin: new URL(request.url).origin,
          })
          return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } })
        } catch (e) {
          return new Response(String(e), { status: 500 })
        }
      },
    },
  },
})

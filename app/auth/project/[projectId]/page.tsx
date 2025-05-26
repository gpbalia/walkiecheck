import { Metadata } from 'next'

interface Props {
  params: {
    projectId: string
  }
}

export const metadata: Metadata = {
  title: 'Project Details - WalkieCheck',
}

// This is required for static site generation with dynamic routes
export function generateStaticParams() {
  // For now, we'll pre-render a demo project
  return [
    { projectId: 'demo' }
  ]
}

export default async function ProjectPage({ params }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Project: {params.projectId}</h1>
    </main>
  )
}

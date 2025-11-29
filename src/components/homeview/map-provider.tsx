import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />
})

export default MapComponent

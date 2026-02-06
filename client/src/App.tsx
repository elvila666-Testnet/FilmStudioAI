import { useEffect, useState } from 'react'
import axios from 'axios'

interface ApiStatus {
  status: string
  timestamp: string
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await axios.get('/api/health')
        setApiStatus(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to connect to API')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkApi()
    const interval = setInterval(checkApi, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <h1 className="text-2xl font-bold text-white">AI Film Studio</h1>
            </div>
            <div className="text-white text-sm opacity-75">
              {apiStatus ? '✅ Online' : '⏳ Connecting...'}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hero Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-5xl font-bold text-white mb-4">
                Create Professional Films with AI
              </h2>
              <p className="text-xl text-white text-opacity-90">
                Transform your ideas into stunning visual content using advanced AI technology. From concept to final cut, we've got you covered.
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition transform hover:scale-105">
                Get Started
              </button>
              <button className="w-full bg-purple-500 bg-opacity-30 text-white font-bold py-3 px-6 rounded-lg border border-white border-opacity-30 hover:bg-opacity-40 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
            <h3 className="text-2xl font-bold text-white mb-6">System Status</h3>

            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4">
                <p className="text-red-200">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <span className="text-white">API Status</span>
                  <span className="text-green-400 font-bold">✓ {apiStatus?.status}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <span className="text-white">Server Time</span>
                  <span className="text-blue-200 text-sm">
                    {apiStatus?.timestamp ? new Date(apiStatus.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                  <span className="text-white">Deployment</span>
                  <span className="text-green-400 font-bold">✓ Active</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white border-opacity-20">
              <h4 className="text-white font-bold mb-3">Features</h4>
              <ul className="space-y-2 text-white text-opacity-80 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Content Analysis & Ingestion</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Script Generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Storyboard Creation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Video Composition</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📝', title: 'Smart Scripts', desc: 'AI-powered script generation' },
            { icon: '🎨', title: 'Visual Design', desc: 'Professional storyboard creation' },
            { icon: '🎥', title: 'Video Editing', desc: 'Automated video composition' },
          ].map((feature, i) => (
            <div key={i} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-white text-opacity-70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-black bg-opacity-30 border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white text-opacity-60 text-sm">
            <p>AI Film Studio v1.0 | Powered by Cloud Run</p>
            <p className="mt-2">API Endpoint: <code className="bg-black bg-opacity-30 px-2 py-1 rounded">/api/health</code></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

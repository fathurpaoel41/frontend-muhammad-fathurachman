import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">Terjadi Kesalahan</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Oops! Terjadi Kesalahan Teknis
                </h3>
                
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Terjadi kesalahan yang tidak terduga pada aplikasi. 
                  Silakan muat ulang halaman atau hubungi administrator jika masalah berlanjut.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-gray-100 rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs text-gray-700 font-mono">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-orange-600 focus:ring-4 focus:ring-red-200 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Muat Ulang Halaman</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 
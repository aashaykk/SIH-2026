/** Shows live/offline indicator for Socket.IO status */
interface Props { isConnected: boolean }

export function ConnectionIndicator({ isConnected }: Props) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      {isConnected ? 'Live' : 'Offline'}
    </div>
  )
}

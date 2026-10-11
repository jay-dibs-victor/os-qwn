import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Initialize Socket.IO connection to analytics gateway
 * @param token JWT access token for authentication
 * @returns Socket instance
 */
export function initializeSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  socket = io(`${apiUrl}/analytics`, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('✅ Connected to analytics gateway')
  })

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from analytics gateway')
  })

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error)
  })

  socket.on('connected', (data) => {
    console.log('📡 Analytics gateway ready:', data)
  })

  return socket
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Subscribe to metrics updates
 */
export function subscribeToMetrics(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:metrics', filters || {})
  socket.on('metrics:update', callback)
}

/**
 * Subscribe to revenue chart updates
 */
export function subscribeToRevenueChart(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:revenue', filters || {})
  socket.on('revenue:update', callback)
}

/**
 * Subscribe to loans chart updates
 */
export function subscribeToLoansChart(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:loans', filters || {})
  socket.on('loans:update', callback)
}

/**
 * Subscribe to customers chart updates
 */
export function subscribeToCustomersChart(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:customers', filters || {})
  socket.on('customers:update', callback)
}

/**
 * Subscribe to drivers chart updates
 */
export function subscribeToDriversChart(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:drivers', filters || {})
  socket.on('drivers:update', callback)
}

/**
 * Subscribe to partners chart updates
 */
export function subscribeToPartnersChart(
  callback: (data: any) => void,
  filters?: { year?: string; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:partners', filters || {})
  socket.on('partners:update', callback)
}

/**
 * Subscribe to transactions updates
 */
export function subscribeToTransactions(
  callback: (data: any) => void,
  filters?: { limit?: number; startDate?: string; endDate?: string },
): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('subscribe:transactions', filters || {})
  socket.on('transactions:update', callback)
}

/**
 * Listen for new transactions
 */
export function onNewTransaction(callback: (data: any) => void): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.on('transaction:new', callback)
}

/**
 * Unsubscribe from all events
 */
export function unsubscribeAll(): void {
  if (!socket) return

  socket.off('metrics:update')
  socket.off('revenue:update')
  socket.off('loans:update')
  socket.off('customers:update')
  socket.off('drivers:update')
  socket.off('partners:update')
  socket.off('transactions:update')
  socket.off('transaction:new')
}

/**
 * Unsubscribe from specific event
 */
export function unsubscribe(event: string): void {
  if (!socket) return
  socket.off(event)
}

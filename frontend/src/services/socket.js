import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (!this.socket) {
      console.log('🔌 Connecting to socket:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.connected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        this.connected = false;
        
        // Don't log error for intentional disconnects
        if (reason === 'io client disconnect' || reason === 'io server disconnect') {
          console.log('ℹ️ Intentional disconnect');
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('⚠️ Max reconnection attempts reached');
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
        this.connected = true;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error.message);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinPoll(pollId) {
    if (this.socket && this.connected) {
      console.log('📊 Joining poll room:', pollId);
      this.socket.emit('joinPoll', pollId);
    } else {
      console.warn('⚠️ Socket not connected, cannot join poll');
    }
  }

  leavePoll(pollId) {
    if (this.socket && this.connected) {
      console.log('🚪 Leaving poll room:', pollId);
      this.socket.emit('leavePoll', pollId);
    }
  }

  onVoteUpdate(callback) {
    if (this.socket) {
      console.log('👂 Listening for vote updates');
      this.socket.on('voteUpdate', callback);
    }
  }

  offVoteUpdate() {
    if (this.socket) {
      console.log('🔇 Stopped listening for vote updates');
      this.socket.off('voteUpdate');
    }
  }

  emitNewVote(pollId, voteData) {
    if (this.socket && this.connected) {
      console.log('📤 Emitting new vote for poll:', pollId);
      this.socket.emit('newVote', { pollId, ...voteData });
    } else {
      console.warn('⚠️ Socket not connected, cannot emit vote');
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

const socketService = new SocketService();

export default socketService;

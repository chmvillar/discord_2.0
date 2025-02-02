document.addEventListener('DOMContentLoaded', () => {
    /**************************************
     * Funcionalidad del Chat Tradicional
     **************************************/
    // Referencias de elementos del chat
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const newChannelBtn = document.getElementById('newChannelBtn');
    const channelList = document.getElementById('channelList');
    const chatTitle = document.getElementById('chatTitle');
    const clearBtn = document.getElementById('clearBtn');
  
    // Referencias para el modal de crear canal
    const modal = document.getElementById('modal');
    const modalChannelName = document.getElementById('modalChannelName');
    const modalCreate = document.getElementById('modalCreate');
    const modalCancel = document.getElementById('modalCancel');
  
    // Referencias para el modal de limpiar chat
    const clearModal = document.getElementById('clearModal');
    const modalClearConfirm = document.getElementById('modalClearConfirm');
    const modalClearCancel = document.getElementById('modalClearCancel');
  
    let currentChannel = '';
    let channels = [];
  
    // Funciones para gestionar canales en localStorage
    function saveChannels() {
      localStorage.setItem('channels', JSON.stringify(channels));
    }
    function loadChannels() {
      const stored = localStorage.getItem('channels');
      if (stored) {
        channels = JSON.parse(stored);
      } else {
        channels = ['general', 'aleatorio', 'ayuda'];
        saveChannels();
      }
    }
  
    // Funciones para mensajes
    function saveMessages(channel, messages) {
      localStorage.setItem(`chat_${channel}`, JSON.stringify(messages));
    }
    function loadMessages(channel) {
      const msgs = localStorage.getItem(`chat_${channel}`);
      return msgs ? JSON.parse(msgs) : [];
    }
    function renderMessages(channel) {
      messagesContainer.innerHTML = '';
      const msgs = loadMessages(channel);
      msgs.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
  
        const userSpan = document.createElement('span');
        userSpan.classList.add('user');
        userSpan.textContent = `${msg.user}: `;
  
        const textSpan = document.createElement('span');
        textSpan.classList.add('text');
        textSpan.textContent = msg.text;
  
        messageEl.appendChild(userSpan);
        messageEl.appendChild(textSpan);
        messagesContainer.appendChild(messageEl);
      });
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  
    // Cambiar canal activo con efecto fade
    function setActiveChannel(liElement, channelName) {
      document.querySelectorAll('.channel').forEach(item => item.classList.remove('active'));
      liElement.classList.add('active');
      currentChannel = channelName;
      chatTitle.textContent = channelName;
      messagesContainer.style.opacity = 0;
      setTimeout(() => {
        renderMessages(channelName);
        messagesContainer.style.opacity = 1;
      }, 300);
    }
  
    // Asignar eventos a cada canal (seleccionar y borrar)
    function attachChannelListeners(li) {
      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        setActiveChannel(li, li.dataset.channel);
      });
      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const channelName = li.dataset.channel;
        if (confirm(`¿Estás seguro de eliminar el canal # ${channelName}?`)) {
          localStorage.removeItem(`chat_${channelName}`);
          li.remove();
          channels = channels.filter(ch => ch !== channelName);
          saveChannels();
          if (currentChannel === channelName) {
            const remainingChannel = document.querySelector('.channel');
            if (remainingChannel) {
              setActiveChannel(remainingChannel, remainingChannel.dataset.channel);
            } else {
              currentChannel = '';
              chatTitle.textContent = '';
              messagesContainer.innerHTML = '';
            }
          }
        }
      });
    }
  
    // Crear elemento <li> para un canal
    function createChannelListItem(channelName) {
      const li = document.createElement('li');
      li.classList.add('channel');
      li.setAttribute('data-channel', channelName);
  
      const spanName = document.createElement('span');
      spanName.classList.add('channel-name');
      spanName.textContent = `# ${channelName}`;
  
      const deleteBtn = document.createElement('span');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.textContent = 'X';
  
      li.appendChild(spanName);
      li.appendChild(deleteBtn);
  
      attachChannelListeners(li);
      return li;
    }
  
    // Renderizar la lista de canales
    function renderChannels() {
      channelList.innerHTML = '';
      channels.forEach(channelName => {
        const li = createChannelListItem(channelName);
        channelList.appendChild(li);
      });
    }
  
    // Modal para crear canal
    function showModal() {
      modal.classList.add('show');
      modalChannelName.value = '';
      modalChannelName.focus();
    }
    function hideModal() {
      modal.classList.remove('show');
    }
  
    // Modal para limpiar chat
    function showClearModal() {
      clearModal.classList.add('show');
    }
    function hideClearModal() {
      clearModal.classList.remove('show');
    }
  
    // Inicialización de canales y selección del primero
    loadChannels();
    renderChannels();
    const firstChannelItem = document.querySelector('.channel');
    if (firstChannelItem) {
      firstChannelItem.classList.add('active');
      currentChannel = firstChannelItem.dataset.channel;
      chatTitle.textContent = currentChannel;
      renderMessages(currentChannel);
    }
  
    // Envío de mensajes
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text !== '' && currentChannel) {
          const newMsg = { user: 'Tú', text: text };
          let msgs = loadMessages(currentChannel);
          msgs.push(newMsg);
          saveMessages(currentChannel, msgs);
  
          const messageEl = document.createElement('div');
          messageEl.classList.add('message');
  
          const userSpan = document.createElement('span');
          userSpan.classList.add('user');
          userSpan.textContent = 'Tú: ';
  
          const textSpan = document.createElement('span');
          textSpan.classList.add('text');
          textSpan.textContent = text;
  
          messageEl.appendChild(userSpan);
          messageEl.appendChild(textSpan);
          messagesContainer.appendChild(messageEl);
  
          messageInput.value = '';
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    });
  
    // Eventos para el Modal de Crear Canal
    newChannelBtn.addEventListener('click', showModal);
    modalCancel.addEventListener('click', hideModal);
    modalCreate.addEventListener('click', () => {
      const channelName = modalChannelName.value.trim();
      if (channelName) {
        if (channels.includes(channelName)) {
          alert('El canal ya existe.');
          return;
        }
        channels.push(channelName);
        saveChannels();
        const newChannelItem = createChannelListItem(channelName);
        channelList.appendChild(newChannelItem);
        hideModal();
      }
    });
    modalChannelName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') modalCreate.click();
    });
  
    // Eventos para el Modal de Limpiar Chat
    clearBtn.addEventListener('click', showClearModal);
    modalClearCancel.addEventListener('click', hideClearModal);
    modalClearConfirm.addEventListener('click', () => {
      if (currentChannel) {
        localStorage.removeItem(`chat_${currentChannel}`);
        messagesContainer.innerHTML = '';
        hideClearModal();
      }
    });
  
    /**************************************
     * Integración del Chat de Voz con PeerJS
     **************************************/
    const voiceChatBtn = document.getElementById('voiceChatBtn');
    const voiceChatModal = document.getElementById('voiceChatModal');
    const voiceModalClose = document.getElementById('voiceModalClose');
    const myVoicePeerIdSpan = document.getElementById('myVoicePeerId');
    const remoteVoicePeerIdInput = document.getElementById('remoteVoicePeerId');
    const voiceCallButton = document.getElementById('voiceCallButton');
    const remoteVoiceAudio = document.getElementById('remoteVoiceAudio');
  
    let voiceStream = null;
    const voicePeer = new Peer();
  
    // Al abrir la conexión de voz, asignar el ID
    voicePeer.on('open', id => {
      myVoicePeerIdSpan.textContent = id;
    });
  
    // Solicitar acceso al micrófono para el chat de voz
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        voiceStream = stream;
        // Atender llamadas entrantes en chat de voz
        voicePeer.on('call', call => {
          call.answer(voiceStream);
          call.on('stream', remoteStream => {
            remoteVoiceAudio.srcObject = remoteStream;
            remoteVoiceAudio.play().catch(err => console.error('Error al reproducir audio:', err));
          });
        });
      })
      .catch(err => {
        console.error('Error accediendo al micrófono para chat de voz:', err);
        alert('No se pudo acceder al micrófono para el chat de voz. Verifica los permisos.');
      });
  
    // Funciones para mostrar y ocultar el modal de chat de voz
    function showVoiceChatModal() {
      voiceChatModal.classList.add('show');
    }
    function hideVoiceChatModal() {
      voiceChatModal.classList.remove('show');
    }
  
    voiceChatBtn.addEventListener('click', showVoiceChatModal);
    voiceModalClose.addEventListener('click', hideVoiceChatModal);
  
    // Iniciar una llamada de voz
    voiceCallButton.addEventListener('click', () => {
      const remoteId = remoteVoicePeerIdInput.value.trim();
      if (!remoteId) {
        alert('Por favor, ingresa el ID del interlocutor para la llamada de voz.');
        return;
      }
      const call = voicePeer.call(remoteId, voiceStream);
      call.on('stream', remoteStream => {
        remoteVoiceAudio.srcObject = remoteStream;
        remoteVoiceAudio.play().catch(err => console.error('Error al reproducir audio:', err));
      });
      call.on('error', err => {
        console.error('Error durante la llamada de voz:', err);
        alert('Error en la llamada de voz. Verifica el ID e inténtalo nuevamente.');
      });
    });
  });
  
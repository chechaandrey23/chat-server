class Chat {
  #socket = null;
  #users;

  constructor(socket, users) {
    this.#socket = socket;
    this.#users = users;
  }

  #isStart = false;
  #discFn;
  #username = null;
  #autoId = 1;

	bindFetch() {
		this.#socket.on('start', () => {
			if(this.#isStart) return;console.log('start:'+this.#username);
			this.#isStart = true;
			if(!this.#username) {
        setTimeout(() => {this.#socket.emit('chat-start', {error: true, value: this.#username});}, 1000);
      }
      this.#socket.on('disconnect', (this.#discFn = () => {console.log('disconnect:'+this.#username);
        const index = this.#users.indexOf(this.#username);
        this.#users.splice(index, 1);
        setTimeout(() => {this.#socket.emit('chat-stop', true);}, 1000);
        setTimeout(() => {this.#socket.broadcast.emit("leave-user", {value: this.#username});}, 1000);
      }));
      setTimeout(() => {this.#socket.emit('chat-start', true);}, 1000);
      setTimeout(() => {this.#socket.broadcast.emit("add-user", {value: this.#username});}, 1000);
		});
	}

	unBindFetch() {
		this.#socket.on('stop', () => {console.log('stop:'+this.#username);
			this.#isStart = false;
      this.#username = null;
			if(this.#discFn) this.#socket.off('disconnect', this.#discFn);
      const index = this.#users.indexOf(this.#username);
      this.#users.splice(index, 1);
			setTimeout(() => {this.#socket.emit('chat-stop', true);}, 1000);
      setTimeout(() => {this.#socket.broadcast.emit("leave-user", {value: this.#username});}, 1000);
		});
	}

  bindAddMessage() {
		this.#socket.on('add-message', (message) => {
      if(!this.#username) {
        setTimeout(() => {this.#socket.emit('add-message', {error: true, value: this.#username, message: 'Not Username'});}, 1000);
      } else if(!message || typeof message !== 'string' || message.length < 1) {
        setTimeout(() => {this.#socket.emit('add-message', {error: true, value: message, message: 'Incorrect message'});}, 1000);
      } else if(message.length > 256) {
        setTimeout(() => {this.#socket.emit('add-message', {error: true, value: message, message: 'Message text exceeds 256 characters'});}, 1000);
      } else {
        const messageObj = {id: this.#autoId, username: this.#username, message: message, date: Date.now()};
        this.#autoId++;
        console.log(messageObj);
        setTimeout(() => {this.#socket.emit("add-message", {value: messageObj});}, 1000);
        setTimeout(() => {this.#socket.broadcast.emit("add-message", {value: messageObj});}, 1000);
      }
		});
	}

  bindCreateUsername() {
    this.#socket.on('create-user', (username) => {
      if(!username || typeof username !== 'string' || username.length < 5) {
        setTimeout(() => {this.#socket.emit('create-user', {error: true, value: username, message: 'Incorrect username'});}, 1000);
      } else if(username.length > 15) {
        setTimeout(() => {this.#socket.emit('create-user', {error: true, value: username, message: 'Username text exceeds 15 characters'});}, 1000);
      } else if(this.#users.indexOf(username) > -1) {
        setTimeout(() => {this.#socket.emit('create-user', {error: true, value: username, message: 'user named "'+username+'" already exists'});}, 1000);
      } else {
        this.#username = username;
        this.#users.push(username);
        setTimeout(() => {this.#socket.emit("create-user", {value: username});}, 1000);
      }
    });
  }

  bindUpdateUsername() {
    this.#socket.on('update-username', (username) => {
      if(!this.#username) {
        setTimeout(() => {this.#socket.emit('update-username', {error: true, value: this.#username, message: 'Not Username'});}, 1000);
      } else if(!username || typeof username !== 'string' || username.length < 5) {
        setTimeout(() => {this.#socket.emit('update-username', {error: true, value: username, message: 'Incorrect username'});}, 1000);
      } else if(username.length > 15) {
        setTimeout(() => {this.#socket.emit('update-username', {error: true, value: username, message: 'Username text exceeds 15 characters'});}, 1000);
      } else if(this.#users.indexOf(username) > -1) {
        setTimeout(() => {this.#socket.emit('update-username', {error: true, value: username, message: 'user named "'+username+'" already exists'});}, 1000);
      } else {
        const oldUsername = this.#username;
        this.#username = username;
        const index = this.#users.indexOf(oldUsername);
        this.#users.splice(index, 1, username);
        setTimeout(() => {this.#socket.emit("update-username", {value: username});}, 1000);
        setTimeout(() => {this.#socket.emit("update-message-username", {value: username, oldUsername: oldUsername});}, 1000);
        setTimeout(() => {this.#socket.broadcast.emit("update-message-username", {value: username, oldUsername: oldUsername});}, 1000);
      }
    });
  }
}

class ChatError extends Error {}

export default Chat;

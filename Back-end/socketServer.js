let users = []



const SocketServer = (socket) => {
    // Connect - Disconnect
    socket.on('joinUser', user => {
        console.log('socket join user');
        users.push({ id: user._id, socketId: socket.id, followers: user.followers })
    })

    socket.on('disconnect', () => {
        console.log('disconnect');
        const data = users.find(user => user.socketId === socket.id)
        if (data) {
            const clients = users.filter(user =>
                data.followers.find(item => item._id === user.id)
            )

            if (clients.length > 0) {
                clients.forEach(client => {
                    socket.to(`${client.socketId}`).emit('CheckUserOffline', data.id)
                })
            }

            if (data.call) {
                const callUser = users.find(user => user.id === data.call)
                if (callUser) {
                    users = EditData(users, callUser.id, null)
                    socket.to(`${callUser.socketId}`).emit('callerDisconnect')
                }
            }
        }

        users = users.filter(user => user.socketId !== socket.id)
    })


    // Likes
    socket.on('likePost', newPost => {

        // console.log('likepost')
        // console.log(newPost);
        const ids = [...newPost.user.followers, newPost.user._id]
        // console.log('***');
        // console.log(users, '---');
        // console.log(ids, '///');
        const clients = users.filter(user =>
            ids.includes(user.id)
        );

        // console.log(clients, '++');
        if (clients.length > 0) {
            // console.log('liketoclient');
            clients.forEach(client => {
                // console.log('++', client);
                socket.to(`${client.socketId}`).emit('likeToClient', newPost)
            })
        }
    })

    socket.on('unLikePost', newPost => {
        const ids = [...newPost.user.followers, newPost.user._id]
        const clients = users.filter(user => ids.includes(user.id))

        if (clients.length > 0) {
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('unLikeToClient', newPost)
            })
        }
    })


    // Comments
    socket.on('createComment', newPost => {
        const ids = [...newPost.user.followers, newPost.user._id]
        const clients = users.filter(user => ids.includes(user.id))

        if (clients.length > 0) {
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('createCommentToClient', newPost)
            })
        }
    })

    socket.on('deleteComment', newPost => {
        const ids = [...newPost.user.followers, newPost.user._id]
        const clients = users.filter(user => ids.includes(user.id))

        if (clients.length > 0) {
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('deleteCommentToClient', newPost)
            })
        }
    })


    // Follow
    socket.on('follow', newUser => {
        console.log('follow socket');
        // console.log(newUser, '+++');
        const user = users.find(user => user.id === newUser._id)
        // console.log(user, '***');
        if (user) {
            socket.to(`${user.socketId}`).emit('followToClient', newUser)
        }
        // else{
        //     socket.to(`${newUser.socketId}`).emit('followToClient', newUser)
        // }
    })

    socket.on('unFollow', newUser => {
        console.log('unfollow socket');
        const user = users.find(user => user.id === newUser._id)
        user && socket.to(`${user.socketId}`).emit('unFollowToClient', newUser)
    })


    // Notification
    socket.on('createNotify', msg => {
        console.log('socket createNotify');
        // console.log(msg);
        // console.log(msg.recipients);
        const client = users.find(user =>
            msg.recipients.includes(user.id)
        )

        // console.log(client);

        client && socket.to(`${client.socketId}`).emit('createNotifyToClient', msg)
    })

    socket.on('removeNotify', msg => {
        const client = users.find(user => msg.recipients.includes(user.id))
        client && socket.to(`${client.socketId}`).emit('removeNotifyToClient', msg)
    })


    // Message
    socket.on('addMessage', msg => {
        console.log('socket add message');
        // console.log(msg, '+++');
        const user = users.find(user => user.id === msg.recipient)
        // console.log(user, '--');
        user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg)
    })



    // Check User Online / Offline
    socket.on('checkUserOnline', data => {

        console.log('socket check user online');
        // console.log(data, '+++');
        const following = users.filter(user =>
            data.following.find(item => item._id === user.id)
        )

        // console.log(following, '---');
        socket.emit('checkUserOnlineToMe', following)

        const clients = users.filter(user =>
            data.followers.find(item => item._id === user.id)
        )

        // console.log(clients, '***');
        if (clients.length > 0) {
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('checkUserOnlineToClient', data._id)
            })
        }
    })

    const EditData = (data, id, call) => {
        const newData = data.map(item =>
            item.id === id ? { ...item, call } : item
        )
        return newData;
    }
    // Call User
    socket.on('callUser', data => {
        console.log('socket call user');
        console.log(data, '++++');
        users = EditData(users, data.sender, data.recipient)

        console.log(users, '---');
        const client = users.find(user => user.id === data.recipient)
        console.log(client, '***');
        if (client) {
            if (client.call) {
                socket.emit('userBusy', data)
                users = EditData(users, data.sender, null)
            } else {
                users = EditData(users, data.recipient, data.sender)
                socket.to(`${client.socketId}`).emit('callUserToClient', data)
            }
        }
    })

    socket.on('endCall', data => {
        console.log('socket call user');
        console.log(data, '++++');
        const client = users.find(user => user.id === data.sender)
        console.log(client, '***');

        if (client) {
            socket.to(`${client.socketId}`).emit('endCallToClient', data)
            users = EditData(users, client.id, null)

            if (client.call) {
                const clientCall = users.find(user => user.id === client.call)
                clientCall && socket.to(`${clientCall.socketId}`).emit('endCallToClient', data)

                users = EditData(users, client.call, null)
            }
        }
    })
}

export default SocketServer;
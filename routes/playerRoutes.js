const mongoose = require('mongoose');
const Player = mongoose.model("Players");
const bcrypt = require('bcrypt');

module.exports = app => {

app.get('/players', async (req, res) => {
    const {name,surname,username,password} = req.query;

    if(!name || !surname || !username || !password){
        res.status(400)
        throw new Error('Please incude all fields!')
    }

    const playerExists = await Player.findOne({username})

    if(playerExists) {
        res.status(400)
        console.log('Player exists')
        throw new Error('This player already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const player = await Player.create({
        name,
        surname,
        username,
        password: hashedPassword,

        lastAuthentication: Date.now()
    })

    if(player) {
        res.status(201).json({
            _id: player._id,
            name: player.name,
            surname: player.surname,
            username: player.username,
            password: player.password,
        })
    } else{
        res.status(400)
        console.log('Invalid')
        throw new error('Invalid player data')
    }
});

app.post('/signin', async (req, res) => {
    const {username, password} = req.body;
    console.log("here it is the body", req.body)

    if(!username || !password){
        res.status(400)
        throw new Error('Please include all fields!')
    }

    const player = await Player.findOne({username})

    if(player && await bcrypt.compare(password, player.password)) {
        res.status(200).json({
            _id: player._id,
            name: player.name,
            surname: player.surname,
            username: player.username,
            password: player.password,
            lastAuthentication: player.lastAuthentication
        });
    } else {
        res.status(401)
        throw new Error('Invalid username or password')
    }
});

}
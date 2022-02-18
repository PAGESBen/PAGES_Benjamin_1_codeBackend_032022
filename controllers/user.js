const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//création d'un utilisateur
exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
               email : req.body.email,
               password : hash
            }); 
            user.save()
                .then( () => res.status(201).json({message : "utilisateur créé avec succès !"}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

//login utilisateur
exports.userLogin = (req, res, next) => {
    User.findOne({ email : req.body.email })
        .then( user => {
            if (!user) {
                return res.status(401).json({ message : 'utilisateur introuvable !'})
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid){
                        return res.status(401).json({ message : 'mot de passe incorrect !'})
                    }
                    res.status(200).json({
                        userId : user._id,
                        token : jwt.sign(
                            { userId : user._id }, 
                            process.env.TOKEN_KEY,
                            { expiresIn : '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
}
